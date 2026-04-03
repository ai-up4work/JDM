'use client';
// app/library/confirmed/page.tsx  →  Borrow confirmed screen
// Mirrors the design & layout of app/booking/confirmed/page.tsx

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useLibrary, BorrowRecord } from '@/lib/library/context';
import { SUBJECT_META, TYPE_LABELS } from '@/lib/library/subjects';
import { formatDate, formatShort } from '@/lib/library/dates';



export default function LibraryConfirmedPage() {
  const router = useRouter();
  const {
    selectedItem, borrowRecords, borrowerName,
    borrowerPhone, borrowerEmail, borrowerNIC,
    clearBorrowerForm,
  } = useLibrary();

  // Grab the most recently created record (set during borrowItem())
  const record: BorrowRecord | undefined = borrowRecords[borrowRecords.length - 1];

  // If somehow landed here with no record, redirect back
  // useEffect(() => {
  //   // Give context a tick to hydrate before redirecting
  //   const t = setTimeout(() => {
  //     if (!record) router.replace('/library/borrow');
  //   }, 100);
  //   return () => clearTimeout(t);
  // }, [record, router]);

  const handleBorrowAnother = () => {
    clearBorrowerForm();
    router.push('/library/borrow');
  };

  if (!record) return null;

  const meta = selectedItem ? SUBJECT_META[selectedItem.subject] : null;

  return (
    <div className="max-w-[480px] mx-auto text-center py-10">

      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(16,185,129,0.25)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Borrow confirmed!</h1>
      <p className="text-sm text-muted-foreground mb-1">
        {record.itemTitle}
      </p>
      {meta && (
        <p className="text-sm text-muted-foreground mb-6">
          {meta.label} · Due {formatShort(record.dueDate)}
        </p>
      )}

      {/* Reference number */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
        <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Loan Ref</span>
        <span className="text-xs font-bold text-emerald-700 font-mono">{record.id}</span>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-border text-left overflow-hidden mb-6">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Loan summary</p>
        </div>

        {[
          { label: 'Borrower',    value: record.borrowerName || '—' },
          { label: 'NIC',         value: record.borrowerNIC || '—' },
          { label: 'Phone',       value: record.borrowerPhone || '—' },
          { label: 'Email',       value: record.borrowerEmail || 'Not provided' },
          { label: 'Item',        value: record.itemTitle },
          { label: 'Subject',     value: meta ? meta.label : '—' },
          { label: 'Type',        value: selectedItem ? TYPE_LABELS[selectedItem.type] : '—' },
          { label: 'Borrowed on', value: formatDate(record.borrowedDate) },
          { label: 'Due date',    value: formatDate(record.dueDate) },
        ].map(row => (
          <div key={row.label} className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-semibold text-foreground text-right max-w-[60%] leading-snug">{row.value}</span>
          </div>
        ))}

        {/* Availability status */}
        <div className="px-4 py-3 bg-secondary/10 flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">Status</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Active loan
          </span>
        </div>
      </div>

      {/* Pickup reminder */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-left mb-4">
        <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-[11px] text-amber-700">
          Please collect the item from the <strong>library counter</strong> and present your <strong>NIC</strong> and this loan reference number. Items must be returned by <strong>{formatShort(record.dueDate)}</strong>.
        </p>
      </div>

      {/* Returns link */}
      <p className="text-xs text-muted-foreground mb-6">
        Track your loans and return items on the{' '}
        <a href="/library/returns" className="underline hover:text-foreground transition-colors">Returns page →</a>
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleBorrowAnother}
          className="flex-1 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98]"
        >
          Borrow another item
        </button>
        <a
          href="/library"
          className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-secondary/30 transition-colors text-center"
        >
          Back to catalog
        </a>
      </div>
    </div>
  );
}