import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // If Firebase is not configured, check for a mock guest user
      const guestUser = localStorage.getItem('guest_user');
      if (guestUser) {
        setUser(JSON.parse(guestUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      localStorage.removeItem('guest_user');
      return;
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const signInAsGuest = () => {
    const mockUser = {
      uid: 'guest-123',
      email: 'guest@wanderplan.com',
      displayName: 'Guest Traveler',
    } as User;
    setUser(mockUser);
    localStorage.setItem('guest_user', JSON.stringify(mockUser));
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
