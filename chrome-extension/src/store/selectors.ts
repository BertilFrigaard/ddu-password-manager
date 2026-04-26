import { Vault } from "../common/types.js";

export function selectCredentials(vaults: Vault[] | null, selectVault: number | null = null) {
	if (!vaults) return [];
	const filtered = selectVault !== null ? vaults.filter((v) => v.id === selectVault) : vaults;
	return filtered.flatMap((v) => v.items);
}
