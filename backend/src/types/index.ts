export interface User {
	id: number;
	email: string;
	encryptedKey: string;
	iv: string;
	authTag: string;
	authKeyHash: string;
	serverSalt: string;
}

export interface Session {
	id: bigint;
	userId: number;
	keyHash: string;
	expiration: bigint;
}
