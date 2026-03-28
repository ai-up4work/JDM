'use client';
// lib/library/context.tsx  →  Global state for the science library system

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Subject = 'physics' | 'chemistry' | 'biology' | 'mathematics';
export type ItemType = 'book' | 'journal' | 'workbook' | 'reference';
export type BorrowStatus = 'active' | 'returned' | 'overdue';

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
}

export interface BorrowRecord {
  id: string;
  itemId: string;
  itemTitle: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerNIC: string;
  borrowedDate: string;  // ISO string
  dueDate: string;       // ISO string — 14 days from borrow
  returnedDate?: string;
  status: BorrowStatus;
}

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
}

interface LibraryContextValue extends LibraryState {
  setSelectedItem: (item: LibraryItem | null) => void;
  setBorrowerName: (v: string) => void;
  setBorrowerPhone: (v: string) => void;
  setBorrowerEmail: (v: string) => void;
  setBorrowerNIC: (v: string) => void;
  setActiveSubject: (s: Subject | 'all') => void;
  setSearchQuery: (q: string) => void;
  borrowItem: () => BorrowRecord | null;
  returnItem: (recordId: string) => void;
  clearBorrowerForm: () => void;
  getActiveRecords: () => BorrowRecord[];
  getOverdueRecords: () => BorrowRecord[];
  getRecordsByNIC: (nic: string) => BorrowRecord[];
  getItemById: (id: string) => LibraryItem | undefined;
  filteredItems: () => LibraryItem[];
}

// ─── Seed catalog ────────────────────────────────────────────────────────────

const CATALOG: LibraryItem[] = [
  // Physics
  { id: 'ph-001', title: 'University Physics', author: 'Young & Freedman', subject: 'physics', type: 'book', isbn: '978-0-13-506637-2', totalCopies: 5, availableCopies: 3, description: 'Comprehensive introductory physics covering mechanics, thermodynamics, waves, and electromagnetism.', year: 2019, edition: '15th' },
  { id: 'ph-002', title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', subject: 'physics', type: 'book', isbn: '978-1-118-23072-5', totalCopies: 4, availableCopies: 4, description: 'Standard physics text with clear explanations and rigorous problem sets.', year: 2018, edition: '10th' },
  { id: 'ph-003', title: 'Concepts of Modern Physics', author: 'Arthur Beiser', subject: 'physics', type: 'book', isbn: '978-0-07-288548-7', totalCopies: 3, availableCopies: 1, description: 'Introduction to quantum mechanics, atomic and nuclear physics.', year: 2020, edition: '6th' },
  { id: 'ph-004', title: 'Classical Mechanics', author: 'Herbert Goldstein', subject: 'physics', type: 'reference', isbn: '978-0-201-65702-9', totalCopies: 2, availableCopies: 2, description: 'Advanced treatment including Lagrangian and Hamiltonian formulations.', year: 2001, edition: '3rd' },
  { id: 'ph-005', title: 'Optics & Photonics Journal', author: 'OSA Publishing', subject: 'physics', type: 'journal', isbn: '1943-8206', totalCopies: 1, availableCopies: 1, description: 'Peer-reviewed journal covering advances in optics and photonic sciences.', year: 2024 },

  // Chemistry
  { id: 'ch-001', title: "Atkins' Physical Chemistry", author: 'Peter Atkins & Julio de Paula', subject: 'chemistry', type: 'book', isbn: '978-0-19-876986-6', totalCopies: 5, availableCopies: 2, description: 'Definitive text on thermodynamics, quantum chemistry, and spectroscopy.', year: 2021, edition: '11th' },
  { id: 'ch-002', title: 'Organic Chemistry', author: 'Clayton H. Heathcock', subject: 'chemistry', type: 'book', isbn: '978-0-935702-36-4', totalCopies: 6, availableCopies: 5, description: 'In-depth exploration of organic reactions, mechanisms, and synthesis.', year: 2022, edition: '3rd' },
  { id: 'ch-003', title: 'Inorganic Chemistry', author: 'Shriver & Atkins', subject: 'chemistry', type: 'book', isbn: '978-0-7167-4878-6', totalCopies: 3, availableCopies: 0, description: 'Covers coordination compounds, d-block chemistry, and main group elements.', year: 2020, edition: '5th' },
  { id: 'ch-004', title: 'Analytical Chemistry Workbook', author: 'R.A. Day & A.L. Underwood', subject: 'chemistry', type: 'workbook', isbn: '978-0-13-570670-0', totalCopies: 8, availableCopies: 6, description: 'Practical workbook covering quantitative analysis and lab techniques.', year: 2019 },
  { id: 'ch-005', title: 'Journal of Chemical Education', author: 'ACS Publications', subject: 'chemistry', type: 'journal', isbn: '0021-9584', totalCopies: 1, availableCopies: 1, description: 'Monthly journal featuring chemistry education research and experiments.', year: 2024 },

  // Biology
  { id: 'bi-001', title: 'Campbell Biology', author: 'Jane B. Reece et al.', subject: 'biology', type: 'book', isbn: '978-0-13-409341-2', totalCopies: 6, availableCopies: 4, description: 'The gold standard of introductory biology, from cell biology to ecology.', year: 2021, edition: '12th' },
  { id: 'bi-002', title: 'Molecular Biology of the Cell', author: 'Alberts, Johnson et al.', subject: 'biology', type: 'book', isbn: '978-0-393-88482-1', totalCopies: 4, availableCopies: 3, description: 'Authoritative text on cellular mechanisms and molecular biology.', year: 2022, edition: '7th' },
  { id: 'bi-003', title: 'Human Anatomy & Physiology', author: 'Elaine N. Marieb', subject: 'biology', type: 'book', isbn: '978-0-13-396043-4', totalCopies: 5, availableCopies: 5, description: 'Comprehensive guide to human body systems with clinical applications.', year: 2023, edition: '11th' },
  { id: 'bi-004', title: 'Genetics: Analysis & Principles', author: 'Robert J. Brooker', subject: 'biology', type: 'book', isbn: '978-1-259-70111-7', totalCopies: 3, availableCopies: 2, description: 'Problem-based genetics from Mendelian to molecular and population genetics.', year: 2020, edition: '6th' },
  { id: 'bi-005', title: 'Biology Lab Manual', author: 'Darrell Vodopich', subject: 'biology', type: 'workbook', isbn: '978-0-07-764052-6', totalCopies: 10, availableCopies: 7, description: 'Hands-on lab exercises covering major topics in general biology.', year: 2023 },

  // Mathematics
  { id: 'ma-001', title: 'Calculus: Early Transcendentals', author: 'James Stewart', subject: 'mathematics', type: 'book', isbn: '978-1-285-74155-0', totalCopies: 7, availableCopies: 5, description: 'Widely used calculus text covering single and multivariable calculus.', year: 2020, edition: '8th' },
  { id: 'ma-002', title: 'Linear Algebra and Its Applications', author: 'David C. Lay', subject: 'mathematics', type: 'book', isbn: '978-0-321-98238-4', totalCopies: 5, availableCopies: 3, description: 'Accessible introduction to linear algebra with real-world applications.', year: 2021, edition: '5th' },
  { id: 'ma-003', title: 'Introduction to Probability', author: 'Dimitri P. Bertsekas', subject: 'mathematics', type: 'book', isbn: '978-1-886529-23-6', totalCopies: 4, availableCopies: 4, description: 'Rigorous probability theory with applications to statistics and inference.', year: 2019, edition: '2nd' },
  { id: 'ma-004', title: 'Abstract Algebra', author: 'Dummit & Foote', subject: 'mathematics', type: 'reference', isbn: '978-0-471-43334-7', totalCopies: 2, availableCopies: 1, description: 'Comprehensive reference on groups, rings, fields, and Galois theory.', year: 2004, edition: '3rd' },
  { id: 'ma-005', title: 'Statistics & Probability Workbook', author: 'Alan Agresti', subject: 'mathematics', type: 'workbook', isbn: '978-0-470-45694-0', totalCopies: 8, availableCopies: 8, description: 'Practice-focused workbook on statistical methods and probability distributions.', year: 2022 },
];

// ─── Context setup ────────────────────────────────────────────────────────────

const defaultState: LibraryState = {
  items: CATALOG,
  borrowRecords: [],
  selectedItem: null,
  borrowerName: '',
  borrowerPhone: '',
  borrowerEmail: '',
  borrowerNIC: '',
  activeSubject: 'all',
  searchQuery: '',
};

const LibraryContext = createContext<LibraryContextValue | null>(null);
const STORAGE_KEY = 'library-state-v1';

function dueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}

function computeStatus(record: BorrowRecord): BorrowStatus {
  if (record.returnedDate) return 'returned';
  if (new Date(record.dueDate) < new Date()) return 'overdue';
  return 'active';
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setState(prev => ({
          ...prev,
          borrowRecords: saved.borrowRecords || [],
          items: saved.items || CATALOG,
        }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        borrowRecords: state.borrowRecords,
        items: state.items,
      }));
    } catch {}
  }, [state.borrowRecords, state.items, hydrated]);

  const update = (patch: Partial<LibraryState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const value: LibraryContextValue = {
    ...state,

    setSelectedItem: item => update({ selectedItem: item }),
    setBorrowerName: v => update({ borrowerName: v }),
    setBorrowerPhone: v => update({ borrowerPhone: v }),
    setBorrowerEmail: v => update({ borrowerEmail: v }),
    setBorrowerNIC: v => update({ borrowerNIC: v }),
    setActiveSubject: s => update({ activeSubject: s }),
    setSearchQuery: q => update({ searchQuery: q }),

    borrowItem: () => {
      const { selectedItem, borrowerName, borrowerPhone, borrowerEmail, borrowerNIC, items } = state;
      if (!selectedItem || selectedItem.availableCopies < 1) return null;

      const record: BorrowRecord = {
        id: Math.random().toString(36).slice(2, 10).toUpperCase(),
        itemId: selectedItem.id,
        itemTitle: selectedItem.title,
        borrowerName,
        borrowerPhone,
        borrowerEmail,
        borrowerNIC,
        borrowedDate: new Date().toISOString(),
        dueDate: dueDate(),
        status: 'active',
      };

      const updatedItems = items.map(i =>
        i.id === selectedItem.id
          ? { ...i, availableCopies: i.availableCopies - 1 }
          : i
      );

      setState(prev => ({
        ...prev,
        borrowRecords: [...prev.borrowRecords, record],
        items: updatedItems,
      }));

      return record;
    },

    returnItem: (recordId: string) => {
      setState(prev => {
        const record = prev.borrowRecords.find(r => r.id === recordId);
        if (!record || record.returnedDate) return prev;

        const updatedRecords = prev.borrowRecords.map(r =>
          r.id === recordId
            ? { ...r, returnedDate: new Date().toISOString(), status: 'returned' as BorrowStatus }
            : r
        );
        const updatedItems = prev.items.map(i =>
          i.id === record.itemId
            ? { ...i, availableCopies: i.availableCopies + 1 }
            : i
        );

        return { ...prev, borrowRecords: updatedRecords, items: updatedItems };
      });
    },

    clearBorrowerForm: () =>
      update({ borrowerName: '', borrowerPhone: '', borrowerEmail: '', borrowerNIC: '', selectedItem: null }),

    getActiveRecords: () =>
      state.borrowRecords
        .map(r => ({ ...r, status: computeStatus(r) }))
        .filter(r => r.status === 'active' || r.status === 'overdue'),

    getOverdueRecords: () =>
      state.borrowRecords
        .map(r => ({ ...r, status: computeStatus(r) }))
        .filter(r => r.status === 'overdue'),

    getRecordsByNIC: (nic: string) =>
      state.borrowRecords
        .map(r => ({ ...r, status: computeStatus(r) }))
        .filter(r => r.borrowerNIC === nic),

    getItemById: (id: string) => state.items.find(i => i.id === id),

    filteredItems: () => {
      const { items, activeSubject, searchQuery } = state;
      return items.filter(item => {
        const matchSubject = activeSubject === 'all' || item.subject === activeSubject;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.isbn.includes(q);
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