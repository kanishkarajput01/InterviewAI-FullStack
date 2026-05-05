"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { IUser } from "@/_shared/types";

interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  user: initialUser,
}: {
  children: ReactNode;
  user: IUser | null;
}) {
  const [user, setUser] = useState<IUser | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
