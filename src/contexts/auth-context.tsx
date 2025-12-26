"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { useFirebase, setDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, Firestore, onSnapshot } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isUserLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to create a user profile in Firestore if it doesn't exist
const createUserProfile = async (firestore: Firestore, firebaseUser: FirebaseUser, name: string, email: string, role: UserRole) => {
  const userRef = doc(firestore, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const newUserProfile: Omit<UserProfile, 'id'> & { id: string } = {
      id: firebaseUser.uid,
      name: name,
      email: email,
      role: role,
      avatarUrl: PlaceHolderImages.find(p => p.imageHint.includes('person'))?.imageUrl || '',
    };
    setDocumentNonBlocking(userRef, newUserProfile, { merge: true });
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firebaseUser) return null;
    return doc(firestore, "users", firebaseUser.uid);
  }, [firebaseUser, firestore]);

  useEffect(() => {
    if (!userDocRef) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }
    
    setProfileLoading(true);
    const sub = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
      } else {
        setUserProfile(null);
      }
      setProfileLoading(false);
    }, () => setProfileLoading(false));

    return () => sub();

  }, [userDocRef]);
  
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(firestore, cred.user, name, email, role);
    router.push("/dashboard");
  }

  const logout = () => {
    auth.signOut();
    setUserProfile(null);
    router.push("/login");
  };

  const isUserLoading = isFirebaseUserLoading || isProfileLoading;
  const isAuthenticated = !!userProfile && !!firebaseUser;

  return (
    <AuthContext.Provider value={{ user: userProfile, firebaseUser, login, signup, logout, isAuthenticated, isUserLoading }}>
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
