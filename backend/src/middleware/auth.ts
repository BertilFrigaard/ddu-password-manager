import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { SESSION_JWT_SECRET } from "../config";
import { getUserById } from "../store/users";

interface AuthOptions {
	attachUser?: boolean;
}

export function requireAuth(options?: AuthOptions): RequestHandler {
	return async (req, res, next) => {
		// Extract access token from request header
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			// If the request header is malformed throw error and return
			res.status(400).json({ error: "Missing or malformed authorization header" });
			return;
		}

		// The request header should be of form: Bearer XXX
		// we therefore slice away the first 7 characters to get the token
		const token = authHeader.slice(7);

		// Deocde and verify access token (JWT) using the server secret
		// if the verification dosen't throw a error, we can be
		// sure the server is the creator and thus we can predict the datatype
		let decoded: { sessionId: bigint; userId: number };
		try {
			decoded = jwt.verify(token, SESSION_JWT_SECRET) as typeof decoded;
		} catch {
			res.status(401).json({ error: "Invalid or expired token" });
			return;
		}

		// The access token has been verified and we now set a local variable
		// which allow other parts of the program to determine which user
		// sent the request
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
