'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerUser {
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  signedInAt: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  signIn: (
    phone: string,
    name?: string,
    email?: string,
    address?: string,
    city?: string,
    state?: string,
    pincode?: string
  ) => void;
  updateProfile: (details: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiptur_customer_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomer(parsed);
        // Refresh profile from server
        if (parsed.phone) {
          fetch(`/api/customer/profile?phone=${encodeURIComponent(parsed.phone)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.customer) {
                const refreshed: CustomerUser = {
                  ...parsed,
                  name: data.customer.name || parsed.name,
                  email: data.customer.email || parsed.email,
                  address: data.customer.address || parsed.address,
                  city: data.customer.city || parsed.city,
                  state: data.customer.state || parsed.state,
                  pincode: data.customer.pincode || parsed.pincode
                };
                setCustomer(refreshed);
                localStorage.setItem('tiptur_customer_session', JSON.stringify(refreshed));
              }
            })
            .catch((e) => console.warn('Could not refresh profile from server:', e));
        }
      }
    } catch (e) {
      console.error('Failed to load customer session:', e);
    }
  }, []);

  const signIn = (
    phone: string,
    name?: string,
    email?: string,
    address?: string,
    city?: string,
    state?: string,
    pincode?: string
  ) => {
    const user: CustomerUser = {
      phone,
      name: name?.trim() || `Customer ${phone.slice(-4)}`,
      email: email?.trim() || undefined,
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      pincode: pincode?.trim() || undefined,
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

  const updateProfile = async (details: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    if (!customer) return;
    const updated: CustomerUser = {
      ...customer,
      name: details.name !== undefined ? details.name.trim() : customer.name,
      email: details.email !== undefined ? details.email.trim() : customer.email,
      address: details.address !== undefined ? details.address.trim() : customer.address,
      city: details.city !== undefined ? details.city.trim() : customer.city,
      state: details.state !== undefined ? details.state.trim() : customer.state,
      pincode: details.pincode !== undefined ? details.pincode.trim() : customer.pincode
    };
    setCustomer(updated);
    try {
      localStorage.setItem('tiptur_customer_session', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update customer session:', e);
    }

    // Persist to PostgreSQL backend
    try {
      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          full_name: updated.name || customer.name,
          email: updated.email || null,
          address: updated.address || null,
          city: updated.city || null,
          state: updated.state || null,
          pincode: updated.pincode || null
        })
      });
    } catch (err) {
      console.warn('Backend profile persist warning:', err);
    }
  };

  const signOut = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('tiptur_customer_session');
    } catch (e) {
      console.error('Failed to remove customer session:', e);
    }
    setIsAccountModalOpen(false);
    setIsEditProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoggedIn: Boolean(customer),
        isSignInModalOpen,
        setIsSignInModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        signIn,
        updateProfile,
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
