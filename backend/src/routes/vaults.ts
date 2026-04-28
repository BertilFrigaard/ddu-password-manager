import { Router } from "express";
import { getDBVaultById, getDBVaultItemPasswordByItemId, getUserVaults, insertVault, insertVaultItem, updateVaultItem } from "../store/vaults";
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

	if (typeof twoFactorEnabled !== "boolean") {
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

router.post("/vaultItem/:itemId", requireAuth({ attachUser: true }), requireItem({ checkOwnership: true, attachItem: true }), async (req, res) => {
	if (!res.locals.user || !res.locals.item) {
		res.status(500).json({ error: "Internal error. Failed to fetch user or item" });
		return;
	}

	const { vaultId, encryptedInfo, iv, authTag, twoFactorEnabled, ivPassword, encryptedPassword, authTagPassword } = req.body;

	if (!encryptedInfo || !iv || !authTag || typeof twoFactorEnabled !== "boolean") {
		res.status(400).json({ error: "Missing required fields: encryptedInfo, iv, authTag, twoFactorEnabled" });
		return;
	}

	let password: ItemPassword | null | undefined = undefined;
	if (ivPassword !== undefined || encryptedPassword !== undefined || authTagPassword !== undefined) {
		if (ivPassword && encryptedPassword && authTagPassword) {
			password = { iv: ivPassword, encryptedPassword, authTag: authTagPassword };
		} else if (!ivPassword && !encryptedPassword && !authTagPassword) {
			password = null;
		} else {
			res.status(400).json({ error: "Password fields must all be provided or none be provided" });
			return;
		}
	}

	if (typeof vaultId === "number") {
		try {
			const vault = await getDBVaultById(vaultId);
			if (!vault) {
				res.status(404).json({ error: "Selected folder not found" });
				return;
			}
			if (vault.userId !== res.locals.user.id) {
				res.status(403).json({ error: "No access" });
				return;
			}
		} catch (e) {
			console.error(e);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	} else if (typeof vaultId !== "undefined") {
		res.status(400).json({ error: "vaultId must either be undefined or a number" });
		return;
	}

	try {
		await updateVaultItem(res.locals.item.id, encryptedInfo, iv, authTag, twoFactorEnabled, vaultId, password);
		res.status(200).json({ success: true });
	} catch (e) {
		res.status(500).json({ error: "Failed to update vault item" });
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
