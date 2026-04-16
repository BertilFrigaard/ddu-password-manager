export interface User {
	id: number;
	email: string;
	encryptedKey: string;
	iv: string;
	authTag: string;
	authKeyHash: string;
	serverSalt: string;
	defaultVault: number | null;
}

export interface Session {
	id: bigint;
	userId: number;
	keyHash: string;
	expiration: bigint;
}

export interface Vault {
	id: number;
	userId: number;
	name: string;
}

export interface VaultItem {
	id: bigint;
	vaultId: number;
	encryptedInfo: string;
	iv: string;
	authTag: string;
	twoFactorEnabled: boolean;
}

export interface ItemPassword {
	vaultItemId: bigint;
	encryptedPassword: string;
	iv: string;
	authTag: string;
}
