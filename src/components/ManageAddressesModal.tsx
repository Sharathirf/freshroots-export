'use client';

import React, { useState } from 'react';
import { X, MapPin, Plus, Check, Trash2, Pencil, Star, Home, Building2, Factory } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CustomerAddress } from '@/types';

export default function ManageAddressesModal() {
  const {
    customer,
    addresses,
    isManageAddressesOpen,
    setIsManageAddressesOpen,
    saveAddress,
    deleteAddress,
    setDefaultAddress
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tag, setTag] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isManageAddressesOpen) return null;

  const handleOpenAddForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setTag('Home');
    setRecipientName(customer?.name || '');
    setContactPhone(customer?.phone || '');
    setStreetAddress('');
    setCity('Mandya');
    setState('Karnataka');
    setPincode('571423');
    setIsDefault(addresses.length === 0);
    setErrorMsg(null);
  };

  const handleOpenEditForm = (addr: CustomerAddress) => {
    setIsEditing(true);
    setEditingId(addr.id);
    setTag(addr.tag || 'Home');
    setRecipientName(addr.recipient_name || customer?.name || '');
    setContactPhone(addr.phone || customer?.phone || '');
    setStreetAddress(addr.street_address);
    setCity(addr.city);
    setState(addr.state || 'Karnataka');
    setPincode(addr.pincode);
    setIsDefault(addr.is_default);
    setErrorMsg(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim() || !city.trim() || pincode.trim().length !== 6) {
      setErrorMsg('Please enter a valid street address, city, and 6-digit postal pincode');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await saveAddress({
        id: editingId || undefined,
        recipient_name: recipientName.trim() || undefined,
        phone: contactPhone.trim() || undefined,
        tag: tag.trim() || 'Home',
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim() || 'Karnataka',
        pincode: pincode.trim(),
        is_default: isDefault
      });

      if (res) {
        setIsEditing(false);
        setEditingId(null);
      } else {
        setErrorMsg('Failed to save address');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery address?')) {
      await deleteAddress(id);
    }
  };

  const getTagIcon = (t: string) => {
    const low = t.toLowerCase();
    if (low.includes('home')) return <Home className="w-3.5 h-3.5" />;
    if (low.includes('mill') || low.includes('warehouse') || low.includes('factory'))
      return <Factory className="w-3.5 h-3.5" />;
    return <Building2 className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setIsManageAddressesOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsManageAddressesOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1e824c]" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage multiple shipping locations for your farm commodity orders
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="mr-8 px-3.5 py-1.5 rounded-full bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {isEditing ? (
            /* Add / Edit Form */
            <form onSubmit={handleSaveAddress} className="space-y-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <span className="text-xs font-black uppercase text-stone-700">
                  {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Tag Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Address Type / Label
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['Home', 'Warehouse', 'Oil Mill', 'Temple'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`py-1.5 px-2 rounded-xl font-bold border transition text-center ${
                        tag === t
                          ? 'bg-[#1e824c] text-white border-[#1e824c] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sharath or Manager"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9591142548"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Street Address / Plot / Landmark *
                </label>
                <textarea
                  rows={2}
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Near APMC Market Yard, Main Bazaar Road, Kikkeri"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mandya"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Pincode (6 digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="571423"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="make-default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-[#1e824c] focus:ring-[#1e824c]"
                />
                <label htmlFor="make-default" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Set as default delivery address for farm parcels
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1e824c] hover:bg-[#16663b] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving Address...' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          ) : addresses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#1e824c] flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-stone-800">No saved addresses yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Save your home, wholesale warehouse, or temple location for fast 1-click checkout and freight calculation.
              </p>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Your First Address</span>
              </button>
            </div>
          ) : (
            /* Address List */
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition relative ${
                    addr.is_default
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                          {getTagIcon(addr.tag)}
                          <span>{addr.tag}</span>
                        </span>

                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Star className="w-3 h-3 fill-emerald-700" />
                            Default
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-stone-900 pt-1">
                        {addr.recipient_name || customer?.name || 'Customer'}{' '}
                        {addr.phone && (
                          <span className="text-stone-500 font-mono font-normal">
                            (+91 {addr.phone})
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {addr.street_address}, {addr.city}, {addr.state} —{' '}
                        <strong className="text-stone-900 font-mono">{addr.pincode}</strong>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!addr.is_default && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-semibold text-stone-600 transition"
                          title="Set as Default"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(addr)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                        title="Edit Address"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>{addresses.length} saved address(es)</span>
          <button
            type="button"
            onClick={() => setIsManageAddressesOpen(false)}
            className="px-4 py-1.5 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
