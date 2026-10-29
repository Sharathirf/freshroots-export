'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerAddress } from '@/types';

export interface CustomerUser {
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
  auth_provider?: string;
  provider_id?: string;
  email_verified?: boolean;
  metadata?: Record<string, any>;
  signedInAt: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  addresses: CustomerAddress[];
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  signInModalReason: string | null;
  setSignInModalReason: (reason: string | null) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
  requireAuth: (reason: string, onAuthorized?: () => void) => boolean;
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
    pincode?: string,
    avatar_url?: string,
    auth_provider?: string,
    provider_id?: string
  ) => void;
  signInWithGoogle: (profile: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
    email_verified?: boolean;
    locale?: string;
    phone?: string;
  }) => Promise<void>;
  updateProfile: (details: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
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
  const [signInModalReason, setSignInModalReason] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
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
        const queryParam = parsed.phone
          ? `phone=${encodeURIComponent(parsed.phone)}`
          : parsed.email
          ? `email=${encodeURIComponent(parsed.email)}`
          : parsed.provider_id
          ? `provider_id=${encodeURIComponent(parsed.provider_id)}`
          : null;

        if (queryParam) {
          fetch(`/api/customer/profile?${queryParam}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.customer) {
                const refreshed: CustomerUser = {
                  ...parsed,
                  name: data.customer.name || parsed.name,
                  email: data.customer.email || parsed.email,
                  phone: data.customer.phone || parsed.phone,
                  avatar_url: data.customer.avatar_url || parsed.avatar_url,
                  auth_provider: data.customer.auth_provider || parsed.auth_provider,
                  provider_id: data.customer.provider_id || parsed.provider_id,
                  email_verified: data.customer.email_verified ?? parsed.email_verified,
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

          if (parsed.phone) {
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
    pincode?: string,
    avatar_url?: string,
    auth_provider: string = 'phone',
    provider_id?: string
  ) => {
    const user: CustomerUser = {
      phone,
      name: name?.trim() || `Customer ${phone.slice(-4)}`,
      email: email?.trim() || undefined,
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      pincode: pincode?.trim() || undefined,
      avatar_url: avatar_url?.trim() || undefined,
      auth_provider,
      provider_id: provider_id?.trim() || undefined,
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

  const signInWithGoogle = async (profile: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
    email_verified?: boolean;
    locale?: string;
    phone?: string;
  }) => {
    const cleanPhone = profile.phone ? profile.phone.replace(/\D/g, '').slice(-10) : undefined;
    const user: CustomerUser = {
      phone: cleanPhone,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.picture,
      auth_provider: 'google',
      provider_id: profile.sub,
      email_verified: Boolean(profile.email_verified),
      metadata: {
        locale: profile.locale,
        google_sub: profile.sub,
        authenticated_at: new Date().toISOString()
      },
      signedInAt: new Date().toISOString()
    };

    setCustomer(user);
    try {
      localStorage.setItem('tiptur_customer_session', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save customer session:', e);
    }

    // Persist to PostgreSQL backend
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone || null,
          full_name: profile.name,
          email: profile.email,
          auth_provider: 'google',
          provider_id: profile.sub,
          avatar_url: profile.picture,
          email_verified: profile.email_verified,
          metadata: {
            locale: profile.locale,
            source: 'google_gis_web'
          }
        })
      });
      const data = await res.json();
      if (data.success && data.customer) {
        const enriched: CustomerUser = {
          ...user,
          phone: data.customer.phone || user.phone,
          address: data.customer.address || user.address,
          city: data.customer.city || user.city,
          state: data.customer.state || user.state,
          pincode: data.customer.pincode || user.pincode
        };
        setCustomer(enriched);
        localStorage.setItem('tiptur_customer_session', JSON.stringify(enriched));
      }
    } catch (err) {
      console.warn('Backend profile sync warning:', err);
    }
  };

  const updateProfile = async (details: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  }) => {
    if (!customer) return;
    const updated: CustomerUser = {
      ...customer,
      name: details.name !== undefined ? details.name.trim() : customer.name,
      email: details.email !== undefined ? details.email.trim() : customer.email,
      phone: details.phone !== undefined ? details.phone.trim() : customer.phone,
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
          phone: updated.phone || null,
          full_name: updated.name || customer.name,
          email: updated.email || null,
          address: updated.address || null,
          city: updated.city || null,
          state: updated.state || null,
          pincode: updated.pincode || null,
          auth_provider: customer.auth_provider || 'phone',
          provider_id: customer.provider_id || null,
          avatar_url: customer.avatar_url || null
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

  const requireAuth = (reason: string, onAuthorized?: () => void): boolean => {
    if (customer) {
      if (onAuthorized) onAuthorized();
      return true;
    }
    setSignInModalReason(reason);
    if (onAuthorized) {
      setPendingAction(() => onAuthorized);
    }
    setIsSignInModalOpen(true);
    return false;
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
        signInModalReason,
        setSignInModalReason,
        pendingAction,
        setPendingAction,
        requireAuth,
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
        signInWithGoogle,
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
