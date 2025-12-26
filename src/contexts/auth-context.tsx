"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { useFirebase, setDocumentNonBlocking } from "@/firebase";
import { signInAnonymously, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, Firestore, onSnapshot } from "firebase/firestore";
import { users as mockUsers } from "@/lib/data";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isUserLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to create a user profile in Firestore if it doesn't exist
const createUserProfile = async (firestore: Firestore, firebaseUser: FirebaseUser, role: UserRole) => {
  const userRef = doc(firestore, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const mockUser = mockUsers.find(u => u.role === role);
    const newUserProfile: Omit<UserProfile, 'id'> & { id: string } = {
      id: firebaseUser.uid,
      name: mockUser?.name || 'Anonymous User',
      email: mockUser?.email || `anonymous@${firebaseUser.uid.substring(0,5)}.com`,
      role: role,
      avatarUrl: mockUser?.avatarUrl || '',
    };
    setDocumentNonBlocking(userRef, newUserProfile, { merge: true });
  }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, user: firebaseUser, isUserLoading } = useFirebase();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const userRef = doc(firestore, "users", firebaseUser.uid);
    const sub = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUser({ id: doc.id, ...doc.data() } as UserProfile);
      } else {
        // Could be a new anonymous user, wait for profile creation
        setUser(null);
      }
    });

    return () => sub();

  }, [firebaseUser, isUserLoading, firestore]);

  const login = async (role: UserRole) => {
    try {
      const cred = await signInAnonymously(auth);
      await createUserProfile(firestore, cred.user, role);
      // The useEffect will handle setting the user profile and navigation
      router.push("/dashboard");
    } catch (error) {
      console.error("Anonymous sign-in failed", error);
    }
  };

  const logout = () => {
    auth.signOut();
    router.push("/login");
  };

  const isAuthenticated = !!user && !!firebaseUser;

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, logout, isAuthenticated, isUserLoading }}>
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
