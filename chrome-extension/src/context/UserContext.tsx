import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { StoredUser } from "../common/types.js";
import { getUser } from "../store/store.js";

interface UserContextValue {
	user: StoredUser | null;
	refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<StoredUser | null>(null);
	const refreshUser = async () => {
		setUser(null);
		setUser(await getUser());
	};

	useEffect(() => {
		refreshUser();
	}, []);

	return <UserContext.Provider value={{ user, refreshUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used inside UserProvider");
	return ctx;
}
