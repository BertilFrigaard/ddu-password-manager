import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { SESSION_JWT_SECRET } from "../config";
import { getUserById } from "../store/users";

interface AuthOptions {
	attachUser?: boolean;
}

export function requireAuth(options?: AuthOptions): RequestHandler {
	return async (req, res, next) => {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({ error: "Missing or malformed authorization header" });
			return;
		}

		const token = authHeader.slice(7);

		let decoded: { sessionId: bigint; userId: number };
		try {
			decoded = jwt.verify(token, SESSION_JWT_SECRET) as typeof decoded;
		} catch {
			res.status(401).json({ error: "Invalid or expired token" });
			return;
		}

		res.locals.session = { sessionId: decoded.sessionId, userId: decoded.userId };

		if (options?.attachUser) {
			let user;
			try {
				user = await getUserById(decoded.userId);
			} catch {
				res.status(500).json({ error: "Something went wrong" });
				return;
			}
			if (!user) {
				res.status(401).json({ error: "User not found" });
				return;
			}
			res.locals.user = user;
		}

		next();
	};
}
