'use client';
// lib/library/context.tsx  →  Global state backed by Convex

import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export type Subject = string;
export type ItemType = 'book' | 'journal' | 'workbook' | 'reference';
export type BorrowStatus = 'active' | 'returned' | 'overdue';

export interface LibraryItem {
  _id: Id<'items'>;
  id: string;           // referenceNumber — used for display
  title: string;
  author?: string;
  subject: Subject;
  type: ItemType;
  isbn?: string;
  referenceNumber: string;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  year?: number;
  edition?: string;
}

export interface BorrowRecord {
  _id: Id<'borrowRecords'>;
  id: string;
  itemId: Id<'items'>;
  itemTitle: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerNIC: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: BorrowStatus;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}

function computeStatus(returnedDate: string | undefined, due: string): BorrowStatus {
  if (returnedDate) return 'returned';
  if (new Date(due) < new Date()) return 'overdue';
  return 'active';
}

function mapRecord(r: any): BorrowRecord {
  return {
    ...r,
    id: r._id,
    status: computeStatus(r.returnedDate, r.dueDate),
  };
}

function mapItem(r: any): LibraryItem {
  return {
    ...r,
    id: r.referenceNumber,
  };
}

// ─── State / context types ───────────────────────────────────────────────────

interface LibraryState {
  selectedItem: LibraryItem | null;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerNIC: string;
  activeSubject: Subject | 'all';
  searchQuery: string;
}

interface LibraryContextValue extends LibraryState {
  items: LibraryItem[];
  borrowRecords: BorrowRecord[];
  loading: boolean;
  setSelectedItem: (item: LibraryItem | null) => void;
  setBorrowerName: (v: string) => void;
  setBorrowerPhone: (v: string) => void;
  setBorrowerEmail: (v: string) => void;
  setBorrowerNIC: (v: string) => void;
  setActiveSubject: (s: Subject | 'all') => void;
  setSearchQuery: (q: string) => void;
  borrowItem: () => Promise<BorrowRecord | null>;
  returnItem: (recordId: Id<'borrowRecords'>) => Promise<void>;
  clearBorrowerForm: () => void;
  getActiveRecords: () => BorrowRecord[];
  getOverdueRecords: () => BorrowRecord[];
  getRecordsByNIC: (nic: string) => BorrowRecord[];
  getItemById: (id: Id<'items'>) => LibraryItem | undefined;
  filteredItems: () => LibraryItem[];
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LibraryContext = createContext<LibraryContextValue | null>(null);

const defaultFormState: LibraryState = {
  selectedItem: null,
  borrowerName: '',
  borrowerPhone: '',
  borrowerEmail: '',
  borrowerNIC: '',
  activeSubject: 'all',
  searchQuery: '',
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<LibraryState>(defaultFormState);

  // ── Convex queries (real-time, auto-updating) ─────────────────────────────
  const rawItems   = useQuery(api.library.getItems);
  const rawRecords = useQuery(api.library.getBorrowRecords);

  // ── Convex mutations ──────────────────────────────────────────────────────
  const borrowMutation = useMutation(api.library.borrowItem);
  const returnMutation = useMutation(api.library.returnItem);

  const items: LibraryItem[]     = (rawItems   ?? []).map(mapItem);
  const borrowRecords: BorrowRecord[] = (rawRecords ?? []).map(mapRecord);
  const loading = rawItems === undefined || rawRecords === undefined;

  const update = (patch: Partial<LibraryState>) =>
    setFormState(prev => ({ ...prev, ...patch }));

  // ── borrow ────────────────────────────────────────────────────────────────
  const borrowItem = async (): Promise<BorrowRecord | null> => {
    const { selectedItem, borrowerName, borrowerPhone, borrowerEmail, borrowerNIC } = formState;
    if (!selectedItem || selectedItem.availableCopies < 1) return null;

    try {
      await borrowMutation({
        itemId: selectedItem._id,
        itemTitle: selectedItem.title,
        borrowerName,
        borrowerPhone,
        borrowerEmail: borrowerEmail || undefined,
        borrowerNIC,
        borrowedDate: new Date().toISOString(),
        dueDate: makeDueDate(),
      });

      // Return a minimal record for the confirmation page
      return {
        _id: '' as any,
        id: '',
        itemId: selectedItem._id,
        itemTitle: selectedItem.title,
        borrowerName,
        borrowerPhone,
        borrowerEmail,
        borrowerNIC,
        borrowedDate: new Date().toISOString(),
        dueDate: makeDueDate(),
        status: 'active',
      };
    } catch (err: any) {
      console.error('borrowItem error:', err.message);
      return null;
    }
  };

  // ── return ────────────────────────────────────────────────────────────────
  const returnItem = async (recordId: Id<'borrowRecords'>): Promise<void> => {
    try {
      await returnMutation({ recordId });
    } catch (err: any) {
      console.error('returnItem error:', err.message);
    }
  };

  // ── value ─────────────────────────────────────────────────────────────────
  const value: LibraryContextValue = {
    ...formState,
    items,
    borrowRecords,
    loading,

    setSelectedItem: item => update({ selectedItem: item }),
    setBorrowerName: v => update({ borrowerName: v }),
    setBorrowerPhone: v => update({ borrowerPhone: v }),
    setBorrowerEmail: v => update({ borrowerEmail: v }),
    setBorrowerNIC: v => update({ borrowerNIC: v }),
    setActiveSubject: s => update({ activeSubject: s }),
    setSearchQuery: q => update({ searchQuery: q }),

    borrowItem,
    returnItem,

    clearBorrowerForm: () =>
      setFormState(prev => ({
        ...prev,
        borrowerName: '',
        borrowerPhone: '',
        borrowerEmail: '',
        borrowerNIC: '',
        selectedItem: null,
      })),

    getActiveRecords: () =>
      borrowRecords.filter(r => r.status === 'active' || r.status === 'overdue'),

    getOverdueRecords: () =>
      borrowRecords.filter(r => r.status === 'overdue'),

    getRecordsByNIC: (nic: string) =>
      borrowRecords.filter(r => r.borrowerNIC === nic),

    getItemById: (id: Id<'items'>) =>
      items.find(i => i._id === id),

    filteredItems: () => {
      const { activeSubject, searchQuery } = formState;
      return items.filter(item => {
        const matchSubject = activeSubject === 'all' || item.subject === activeSubject;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          item.title.toLowerCase().includes(q) ||
          (item.author ?? '').toLowerCase().includes(q) ||
          (item.isbn ?? '').includes(q) ||
          item.referenceNumber.toLowerCase().includes(q);
        return matchSubject && matchSearch;
      });
    },
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}