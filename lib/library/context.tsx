'use client';
// lib/library/context.tsx  →  Global state backed by Supabase

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

export type Subject = string;
export type ItemType = 'book' | 'model_paper' | 'journal' | 'workbook' | 'reference';
export type BorrowStatus = 'active' | 'returned' | 'overdue';
export type ItemStatus = 'Available' | 'Unavailable';

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  subject: Subject;
  type: ItemType;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  year: number;
  edition?: string;
  status: ItemStatus;
}

export interface BorrowRecord {
  id: string;
  itemId: string;
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

// ─── Raw Supabase row shapes (snake_case) ────────────────────────────────────

interface RawItem {
  id: string;
  title: string;
  author: string | null;
  subject: Subject | null;
  type: string | null;
  isbn: string | null;
  total_copies: number;
  available_copies: number;
  description: string | null;
  year: number | null;
  edition?: string | null;
  status: ItemStatus | null;
}

interface RawRecord {
  id: string;
  item_id: string;
  item_title: string;
  borrower_name: string;
  borrower_phone: string;
  borrower_email: string | null;
  borrower_nic: string;
  borrowed_date: string;
  due_date: string;
  returned_date?: string | null;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapItem(r: RawItem): LibraryItem {
  return {
    id: r.id,
    title: r.title,
    author: r.author ?? '',
    subject: r.subject ?? 'general',
    type: (r.type ?? 'book') as ItemType,
    isbn: r.isbn ?? '',
    totalCopies: r.total_copies,
    availableCopies: r.available_copies,
    description: r.description ?? '',
    year: r.year ?? 0,
    edition: r.edition ?? undefined,
    status: r.status ?? 'Available',
  };
}

function mapRecord(r: RawRecord): BorrowRecord {
  return {
    id: r.id,
    itemId: r.item_id,
    itemTitle: r.item_title,
    borrowerName: r.borrower_name,
    borrowerPhone: r.borrower_phone,
    borrowerEmail: r.borrower_email ?? '',
    borrowerNIC: r.borrower_nic,
    borrowedDate: r.borrowed_date,
    dueDate: r.due_date,
    returnedDate: r.returned_date ?? undefined,
    status: computeStatus(r.returned_date ?? undefined, r.due_date),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}

function computeStatus(returnedDate: string | undefined, due: string): BorrowStatus {
  if (returnedDate) return 'returned';
  if (new Date(due) < new Date()) return 'overdue';
  return 'active';
}

// ─── State / context types ───────────────────────────────────────────────────

interface LibraryState {
  items: LibraryItem[];
  borrowRecords: BorrowRecord[];
  selectedItem: LibraryItem | null;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerNIC: string;
  activeSubject: Subject | 'all';
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

interface LibraryContextValue extends LibraryState {
  setSelectedItem: (item: LibraryItem | null) => void;
  setBorrowerName: (v: string) => void;
  setBorrowerPhone: (v: string) => void;
  setBorrowerEmail: (v: string) => void;
  setBorrowerNIC: (v: string) => void;
  setActiveSubject: (s: Subject | 'all') => void;
  setSearchQuery: (q: string) => void;
  borrowItem: () => Promise<BorrowRecord | null>;
  returnItem: (recordId: string) => Promise<void>;
  clearBorrowerForm: () => void;
  getActiveRecords: () => BorrowRecord[];
  getOverdueRecords: () => BorrowRecord[];
  getRecordsByNIC: (nic: string) => BorrowRecord[];
  getItemById: (id: string) => LibraryItem | undefined;
  filteredItems: () => LibraryItem[];
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LibraryContext = createContext<LibraryContextValue | null>(null);

const defaultState: LibraryState = {
  items: [],
  borrowRecords: [],
  selectedItem: null,
  borrowerName: '',
  borrowerPhone: '',
  borrowerEmail: '',
  borrowerNIC: '',
  activeSubject: 'all',
  searchQuery: '',
  loading: true,
  error: null,
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(defaultState);

  const update = (patch: Partial<LibraryState>) =>
    setState(prev => ({ ...prev, ...patch }));

  // ── Initial data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      update({ loading: true, error: null });
      try {
        const [{ data: itemRows, error: itemErr }, { data: recordRows, error: recErr }] =
          await Promise.all([
            supabase.from('items').select('*').order('title'),
            supabase.from('borrow_records').select('*').order('borrowed_date', { ascending: false }),
          ]);

        console.log('Fetched items:', itemRows);

        if (itemErr) throw itemErr;
        if (recErr) throw recErr;

        update({
          items: (itemRows as RawItem[]).map(mapItem),
          borrowRecords: (recordRows as RawRecord[]).map(mapRecord),
          loading: false,
        });
      } catch (err: any) {
        update({ error: err.message ?? 'Failed to load library data', loading: false });
      }
    }

    fetchAll();
  }, []);

  // ── borrow ────────────────────────────────────────────────────────────────
  const borrowItem = async (): Promise<BorrowRecord | null> => {
    const { selectedItem, borrowerName, borrowerPhone, borrowerEmail, borrowerNIC } = state;
    if (!selectedItem || selectedItem.availableCopies < 1) return null;

    const due = dueDate();
    const now = new Date().toISOString();

    const { data: inserted, error: insertErr } = await supabase
      .from('borrow_records')
      .insert({
        item_id: selectedItem.id,
        item_title: selectedItem.title,
        borrower_name: borrowerName,
        borrower_phone: borrowerPhone,
        borrower_email: borrowerEmail || null,
        borrower_nic: borrowerNIC,
        borrowed_date: now,
        due_date: due,
      })
      .select()
      .single();

    if (insertErr || !inserted) {
      update({ error: insertErr?.message ?? 'Failed to create borrow record' });
      return null;
    }

    const { error: updateErr } = await supabase
      .from('items')
      .update({ available_copies: selectedItem.availableCopies - 1 })
      .eq('id', selectedItem.id);

    if (updateErr) {
      update({ error: updateErr.message });
      return null;
    }

    const newRecord = mapRecord(inserted as RawRecord);
    setState(prev => ({
      ...prev,
      borrowRecords: [newRecord, ...prev.borrowRecords],
      items: prev.items.map(i =>
        i.id === selectedItem.id
          ? { ...i, availableCopies: i.availableCopies - 1 }
          : i
      ),
    }));

    return newRecord;
  };

  // ── return ────────────────────────────────────────────────────────────────
  const returnItem = async (recordId: string): Promise<void> => {
    const record = state.borrowRecords.find(r => r.id === recordId);
    if (!record || record.returnedDate) return;

    const now = new Date().toISOString();

    const { error: recErr } = await supabase
      .from('borrow_records')
      .update({ returned_date: now })
      .eq('id', recordId);

    if (recErr) { update({ error: recErr.message }); return; }

    const item = state.items.find(i => i.id === record.itemId);
    if (item) {
      const { error: itemErr } = await supabase
        .from('items')
        .update({ available_copies: item.availableCopies + 1 })
        .eq('id', item.id);

      if (itemErr) { update({ error: itemErr.message }); return; }
    }

    setState(prev => ({
      ...prev,
      borrowRecords: prev.borrowRecords.map(r =>
        r.id === recordId
          ? { ...r, returnedDate: now, status: 'returned' as BorrowStatus }
          : r
      ),
      items: prev.items.map(i =>
        i.id === record.itemId
          ? { ...i, availableCopies: i.availableCopies + 1 }
          : i
      ),
    }));
  };

  // ── value ─────────────────────────────────────────────────────────────────
  const value: LibraryContextValue = {
    ...state,

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
      update({
        borrowerName: '',
        borrowerPhone: '',
        borrowerEmail: '',
        borrowerNIC: '',
        selectedItem: null,
      }),

    getActiveRecords: () =>
      state.borrowRecords.filter(r => r.status === 'active' || r.status === 'overdue'),

    getOverdueRecords: () =>
      state.borrowRecords.filter(r => r.status === 'overdue'),

    getRecordsByNIC: (nic: string) =>
      state.borrowRecords.filter(r => r.borrowerNIC === nic),

    getItemById: (id: string) =>
      state.items.find(i => i.id === id),

    filteredItems: () => {
      const { items, activeSubject, searchQuery } = state;
      return items.filter(item => {
        const matchSubject = activeSubject === 'all' || item.subject === activeSubject;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          item.title.toLowerCase().includes(q) ||
          (item.author ?? '').toLowerCase().includes(q) ||
          (item.isbn ?? '').includes(q) ||
          item.id.toLowerCase().includes(q);
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