'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Customer } from '@/types';
import { COMPLAINT_CATEGORIES } from '@/lib/crm-constants';

interface CrmComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onComplaintLogged: (complaint: any) => void;
}

export default function CrmComplaintModal({
  isOpen,
  onClose,
  customer,
  onComplaintLogged,
}: CrmComplaintModalProps) {
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [category, setCategory] = useState('damaged_produce');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Customer Care Manager');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg('Detailed description of the complaint is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        severity,
        category,
        description: description.trim(),
        assigned_to: assignedTo.trim() || undefined,
        deadline: deadline || undefined,
      };

      const res = await fetch(`/api/admin/crm/customers/${customer.id}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onComplaintLogged(data.complaint);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to file complaint.');
      }
    } catch {
      setErrorMsg('Network error while filing complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-800/40 border border-rose-500/40 flex items-center justify-center text-rose-300 font-extrabold text-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Log Customer Issue / Complaint</h2>
              <p className="text-xs text-rose-300">{customer.name} (+91 {customer.phone})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-900 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
              >
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-rose-900"
              >
                <option value="low">Low (Cosmetic / Minor Delay)</option>
                <option value="medium">Medium (Partial Damage / Mismatch)</option>
                <option value="high">High (Major Spoilage / Shortage)</option>
                <option value="critical">Critical (Complete Consignment Stall / Dispute)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Detailed Description of Issue *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 5 bags out of 50 in consignment AGR-20261021-2117 had cracked shells upon delivery. Customer requested replacement."
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-700 block mb-1">Assigned Investigator / Manager</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>

            <div>
              <label className="text-stone-700 block mb-1">Resolution Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-rose-700 text-white font-extrabold hover:bg-rose-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Log & Escalate Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
