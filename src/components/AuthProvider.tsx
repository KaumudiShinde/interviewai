"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";

interface AuthContextValue {
  user: { email: string; user_metadata: { full_name?: string } } | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const authUser = user
    ? {
        email: user.primaryEmailAddress?.emailAddress || "",
        user_metadata: { full_name: user.fullName || undefined },
      }
    : null;

  return (
    <AuthContext.Provider value={{ user: authUser, isLoading: !isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
