import { Router } from "express";
import qrcode from "qrcode";
import crypto from "node:crypto";
import { authenticator } from "@otplib/preset-default";
import { deleteUserById, getUserByEmail, insertUser, setUserDefaultVault, setUserTwoFactorCode, setUserTwoFactorEnabled } from "../store/users";
import { REFRESH_TOKEN_HASH_SECRET, SESSION_JWT_SECRET, TWO_FACTOR_AUTH_SYMMETRIC_KEY } from "../config";
import { insertSession, getSessionById } from "../store/sessions";
import jwt from "jsonwebtoken";
import { Session } from "../types";
import { getUserVaults, insertVault } from "../store/vaults";
import { requireAuth } from "../middleware/auth";
import { decrypt, encrypt } from "../services/cryptoService";

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
		console.error(`User with email '${email}' already exists`);
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
			const vaultId = await insertVault(userId, "Vault", false);
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
		console.error(`User with email '${email}' dosen't exist`);
		res.status(403).json({ error: "Unknown email" });
		return;
	}

	const authKeyHash = crypto.argon2Sync("argon2id", { message: Buffer.from(authKey, "hex"), nonce: Buffer.from(user.serverSalt, "hex"), parallelism: 4, tagLength: 32, memory: 8192, passes: 3 });

	if (!crypto.timingSafeEqual(authKeyHash, Buffer.from(user.authKeyHash, "hex"))) {
		console.error(`Wrong masterPassword trying to log into user with email ${email}`);
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
	const { authKeyHash: _, serverSalt: __, twoFactorSecretCiphertext: ___, twoFactorSecretIv: ____, twoFactorSecretTag: _____, ...userWithoutSensitiveData } = user;
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

router.get("/2fa", requireAuth({ attachUser: true }), async (req, res) => {
	if (!res.locals.user) {
		res.status(500).json({ error: "User validated but not attached" });
		return;
	}
	if (res.locals.user.twoFactorEnabled) {
		res.status(409).json({ error: "Account already has 2FA activated" });
		return;
	}

	const secret = authenticator.generateSecret();
	const otpauth = authenticator.keyuri(res.locals.user.email, "DDUManager", secret);
	const qrstring = await qrcode.toDataURL(otpauth);

	const encrypted = encrypt(TWO_FACTOR_AUTH_SYMMETRIC_KEY, secret);
	try {
		await setUserTwoFactorCode(res.locals.user.id, encrypted.encryptedString, encrypted.iv, encrypted.authTag);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Something went wrong" });
		return;
	}

	res.status(201).json({ qrstring });
});

router.post("/2fa", requireAuth({ attachUser: true }), async (req, res) => {
	const { token } = req.body;

	if (!token) {
		res.status(400).json({ error: "Token missing from request " });
		return;
	}

	if (!res.locals.user) {
		res.status(500).json({ error: "Something went wrong" });
		return;
	}

	if (res.locals.user.twoFactorEnabled) {
		res.status(409).json({ error: "Account already has 2FA activated" });
		return;
	}

	const secret = decrypt(TWO_FACTOR_AUTH_SYMMETRIC_KEY, res.locals.user.twoFactorSecretCiphertext, res.locals.user.twoFactorSecretIv, res.locals.user.twoFactorSecretTag);
	const isValid = authenticator.verify({ secret, token });

	if (!isValid) {
		res.status(403).json({ error: "Invalid token. 2FA was not enabled" });
		return;
	}

	try {
		await setUserTwoFactorEnabled(res.locals.user.id, true);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Something went wrong. 2FA was not enabled" });
		return;
	}

	res.sendStatus(201);
});

router.delete("/user", requireAuth({ attachUser: true }), async (req, res) => {
	if (!res.locals.user) {
		console.error("Request passed requireAuth but res.locals.user is not set");
		res.status(500).json({ error: "Something went wrong" });
		return;
	}

	const { token, authKey } = req.body;

	if (res.locals.user.twoFactorEnabled) {
		if (!token) {
			res.status(403).json({ error: "You must delete using 2FA. Submit your 2FA token to confirm" });
			return;
		}

		const secret = decrypt(TWO_FACTOR_AUTH_SYMMETRIC_KEY, res.locals.user.twoFactorSecretCiphertext, res.locals.user.twoFactorSecretIv, res.locals.user.twoFactorSecretTag);
		const isValid = authenticator.verify({ secret, token });

		if (!isValid) {
			res.status(403).json({ error: "Invalid token. User was not deleted" });
			return;
		}
	}

	const authKeyHash = crypto.argon2Sync("argon2id", { message: Buffer.from(authKey, "hex"), nonce: Buffer.from(res.locals.user.serverSalt, "hex"), parallelism: 4, tagLength: 32, memory: 8192, passes: 3 });

	if (!crypto.timingSafeEqual(authKeyHash, Buffer.from(res.locals.user.authKeyHash, "hex"))) {
		console.error(`Wrong masterPassword trying to log into user with email ${res.locals.user.email}`);
		res.status(403).json({ error: "Wrong credentials" });
		return;
	}

	try {
		await deleteUserById(res.locals.user.id);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Failed to delete account" });
		return;
	}

	res.sendStatus(200);
});

export default router;
