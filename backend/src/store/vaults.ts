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
