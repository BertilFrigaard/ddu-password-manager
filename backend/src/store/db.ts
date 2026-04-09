import { Pool } from "pg";
import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } from "../config";

export const pool: Pool = new Pool({
	user: PGUSER,
	password: PGPASSWORD,
	host: PGHOST,
	port: PGPORT,
	database: PGDATABASE,
	connectionTimeoutMillis: 3000,
	idleTimeoutMillis: 5000,
	//TODO look into ssl
});
