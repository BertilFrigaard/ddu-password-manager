import { Router } from "express";
import crypto from "node:crypto";
import { getUserByEmail, insertUser } from "../store/users";
import { REFRESH_TOKEN_HASH_SECRET, SESSION_JWT_SECRET } from "../config";
import { insertSession } from "../store/sessions";
import jwt from "jsonwebtoken";
import { Session } from "../types";

const router = Router();

router.post("/signup", async (req, res) => {
	const { authKey, encryptedKey, iv, authTag, email } = req.body;

	// TODO: Missing input validation

	let user;
	try {
		user = await getUserByEmail(email);
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	if (user) {
		// TODO: Overvej om en generisk fejlbesked er bedre så vi ikke leaker emails
		console.log(`User with email '${email}' already exists`);
		res.status(400).json({ error: "User already exists" });
		return;
	}

	// Use argon2id to hash the recieved authKey
	// Since the authKey is made during an expensive hashing on the client,
	// the server hashing can be cheaper, which is good if the server handles multiple users
	const serverSalt = crypto.randomBytes(16);
	const authKeyHash = crypto.argon2Sync("argon2id", { message: Buffer.from(authKey, "hex"), nonce: serverSalt, parallelism: 4, tagLength: 32, memory: 8192, passes: 3 });

	try {
		await insertUser(email, authKeyHash.toString("hex"), serverSalt.toString("hex"), encryptedKey, iv, authTag);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
	res.sendStatus(201);
});

router.post("/login", async (req, res) => {
	const { authKey, email } = req.body;

	// Missing input validation
	let user;
	try {
		user = await getUserByEmail(email);
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	if (!user) {
		// TODO: Overvej om en generisk fejlbesked er bedre så vi ikke leaker emails
		console.log(`User with email '${email}' dosen't exist`);
		res.status(400).json({ error: "Unknown email" });
		return;
	}

	console.log(user);

	const authKeyHash = crypto.argon2Sync("argon2id", { message: Buffer.from(authKey, "hex"), nonce: Buffer.from(user.serverSalt, "hex"), parallelism: 4, tagLength: 32, memory: 8192, passes: 3 });

	if (!crypto.timingSafeEqual(authKeyHash, Buffer.from(user.authKeyHash, "hex"))) {
		console.log(`Wrong masterPassword trying to log into user with email ${email}`);
		res.status(400).json({ error: "Wrong credentials" });
		return;
	}

	const refreshKey = crypto.randomBytes(32);
	const hash = crypto.createHmac("sha256", REFRESH_TOKEN_HASH_SECRET).update(refreshKey);

	const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
	const sessionExpiration = BigInt(Date.now() + ONE_WEEK_MS);

	let sessionId;
	try {
		sessionId = await insertSession(user.id, hash.digest("hex"), sessionExpiration);
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	const session: Session = {
		id: sessionId,
		userId: user.id,
		keyHash: hash.digest("hex"),
		expiration: sessionExpiration,
	};

	const accessToken = jwt.sign(
		{
			sessionId: session.id,
			userId: user.id,
		},
		SESSION_JWT_SECRET,
		{ expiresIn: "15m" },
	);

	// TODO: Vault missing
	res.json({ user, accessToken, refreshKey: refreshKey.toString("hex") });
});

export default router;
