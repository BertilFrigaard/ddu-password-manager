import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Vault } from "../common/types.js";
import { getVaults } from "../store/store.js";

interface VaultContextValue {
	vaults: Vault[] | null;
	isLoading: boolean;
	refreshVaults: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
	const [vaults, setVaults] = useState<Vault[] | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const refreshVaults = async () => {
		setIsLoading(true);
		setVaults(await getVaults());
		setIsLoading(false);
		console.log(vaults);
	};

	useEffect(() => {
		refreshVaults();
	}, []);

	return <VaultContext.Provider value={{ vaults, refreshVaults, isLoading }}>{children}</VaultContext.Provider>;
}

export function useVaults() {
	const ctx = useContext(VaultContext);
	if (!ctx) throw new Error("useVaults must be used inside VaultProvider");
	return ctx;
}
