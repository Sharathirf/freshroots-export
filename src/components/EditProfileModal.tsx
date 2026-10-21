'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileModal() {
  const { customer, isEditProfileModalOpen, setIsEditProfileModalOpen, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customer && isEditProfileModalOpen) {
      setFullName(customer.name || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setState(customer.state || '');
      setPincode(customer.pincode || '');
      setErrorMsg(null);
    }
  }, [customer, isEditProfileModalOpen]);

  if (!isEditProfileModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await updateProfile({
        name: fullName,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined
      });
      setIsEditProfileModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setIsEditProfileModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsEditProfileModalOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header - Matches Screenshot 1 */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-stone-900 tracking-tight">
            Edit Profile
          </h3>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
            />
          </div>

          {/* City, State, Pincode in 3 columns - Matches Screenshot 1 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mandya"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="571423"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none transition placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Action Buttons - Matches Screenshot 1 */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 rounded-full bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="px-6 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 font-bold text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
