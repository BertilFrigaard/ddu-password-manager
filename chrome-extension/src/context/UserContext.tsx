import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { StoredUser } from "../common/types.js";
import { getUser } from "../store/store.js";
import { isUnlocked } from "../services/authService.js";

interface UserContextValue {
	user: StoredUser | null;
	isLoggedIn: boolean;
	isLoading: boolean;
	refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<StoredUser | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const refreshUser = async () => {
		setIsLoading(true);
		setUser(await getUser());
		setIsLoggedIn(await isUnlocked());
		setIsLoading(false);
	};

	useEffect(() => {
		refreshUser();
	}, []);

	return <UserContext.Provider value={{ user, refreshUser, isLoggedIn, isLoading }}>{children}</UserContext.Provider>;
}

export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used inside UserProvider");
	return ctx;
}
