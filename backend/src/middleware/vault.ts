import { RequestHandler } from "express";
import { getDBVaultById } from "../store/vaults";

interface VaultOptions {
	checkOwnership?: boolean;
	attachVault?: boolean;
}

export function requireVault(options?: VaultOptions): RequestHandler {
	return async (req, res, next) => {
		const raw = req.params.vaultId;
		const vaultId = Number(raw);
		if (isNaN(vaultId)) {
			res.status(400).json({ error: "Invalid vaultId" });
			return;
		}

		let vault;
		try {
			vault = await getDBVaultById(vaultId);
		} catch {
			res.status(500).json({ error: "Something went wrong" });
			return;
		}

		if (!vault) {
			res.status(404).json({ error: "Vault not found" });
			return;
		}

		if (options?.checkOwnership && vault.userId !== res.locals.session?.userId) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		if (options?.attachVault) {
			res.locals.vault = vault;
		}

		next();
	};
}
