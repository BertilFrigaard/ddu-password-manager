import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Vault } from "../common/types.js";
import { getVaults } from "../store/store.js";

interface VaultContextValue {
	vaults: Vault[] | null;
	refresh: boolean;
	refreshVaults: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
	const [vaults, setVaults] = useState<Vault[] | null>(null);
	const [refresh, setRefresh] = useState(false);

	const refreshVaults = async () => {
		setVaults(null);
		setVaults(await getVaults());
		setRefresh((r) => !r);
	};

	useEffect(() => {
		refreshVaults();
	}, []);

	return <VaultContext.Provider value={{ vaults, refresh, refreshVaults }}>{children}</VaultContext.Provider>;
}

export function useVaults() {
	const ctx = useContext(VaultContext);
	if (!ctx) throw new Error("useVaults must be used inside VaultProvider");
	return ctx;
}
