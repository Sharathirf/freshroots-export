'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerAddress } from '@/types';

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
  addresses: CustomerAddress[];
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  isManageAddressesOpen: boolean;
  setIsManageAddressesOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  lang: 'en' | 'kn';
  setLang: (lang: 'en' | 'kn') => void;
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
  loadAddresses: () => Promise<void>;
  saveAddress: (addr: {
    id?: string;
    recipient_name?: string;
    phone?: string;
    tag?: string;
    street_address: string;
    city: string;
    state?: string;
    pincode: string;
    is_default?: boolean;
  }) => Promise<CustomerAddress | null>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isManageAddressesOpen, setIsManageAddressesOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [lang, setLangState] = useState<'en' | 'kn'>('en');

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('agri_lang');
      if (storedLang === 'en' || storedLang === 'kn') {
        setLangState(storedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: 'en' | 'kn') => {
    setLangState(newLang);
    try {
      localStorage.setItem('agri_lang', newLang);
      window.dispatchEvent(new Event('agri_lang_changed'));
    } catch {
      // ignore
    }
  };

  const loadAddresses = useCallback(async () => {
    if (!customer?.phone) return;
    try {
      const res = await fetch(`/api/customer/addresses?phone=${encodeURIComponent(customer.phone)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch (e) {
      console.warn('Failed to load customer addresses:', e);
    }
  }, [customer?.phone]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiptur_customer_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomer(parsed);
        // Refresh profile and addresses from server
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

          fetch(`/api/customer/addresses?phone=${encodeURIComponent(parsed.phone)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && Array.isArray(data.addresses)) {
                setAddresses(data.addresses);
              }
            })
            .catch((e) => console.warn('Could not load addresses from server:', e));
        }
      }
    } catch (e) {
      console.error('Failed to load customer session:', e);
    }
  }, []);

  // When customer changes, load addresses
  useEffect(() => {
    if (customer?.phone) {
      loadAddresses();
    } else {
      setAddresses([]);
    }
  }, [customer?.phone, loadAddresses]);

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

  const saveAddress = async (addr: {
    id?: string;
    recipient_name?: string;
    phone?: string;
    tag?: string;
    street_address: string;
    city: string;
    state?: string;
    pincode: string;
    is_default?: boolean;
  }): Promise<CustomerAddress | null> => {
    if (!customer?.phone) return null;
    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addr,
          customer_phone: customer.phone
        })
      });
      const data = await res.json();
      if (data.success && data.address) {
        await loadAddresses();
        // If saved address is default, update local customer address too
        if (data.address.is_default) {
          updateProfile({
            address: data.address.street_address,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode
          });
        }
        return data.address;
      }
      return null;
    } catch (e) {
      console.error('Error saving address:', e);
      return null;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!customer?.phone) return false;
    try {
      const res = await fetch(`/api/customer/addresses?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(customer.phone)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await loadAddresses();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting address:', e);
      return false;
    }
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    await saveAddress({
      ...target,
      is_default: true
    });
  };

  const signOut = () => {
    setCustomer(null);
    setAddresses([]);
    try {
      localStorage.removeItem('tiptur_customer_session');
    } catch (e) {
      console.error('Failed to remove customer session:', e);
    }
    setIsAccountModalOpen(false);
    setIsEditProfileModalOpen(false);
    setIsManageAddressesOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoggedIn: Boolean(customer),
        addresses,
        isSignInModalOpen,
        setIsSignInModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        isManageAddressesOpen,
        setIsManageAddressesOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        isHelpOpen,
        setIsHelpOpen,
        lang,
        setLang,
        signIn,
        updateProfile,
        loadAddresses,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
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
