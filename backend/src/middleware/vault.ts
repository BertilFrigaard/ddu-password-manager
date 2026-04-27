import { RequestHandler } from "express";
import { getDBVaultById, getDBVaultItemById } from "../store/vaults";

interface ItemOptions {
	checkOwnership?: boolean;
	attachItem?: boolean;
}

export function requireItem(options?: ItemOptions): RequestHandler {
	return async (req, res, next) => {
		const raw = req.params.itemId;
		const itemId = Number(raw);
		if (isNaN(itemId)) {
			res.status(400).json({ error: "Invalid itemId" });
			return;
		}

		let item;
		try {
			item = await getDBVaultItemById(itemId);
		} catch {
			res.status(500).json({ error: "Something went wrong" });
			return;
		}

		if (!item) {
			res.status(404).json({ error: "Login not found" });
			return;
		}

		if (options?.checkOwnership) {
			let vault;
			try {
				vault = await getDBVaultById(item.vaultId);
			} catch {
				res.status(500).json({ error: "Something went wrong" });
				return;
			}

			if (!vault) {
				res.status(404).json({ error: "Could not verify ownership" });
				return;
			}

			if (vault.userId !== res.locals.user?.id) {
				res.status(403).json({ error: "Forbidden" });
				return;
			}
		}

		if (options?.attachItem) {
			res.locals.item = item;
		}

		next();
	};
}

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
