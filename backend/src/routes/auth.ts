import { Router } from "express";
import crypto from "node:crypto";
import { getUserByEmail, insertUser } from "../store";

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
		console.log(`User with email ${email} already exists`);
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

export default router;
