'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch custom claims to determine role
        const token = await currentUser.getIdTokenResult();
        // If they have an admin claim, set role to admin, else default
        setRole((token.claims.admin ? 'admin' : (token.claims.role as string)) || 'user');
        
        // Save the token as a cookie so Next.js Middleware can read it
        document.cookie = `auth_token=${await currentUser.getIdToken()}; path=/;`;
      } else {
        setRole(null);
        // Delete the cookie
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
