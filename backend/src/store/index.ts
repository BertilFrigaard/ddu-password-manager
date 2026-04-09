import { User } from "../types";
import { pool } from "./db";

export async function insertUser(email: string, authKeyHash: string, serverSalt: string, encryptedKey: string, iv: string, authTag: string) {
	try {
		const res = await pool.query<number[]>("INSERT INTO USERS (email, auth_key_hash, server_salt, encrypted_key, iv, auth_tag) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [email, authKeyHash, serverSalt, encryptedKey, iv, authTag]);
		if (res.rowCount) {
			return res.rows[0];
		} else {
			console.error(`Insert user request returned ${res.rowCount} rows for email ${email}`);
			throw new Error("Something went wrong");
		}
	} catch (e) {
		console.error(`Insert user request for email ${email} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getUserByEmail(email: string) {
	try {
		const res = await pool.query<User>("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
		return res.rowCount ? res.rows[0] : null;
	} catch (e) {
		console.error(`Get user request for email ${email} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}
