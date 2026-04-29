import crypto from "node:crypto";
import "dotenv/config";

export const PORT = process.env.PORT || 3000;
export const REFRESH_TOKEN_HASH_SECRET = process.env.REFRESH_TOKEN_HASH_SECRET || crypto.randomBytes(32).toString("hex");
export const SESSION_JWT_SECRET = process.env.SESSION_JWT_SECRET || crypto.randomBytes(32).toString("hex");

if (!process.env.REFRESH_TOKEN_HASH_SECRET) {
	console.warn("REFRESH_TOKEN_HASH_SECRET environment variable is required in production. Using generated for now");
}

if (!process.env.SESSION_JWT_SECRET) {
	console.warn("SESSION_JWT_SECRET environment variable is required in production. Using generated for now");
}

if (!process.env.TWO_FACTOR_AUTH_SYMMETRIC_KEY) {
	throw new Error("TWO_FACTOR_AUTH_SYMMETRIC_KEY environment variable is required.");
}

export const TWO_FACTOR_AUTH_SYMMETRIC_KEY = process.env.TWO_FACTOR_AUTH_SYMMETRIC_KEY;

if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGHOST || !process.env.PGPORT || !process.env.PGDATABASE) {
	throw new Error("PostgreSQL enviroment variables not set");
}

export const PGPORT = Number(process.env.PGPORT);
if (isNaN(PGPORT)) {
	throw new Error("PGPORT environment variable must be a valid number");
}

export const PGUSER = process.env.PGUSER;
export const PGPASSWORD = process.env.PGPASSWORD;
export const PGHOST = process.env.PGHOST;
export const PGDATABASE = process.env.PGDATABASE;

// CRYPTO

// AuthKey Server hash
export const AUTHKEY_HASH_OPTIONS = {
	parallelism: 4,
	tagLength: 32,
	memory: 8192,
	passes: 3,
};
