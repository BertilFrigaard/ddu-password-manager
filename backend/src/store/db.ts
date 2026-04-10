import postgres from "postgres";
import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } from "../config";

export const sql = postgres({
	user: PGUSER,
	password: PGPASSWORD,
	host: PGHOST,
	port: PGPORT,
	database: PGDATABASE,
	transform: postgres.camel,
	max: 10, // pool size, default is 10
	idle_timeout: 20,
});
