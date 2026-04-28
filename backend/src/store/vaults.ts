import { DBVault, DBVaultItem, DBItemPassword, Vault, ItemPassword } from "../types";
import { sql } from "./db";

export async function insertVault(userId: number, name: string, twoFactorEnabled: boolean) {
	try {
		const rows = await sql<{ id: number }[]>`
            INSERT INTO vaults (user_id, name, two_factor_enabled)
            VALUES (${userId}, ${name}, ${twoFactorEnabled})
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

export async function getDBVaultById(id: number): Promise<DBVault | null> {
	try {
		const rows = await sql<DBVault[]>`SELECT * FROM vaults WHERE id = ${id}`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get vault request for vault id ${id} threw error: \n ${e}`);
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

	let passwords;
	try {
		const twoFactorVaults = vaults.filter((v) => v.twoFactorEnabled).map((v) => v.id);
		const itemIds = items.filter((v) => !v.twoFactorEnabled && !twoFactorVaults.includes(v.vaultId)).map((v) => v.id.toString());
		passwords = await sql<DBItemPassword[]>`SELECT * FROM item_passwords WHERE vault_item_id = ANY(${sql.array(itemIds)}::bigint[])`;
	} catch (e) {
		console.error(`Get passwords request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}

	const formattedVaults: Vault[] = vaults.map((v) => ({
		id: v.id,
		name: v.name,
		twoFactorEnabled: v.twoFactorEnabled,
		items: items
			.filter((item) => item.vaultId === v.id)
			.map((item) => {
				const pw = passwords.find((p) => p.vaultItemId === item.id);
				return {
					id: item.id,
					encryptedInfo: item.encryptedInfo,
					iv: item.iv,
					authTag: item.authTag,
					twoFactorEnabled: v.twoFactorEnabled || item.twoFactorEnabled,
					password: pw ? { encryptedPassword: pw.encryptedPassword, iv: pw.iv, authTag: pw.authTag } : null,
				};
			}),
	}));

	return formattedVaults;
}

export async function insertVaultItem(vaultId: number, encryptedInfo: string, iv: string, authTag: string, twoFactorEnabled: boolean, password: ItemPassword | null) {
	try {
		let rows: { id: bigint }[];
		if (password) {
			rows = await sql<{ id: bigint }[]>`
				WITH new_item AS (
					INSERT INTO vault_items (vault_id, encrypted_info, iv, auth_tag, two_factor_enabled)
					VALUES (${vaultId}, ${encryptedInfo}, ${iv}, ${authTag}, ${twoFactorEnabled})
					RETURNING id
				)
				INSERT INTO item_passwords (vault_item_id, encrypted_password, iv, auth_tag)
				SELECT id, ${password.encryptedPassword}, ${password.iv}, ${password.authTag} FROM new_item
				RETURNING vault_item_id AS id
			`;
		} else {
			rows = await sql<{ id: bigint }[]>`
				INSERT INTO vault_items (vault_id, encrypted_info, iv, auth_tag, two_factor_enabled)
				VALUES (${vaultId}, ${encryptedInfo}, ${iv}, ${authTag}, ${twoFactorEnabled})
				RETURNING id
			`;
		}
		if (rows.length) {
			return rows[0].id;
		} else {
			console.error(`Insert vault item request returned 0 rows for vault with id ${vaultId}`);
			throw new Error("Something went wrong");
		}
	} catch (e) {
		console.error(`Insert vault item request for vault with id ${vaultId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function updateVaultItem(itemId: bigint, encryptedInfo: string, iv: string, authTag: string, twoFactorEnabled: boolean, vaultId?: number, password?: ItemPassword | null) {
	try {
		await sql`
            UPDATE vault_items
            SET
                encrypted_info = ${encryptedInfo},
                iv = ${iv},
                auth_tag = ${authTag},
                two_factor_enabled = ${twoFactorEnabled}
                ${vaultId !== undefined ? sql`, vault_id = ${vaultId}` : sql``}
            WHERE id = ${itemId.toString()}
        `;

		if (password !== undefined) {
			if (password) {
				await sql`
                    INSERT INTO item_passwords (vault_item_id, encrypted_password, iv, auth_tag)
                    VALUES (${itemId.toString()}, ${password.encryptedPassword}, ${password.iv}, ${password.authTag})
                    ON CONFLICT (vault_item_id) DO UPDATE
                        SET encrypted_password = EXCLUDED.encrypted_password,
                            iv = EXCLUDED.iv,
                            auth_tag = EXCLUDED.auth_tag
                `;
			} else {
				await sql`DELETE FROM item_passwords WHERE vault_item_id = ${itemId.toString()}`;
			}
		}
	} catch (e) {
		console.error(`Update vault item request for item id ${itemId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getDBVaultItemById(id: number): Promise<DBVaultItem | null> {
	try {
		const rows = await sql<DBVaultItem[]>`SELECT * FROM vault_items WHERE id = ${id}`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get vault item request for item id ${id} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getDBVaultItemPasswordByItemId(id: bigint): Promise<DBItemPassword | null> {
	try {
		const rows = await sql<DBItemPassword[]>`SELECT * FROM item_passwords WHERE vault_item_id = ${id.toString()}`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get vault item password request for item id ${id} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}
