'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, User 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, 
  login: async()=>{}, register: async()=>{}, logout: async()=>{}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    //  Create profile in Firestore (await to ensure it exists before redirect)
    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      email: newUser.email,
      role: 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
    
    // Fire-and-forget profile sync (doesn't block login redirect)
    try {
      const userRef = doc(db, 'users', loggedInUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          role: 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Failed to sync user profile to Firestore:', err);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);