import { User } from "../types";
import { sql } from "./db";

export async function insertUser(email: string, authKeyHash: string, serverSalt: string, encryptedKey: string, iv: string, authTag: string) {
	try {
		const rows = await sql<{ id: number }[]>`
			INSERT INTO users (email, auth_key_hash, server_salt, encrypted_key, iv, auth_tag)
			VALUES (${email}, ${authKeyHash}, ${serverSalt}, ${encryptedKey}, ${iv}, ${authTag})
			RETURNING id
		`;
		if (rows.length) {
			return rows[0].id;
		} else {
			console.error(`Insert user request returned 0 rows for email ${email}`);
			throw new Error("Something went wrong");
		}
	} catch (e) {
		console.error(`Insert user request for email ${email} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getUserByEmail(email: string) {
	try {
		const rows = await sql<User[]>`SELECT * FROM users WHERE LOWER(email) = LOWER(${email})`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get user request for email ${email} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getUserById(id: number): Promise<User | null> {
	try {
		const rows = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get user request for id ${id} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function setUserDefaultVault(userId: number, vaultId: number | null) {
	try {
		await sql`UPDATE users SET default_vault = ${vaultId} WHERE id = ${userId}`;
	} catch (e) {
		console.error(`Set user default vault for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}
