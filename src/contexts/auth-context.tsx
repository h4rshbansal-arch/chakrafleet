"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/lib/types";
import { users } from "@/lib/data";

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This is a mock session check. In a real app, you'd verify a token.
    const storedUserRole = typeof window !== "undefined" ? sessionStorage.getItem("userRole") as UserRole : null;
    if (storedUserRole) {
      const loggedInUser = users.find(u => u.role === storedUserRole);
      setUser(loggedInUser || null);
    }
  }, []);

  const login = (role: UserRole) => {
    const userToLogin = users.find(u => u.role === role);
    if (userToLogin) {
      setUser(userToLogin);
      sessionStorage.setItem("userRole", userToLogin.role);
      router.push("/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("userRole");
    router.push("/login");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
