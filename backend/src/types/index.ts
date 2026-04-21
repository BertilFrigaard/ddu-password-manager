declare global {
	namespace Express {
		interface Locals {
			session?: { sessionId: bigint; userId: number };
			user?: User;
			vault?: DBVault;
		}
	}
}

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

export interface DBVault {
	id: number;
	userId: number;
	name: string;
}

export interface DBVaultItem {
	id: bigint;
	vaultId: number;
	encryptedInfo: string;
	iv: string;
	authTag: string;
	twoFactorEnabled: boolean;
}

export interface DBItemPassword {
	vaultItemId: bigint;
	encryptedPassword: string;
	iv: string;
	authTag: string;
}

export interface Vault {
	id: number;
	name: string;
	items: VaultItem[];
}

export interface VaultItem {
	id: bigint;
	encryptedInfo: string;
	iv: string;
	authTag: string;
	twoFactorEnabled: boolean;
	password: ItemPassword | null;
}

export interface ItemPassword {
	encryptedPassword: string;
	iv: string;
	authTag: string;
}
