import { Router } from "express";
import crypto from "node:crypto";
import { getUserByEmail, insertUser, setUserDefaultVault } from "../store/users";
import { REFRESH_TOKEN_HASH_SECRET, SESSION_JWT_SECRET } from "../config";
import { insertSession, getSessionById } from "../store/sessions";
import jwt from "jsonwebtoken";
import { Session } from "../types";
import { getUserVaults, insertVault } from "../store/vaults";

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
		// Create the user
		const userId = await insertUser(email, authKeyHash.toString("hex"), serverSalt.toString("hex"), encryptedKey, iv, authTag);
		try {
			// Create a default vault to the user
			const vaultId = await insertVault(userId, "Vault");
			try {
				// Set the default vault for the user
				await setUserDefaultVault(userId, vaultId);
			} catch (e) {
				return res.status(500).json({ error: e });
			}
		} catch (e) {
			return res.status(500).json({ error: e });
		}
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
		res.status(403).json({ error: "Unknown email" });
		return;
	}

	const authKeyHash = crypto.argon2Sync("argon2id", { message: Buffer.from(authKey, "hex"), nonce: Buffer.from(user.serverSalt, "hex"), parallelism: 4, tagLength: 32, memory: 8192, passes: 3 });

	if (!crypto.timingSafeEqual(authKeyHash, Buffer.from(user.authKeyHash, "hex"))) {
		console.log(`Wrong masterPassword trying to log into user with email ${email}`);
		res.status(403).json({ error: "Wrong credentials" });
		return;
	}

	const refreshKey = crypto.randomBytes(32);
	const hash = crypto.createHmac("sha256", REFRESH_TOKEN_HASH_SECRET).update(refreshKey);
	const sessionKeyHash = hash.digest("hex");

	const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
	const sessionExpiration = BigInt(Date.now() + ONE_WEEK_MS);

	let sessionId;
	try {
		sessionId = await insertSession(user.id, sessionKeyHash, sessionExpiration);
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	const session: Session = {
		id: sessionId,
		userId: user.id,
		keyHash: sessionKeyHash,
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

	const vaults = await getUserVaults(user.id);

	// TODO: Maybe the email should also be filtered away as it might be seen as sensitive
	const { authKeyHash: _, serverSalt: __, ...userWithoutSensitiveData } = user;
	res.json({ user: userWithoutSensitiveData, accessToken, refreshKey: refreshKey.toString("hex"), vaults });
});

router.post("/refresh", async (req, res) => {
	const { refreshKey, sessionId: sessionIdRaw } = req.body;

	if (typeof refreshKey !== "string" || !refreshKey || sessionIdRaw === undefined) {
		res.status(400).json({ error: "Missing refreshKey or sessionId" });
		return;
	}

	let sessionId: bigint;
	try {
		sessionId = BigInt(sessionIdRaw);
	} catch {
		res.status(400).json({ error: "Invalid sessionId" });
		return;
	}

	let session;
	try {
		session = await getSessionById(sessionId);
	} catch {
		res.status(500).json({ error: "Something went wrong" });
		return;
	}

	if (!session) {
		res.status(401).json({ error: "Invalid session" });
		return;
	}

	// TODO: Maybe delete the session if it is expired
	if (session.expiration <= BigInt(Date.now())) {
		res.status(401).json({ error: "Session expired" });
		return;
	}

	const incomingHash = crypto.createHmac("sha256", REFRESH_TOKEN_HASH_SECRET).update(Buffer.from(refreshKey, "hex")).digest();
	const storedHash = Buffer.from(session.keyHash, "hex");

	if (incomingHash.length !== storedHash.length || !crypto.timingSafeEqual(incomingHash, storedHash)) {
		res.status(401).json({ error: "Invalid session" });
		return;
	}

	const accessToken = jwt.sign({ sessionId: session.id, userId: session.userId }, SESSION_JWT_SECRET, { expiresIn: "15m" });

	res.json({ accessToken });
});

export default router;
