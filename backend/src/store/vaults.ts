import { DBVault, DBVaultItem, DBItemPassword, Vault } from "../types";
import { sql } from "./db";

export async function insertVault(userId: number, name: string) {
	try {
		const rows = await sql<{ id: number }[]>`
            INSERT INTO vaults (user_id, name)
            VALUES (${userId}, ${name})
            RETURNING id
        `;
		if (rows.length) {
			return rows[0].id;
		} else {
			console.error(`Insert vault request returned 0 rows for user with id ${userId}`);
			throw new Error("Something went wrong");
		}
	} catch (e) {
		console.error(`Insert vault request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getUserVaults(userId: number) {
	// Return all user vaults with all items and all passwords for non 2FA items, where 2FA is enabled password is null
	let vaults;
	try {
		vaults = await sql<DBVault[]>`SELECT * FROM vaults WHERE user_id = ${userId}`;
		if (!vaults.length) {
			// User has no vaults
			return [];
		}
	} catch (e) {
		console.error(`Get vaults request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}

	let items;
	try {
		const vaultIds = vaults.map((v) => v.id);
		items = await sql<DBVaultItem[]>`SELECT * FROM vault_items WHERE vault_id IN ${sql(vaultIds)}`;
	} catch (e) {
		console.error(`Get items request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}

	// TODO: untested at the moment
	let passwords;
	try {
		const itemIds = items.map((v) => v.id.toString());
		passwords = await sql<DBItemPassword[]>`SELECT * FROM item_passwords WHERE vault_item_id = ANY(${sql.array(itemIds)}::bigint[])`;
	} catch (e) {
		console.error(`Get passwords request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}

	const formattedVaults: Vault[] = vaults.map((v) => ({
		id: v.id,
		name: v.name,
		items: items
			.filter((item) => item.vaultId === v.id)
			.map((item) => {
				const pw = passwords.find((p) => p.vaultItemId === item.id);
				return {
					id: item.id,
					encryptedInfo: item.encryptedInfo,
					iv: item.iv,
					authTag: item.authTag,
					twoFactorEnabled: item.twoFactorEnabled,
					password: pw ? { encryptedPassword: pw.encryptedPassword, iv: pw.iv, authTag: pw.authTag } : null,
				};
			}),
	}));

	return formattedVaults;
}
