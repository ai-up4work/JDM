'use client';
// lib/Booking/context.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Operator, Bus } from './mock/operators';

interface BookingState {
  operator: Operator | null;
  bus: Bus | null;
  selectedSeats: string[]; // seat ids
  passengerName: string;
  passengerPhone: string;
  passengerGender: 'male' | 'female';
}

interface BookingContextValue extends BookingState {
  setOperator: (op: Operator | null) => void;
  setBus: (bus: Bus | null) => void;
  setSelectedSeats: (seats: string[]) => void;
  setPassengerName: (name: string) => void;
  setPassengerPhone: (phone: string) => void;
  setPassengerGender: (gender: 'male' | 'female') => void;
  clearBooking: () => void;
}

const defaultState: BookingState = {
  operator: null,
  bus: null,
  selectedSeats: [],
  passengerName: '',
  passengerPhone: '',
  passengerGender: 'male',
};

const BookingContext = createContext<BookingContextValue | null>(null);

const STORAGE_KEY = 'booking-state';

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const update = (patch: Partial<BookingState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const value: BookingContextValue = {
    ...state,
    setOperator: op => update({ operator: op }),
    setBus: bus => update({ bus }),
    setSelectedSeats: seats => update({ selectedSeats: seats }),
    setPassengerName: name => update({ passengerName: name }),
    setPassengerPhone: phone => update({ passengerPhone: phone }),
    setPassengerGender: gender => update({ passengerGender: gender }),
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