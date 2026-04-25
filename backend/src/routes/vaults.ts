import { Router } from "express";
import { insertVault, insertVaultItem } from "../store/vaults";
import { ItemPassword } from "../types/index";
import { requireAuth } from "../middleware/auth";
import { requireVault } from "../middleware/vault";

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
	const { vaultName } = req.body;
	if (!vaultName || typeof vaultName !== "string") {
		res.status(400).json({ error: "Invalid vault name" });
		return;
	}

	if (!res.locals.user) {
		res.status(500).json({ error: "User id not found" });
		return;
	}
	try {
		const id = await insertVault(res.locals.user?.id, vaultName);
		res.status(201).json({ vaultId: id });
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

export default router;
