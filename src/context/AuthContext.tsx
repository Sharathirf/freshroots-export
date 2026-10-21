'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerUser {
  phone: string;
  name?: string;
  signedInAt: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  signIn: (phone: string, name?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiptur_customer_session');
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load customer session:', e);
    }
  }, []);

  const signIn = (phone: string, name?: string) => {
    const user: CustomerUser = {
      phone,
      name: name || `Customer ${phone.slice(-4)}`,
      signedInAt: new Date().toISOString()
    };
    setCustomer(user);
    try {
      localStorage.setItem('tiptur_customer_session', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save customer session:', e);
    }
    setIsSignInModalOpen(false);
  };

  const signOut = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('tiptur_customer_session');
    } catch (e) {
      console.error('Failed to remove customer session:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoggedIn: Boolean(customer),
        isSignInModalOpen,
        setIsSignInModalOpen,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
