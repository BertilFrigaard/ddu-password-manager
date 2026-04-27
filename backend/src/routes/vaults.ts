import { Router } from "express";
import { getDBVaultItemPasswordByItemId, getUserVaults, insertVault, insertVaultItem } from "../store/vaults";
import { ItemPassword } from "../types/index";
import { requireAuth } from "../middleware/auth";
import { requireItem, requireVault } from "../middleware/vault";
import { TWO_FACTOR_AUTH_SYMMETRIC_KEY } from "../config";
import { decrypt } from "../services/cryptoService";
import { authenticator } from "@otplib/preset-default";

const router = Router();

router.post("/vaults/:vaultId/items", requireAuth(), requireVault({ attachVault: true }), async (req, res) => {
	const { encryptedInfo, iv, authTag, twoFactorEnabled, ivPassword, encryptedPassword, authTagPassword } = req.body;
	let password: ItemPassword | null = null;
	if (ivPassword && encryptedPassword && authTagPassword) {
		password = { iv: ivPassword, encryptedPassword, authTag: authTagPassword };
	}
	try {
		const id = await insertVaultItem(res.locals.vault?.id!, encryptedInfo, iv, authTag, twoFactorEnabled === null || twoFactorEnabled === undefined ? false : twoFactorEnabled, password);
		res.status(201).json({ vaultItemId: id });
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post("/vaults", requireAuth({ attachUser: true }), async (req, res) => {
	const { vaultName, twoFactorEnabled } = req.body;
	if (!vaultName || typeof vaultName !== "string") {
		res.status(400).json({ error: "Invalid vault name" });
		return;
	}

	if (!twoFactorEnabled || typeof twoFactorEnabled !== "boolean") {
		res.status(400).json({ error: "Invalid value for twoFactorEnabled" });
		return;
	}

	if (!res.locals.user) {
		res.status(500).json({ error: "User not found" });
		return;
	}
	try {
		const id = await insertVault(res.locals.user?.id, vaultName, twoFactorEnabled);
		res.status(201).json({ vaultId: id });
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.get("/vaults", requireAuth({ attachUser: true }), async (req, res) => {
	if (!res.locals.user) {
		res.status(500).json({ error: "User id not found" });
		return;
	}
	try {
		const vaults = await getUserVaults(res.locals.user.id);
		res.status(201).json({ vaults });
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post("/vaultItem/:itemId/password", requireAuth({ attachUser: true }), requireItem({ checkOwnership: true, attachItem: true }), async (req, res) => {
	if (!res.locals.user || !res.locals.item) {
		res.status(500).json({ error: "Something went wrong" });
		return;
	}

	const { token } = req.body;
	if (!token) {
		res.status(400).json({ error: "Token missing from request " });
		return;
	}

	let password;
	try {
		password = await getDBVaultItemPasswordByItemId(res.locals.item.id);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal server error when fetching item" });
		return;
	}

	if (!password) {
		res.status(404).json({ error: "Password not found" });
		return;
	}

	const secret = decrypt(TWO_FACTOR_AUTH_SYMMETRIC_KEY, res.locals.user.twoFactorSecretCiphertext, res.locals.user.twoFactorSecretIv, res.locals.user.twoFactorSecretTag);
	const isValid = authenticator.verify({ secret, token });

	if (!isValid) {
		res.status(403).json({ error: "Invalid token." });
		return;
	}

	res.json({ password });
});

export default router;
