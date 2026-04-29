export interface StoredUser {
	id: number;
	email: string;
	defaultVault: number | null;
	twoFactorEnabled: boolean;
}

export interface ItemPassword {
	encryptedPassword: string;
	iv: string;
	authTag: string;
}

export interface VaultItem {
	// id is bigint on the backend. For simplicity number is used here which should be plenty
	id: number;
	website: string;
	username: string;
	twoFactorEnabled: boolean;
	lastPasswordUpdate: number;
	password: ItemPassword | null; // password stays encrypted until explicitly requested
}

export interface Vault {
	id: number;
	name: string;
	twoFactorEnabled: boolean;
	items: VaultItem[];
}
