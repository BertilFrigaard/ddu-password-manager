import crypto from "node:crypto";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const REFRESH_TOKEN_HASH_SECRET = process.env.REFRESH_TOKEN_HASH_SECRET || crypto.randomBytes(32);
const SESSION_JWT_SECRET = process.env.SESSION_JWT_SECRET || crypto.randomBytes(32);

if (!process.env.REFRESH_TOKEN_HASH_SECRET) {
	console.warn("REFRESH_TOKEN_HASH_SECRET environment variable is required in production. Using generated for now");
}

if (!process.env.SESSION_JWT_SECRET) {
	console.warn("SESSION_JWT_SECRET environment variable is required in production. Using generated for now");
}

if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGHOST || !process.env.PGPORT || !process.env.PGDATABASE) {
	throw new Error("PostgreSQL enviroment variables not set");
}

const PGPORT = Number(process.env.PGPORT);
if (isNaN(PGPORT)) {
	throw new Error("PGPORT environment variable must be a valid number");
}

const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGHOST = process.env.PGHOST;
const PGDATABASE = process.env.PGDATABASE;

export { PORT, REFRESH_TOKEN_HASH_SECRET, SESSION_JWT_SECRET, PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE };
