'use client';
// app/library/borrow/page.tsx  →  Borrow form — select item + enter borrower details

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useLibrary } from '@/lib/library/context';
import { SUBJECT_META, TYPE_LABELS } from '@/lib/library/subjects';

function Field({
  label, value, onChange, placeholder, type = 'text', required = true, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function BorrowPage() {
  const router = useRouter();
  const {
    items, selectedItem, setSelectedItem,
    borrowerName, setBorrowerName,
    borrowerPhone, setBorrowerPhone,
    borrowerEmail, setBorrowerEmail,
    borrowerNIC, setBorrowerNIC,
    borrowItem,
  } = useLibrary();

  const [errors, setErrors] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showPicker, setShowPicker] = useState(!selectedItem);

  const availableItems = items.filter(i =>
    i.availableCopies > 0 &&
    (!itemSearch ||
      i.title.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.author.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!selectedItem)       errs.push('Please select an item to borrow.');
    if (!borrowerName.trim()) errs.push('Full name is required.');
    if (!borrowerNIC.trim())  errs.push('NIC number is required.');
    if (!borrowerPhone.trim()) errs.push('Phone number is required.');
    if (borrowerEmail && !/\S+@\S+\.\S+/.test(borrowerEmail))
      errs.push('Email address is invalid.');
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    const record = borrowItem();
    if (record) router.push('/library/confirmed');
  };

  return (
    <div className="max-w-[640px] mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Borrow an Item</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details below. Items are loaned for <strong>14 days</strong>.
        </p>
      </div>

      {/* Step 1 — Item selection */}
      <div className="rounded-2xl border border-border overflow-hidden mb-5">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Step 1 · Select Item
          </p>
          {selectedItem && (
            <button
              onClick={() => { setSelectedItem(null); setShowPicker(true); }}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Change
            </button>
          )}
        </div>

        {/* Selected item summary */}
        {selectedItem && !showPicker ? (
          <div className="px-4 py-4 flex items-start gap-3">
            <div className={`w-10 h-12 rounded-lg shrink-0 flex items-center justify-center text-white text-[9px] font-bold ${
              { physics: 'bg-blue-600', chemistry: 'bg-emerald-600', biology: 'bg-green-700', mathematics: 'bg-amber-500' }[selectedItem.subject]
            }`}>
              {SUBJECT_META[selectedItem.subject].icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-snug">{selectedItem.title}</p>
              <p className="text-xs text-muted-foreground">{selectedItem.author}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SUBJECT_META[selectedItem.subject].accentLight} ${SUBJECT_META[selectedItem.subject].accentText}`}>
                  {SUBJECT_META[selectedItem.subject].label}
                </span>
                <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[selectedItem.type]}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  {selectedItem.availableCopies} available
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Item search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search available items…"
                value={itemSearch}
                onChange={e => setItemSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No available items match your search.</p>
              )}
              {availableItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setShowPicker(false); }}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border border-border hover:border-foreground/30 hover:bg-secondary/20 text-left transition-all"
                >
                  <div className={`w-8 h-10 rounded-md shrink-0 flex items-center justify-center text-white text-[8px] font-bold ${
                    { physics: 'bg-blue-600', chemistry: 'bg-emerald-600', biology: 'bg-green-700', mathematics: 'bg-amber-500' }[item.subject]
                  }`}>
                    {SUBJECT_META[item.subject].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-snug truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.author}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">{item.availableCopies} copy available</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Only showing items with available copies.{' '}
              <Link href="/library" className="underline hover:text-foreground transition-colors">
                Browse full catalog →
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Step 2 — Borrower details */}
      <div className="rounded-2xl border border-border overflow-hidden mb-5">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Step 2 · Your Details
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={borrowerName} onChange={setBorrowerName} placeholder="e.g. Kamal Perera" />
          <Field label="NIC Number" value={borrowerNIC} onChange={setBorrowerNIC} placeholder="e.g. 991234567V" hint="National Identity Card number" />
          <Field label="Phone Number" value={borrowerPhone} onChange={setBorrowerPhone} placeholder="e.g. 0771234567" type="tel" />
          <Field label="Email Address" value={borrowerEmail} onChange={setBorrowerEmail} placeholder="you@example.com" type="email" required={false} hint="Optional — for overdue reminders" />
        </div>
      </div>

      {/* Loan terms */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5">
        <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-[11px] text-amber-700">
          Items are loaned for <strong>14 days</strong> from today. Please return on or before the due date to avoid a hold on your borrowing privileges. This is a <strong>physical pickup</strong> — please collect from the library counter with your NIC.
        </p>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-5">
          {errors.map(e => (
            <p key={e} className="text-xs text-red-700">· {e}</p>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedItem}
        className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirm Borrow Request
      </button>
    </div>
  );
}