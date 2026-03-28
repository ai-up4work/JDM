'use client';
// lib/booking/context.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Operator, Bus } from './mock/operators';

interface BookingState {
  operator: Operator | null;
  bus: Bus | null;
  seatCount: number;           // how many seats the user wants
  passengerName: string;
  passengerPhone: string;
  passengerGender: 'male' | 'female';
  requestId: string | null;    // set after submitRequest()
}

interface BookingContextValue extends BookingState {
  setOperator: (op: Operator | null) => void;
  setBus: (bus: Bus | null) => void;
  setSeatCount: (n: number) => void;
  setPassengerName: (name: string) => void;
  setPassengerPhone: (phone: string) => void;
  setPassengerGender: (gender: 'male' | 'female') => void;
  setRequestId: (id: string | null) => void;
  clearBooking: () => void;
}

const defaultState: BookingState = {
  operator: null,
  bus: null,
  seatCount: 1,
  passengerName: '',
  passengerPhone: '',
  passengerGender: 'male',
  requestId: null,
};

const BookingContext = createContext<BookingContextValue | null>(null);
const STORAGE_KEY = 'booking-state-v2';

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  const update = (patch: Partial<BookingState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const value: BookingContextValue = {
    ...state,
    setOperator: op => update({ operator: op }),
    setBus: bus => update({ bus }),
    setSeatCount: n => update({ seatCount: n }),
    setPassengerName: name => update({ passengerName: name }),
    setPassengerPhone: phone => update({ passengerPhone: phone }),
    setPassengerGender: gender => update({ passengerGender: gender }),
    setRequestId: id => update({ requestId: id }),
    clearBooking: () => {
      setState(defaultState);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    },
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}