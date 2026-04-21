import { Router } from "express";
import { insertVaultItem } from "../store/vaults";
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

export default router;
