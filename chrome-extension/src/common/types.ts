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

// Decrypted VaultItem — encryptedInfo/iv/authTag have been decrypted into website+username
export interface VaultItem {
	// TODO: id is bigint on the backend; switch to bigint + string-on-wire when needed
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
