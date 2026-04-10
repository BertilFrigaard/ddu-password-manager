import { Session } from "../types";
import { sql } from "./db";

export async function insertSession(userId: number, keyHash: string, expiration: bigint) {
	try {
		const rows = await sql<{ id: bigint }[]>`
			INSERT INTO sessions (user_id, key_hash, expiration)
			VALUES (${userId}, ${keyHash}, ${expiration.toString()})
			RETURNING id
		`;
		if (rows.length) {
			return rows[0].id;
		} else {
			console.error(`Insert session request returned 0 rows for user with id ${userId}`);
			throw new Error("Something went wrong");
		}
	} catch (e) {
		console.error(`Insert session request for user with id ${userId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}

export async function getSessionById(sessionId: bigint) {
	try {
		const rows = await sql<Session[]>`SELECT * FROM sessions WHERE id = ${sessionId.toString()}`;
		return rows.length ? rows[0] : null;
	} catch (e) {
		console.error(`Get session request for session with id ${sessionId} threw error: \n ${e}`);
		throw new Error("Something went wrong");
	}
}
