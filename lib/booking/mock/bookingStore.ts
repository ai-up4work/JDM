// lib/Booking/mock/bookingStore.ts
//
// Module-level singleton Map — lives for the lifetime of the browser tab.
// BroadcastChannel propagates mutations to other tabs.

import { generateSeats, Seat } from './seats';

type BusId = string;

const store = new Map<BusId, Seat[]>();

function getOrInit(busId: BusId): Seat[] {
  if (!store.has(busId)) {
    store.set(busId, generateSeats(busId));
  }
  return store.get(busId)!;
}

function broadcast(busId: BusId, seats: Seat[]) {
  if (typeof window === 'undefined') return;
  try {
    const ch = new BroadcastChannel('bus-seats');
    ch.postMessage({ busId, seats: JSON.parse(JSON.stringify(seats)) });
    ch.close();
  } catch {}
}

export function getSeats(busId: BusId): Seat[] {
  return JSON.parse(JSON.stringify(getOrInit(busId)));
}

export function holdSeat(busId: BusId, seatId: string): Seat[] {
  const seats = getOrInit(busId);
  const seat = seats.find(s => s.id === seatId);
  if (seat && seat.gender === null) seat.held = true;
  broadcast(busId, seats);
  return JSON.parse(JSON.stringify(seats));
}

export function releaseSeat(busId: BusId, seatId: string): Seat[] {
  const seats = getOrInit(busId);
  const seat = seats.find(s => s.id === seatId);
  if (seat) seat.held = false;
  broadcast(busId, seats);
  return JSON.parse(JSON.stringify(seats));
}

export function confirmSeat(busId: BusId, seatId: string, gender: 'male' | 'female'): Seat[] {
  const seats = getOrInit(busId);
  const seat = seats.find(s => s.id === seatId);
  if (seat) {
    seat.gender = gender;
    seat.held = false;
  }
  broadcast(busId, seats);
  return JSON.parse(JSON.stringify(seats));
}