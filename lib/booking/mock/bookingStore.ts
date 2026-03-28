// lib/Booking/mock/bookingStore.ts

// Module-level singleton — lives for the lifetime of the browser tab.
// BroadcastChannel propagates mutations to other tabs.
//
// Flow:
//   User  →  submitRequest()           → status: 'pending'
//   Admin →  assignSeats()             → status: 'assigned'
//   Admin →  confirmRequest()          → status: 'confirmed'  (seats marked in seat map)

import { generateSeats, Seat } from './seats';

type BusId = string;

// ─── Seat store ───────────────────────────────────────────────────────────────

const seatStore = new Map<BusId, Seat[]>();

function getOrInitSeats(busId: BusId): Seat[] {
  if (!seatStore.has(busId)) {
    seatStore.set(busId, generateSeats(busId));
  }
  return seatStore.get(busId)!;
}

function broadcastSeats(busId: BusId, seats: Seat[]) {
  if (typeof window === 'undefined') return;
  try {
    const ch = new BroadcastChannel('bus-seats');
    ch.postMessage({ type: 'seats', busId, seats: JSON.parse(JSON.stringify(seats)) });
    ch.close();
  } catch {}
}

export function getSeats(busId: BusId): Seat[] {
  return JSON.parse(JSON.stringify(getOrInitSeats(busId)));
}

// ─── Request store ────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'assigned' | 'confirmed' | 'cancelled';

export interface BookingRequest {
  id: string;            // random ref e.g. "A3F9B2C1"
  busId: BusId;
  operatorId: string;
  passengerName: string;
  passengerPhone: string;
  passengerGender: 'male' | 'female';
  seatCount: number;
  status: RequestStatus;
  assignedSeats: string[]; // seat ids assigned by admin
  createdAt: string;       // ISO timestamp
}

const requestStore: BookingRequest[] = [];

function randomId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function broadcastRequests() {
  if (typeof window === 'undefined') return;
  try {
    const ch = new BroadcastChannel('bus-seats');
    ch.postMessage({ type: 'requests', requests: JSON.parse(JSON.stringify(requestStore)) });
    ch.close();
  } catch {}
}

export function getAllRequests(): BookingRequest[] {
  return JSON.parse(JSON.stringify(requestStore));
}

export function getRequestsByBus(busId: BusId): BookingRequest[] {
  return JSON.parse(JSON.stringify(requestStore.filter(r => r.busId === busId)));
}

export function getRequest(id: string): BookingRequest | null {
  return JSON.parse(JSON.stringify(requestStore.find(r => r.id === id) ?? null));
}

/** User submits a seat request — no seats assigned yet */
export function submitRequest(data: Omit<BookingRequest, 'id' | 'status' | 'assignedSeats' | 'createdAt'>): BookingRequest {
  const req: BookingRequest = {
    ...data,
    id: randomId(),
    status: 'pending',
    assignedSeats: [],
    createdAt: new Date().toISOString(),
  };
  requestStore.push(req);
  broadcastRequests();
  return JSON.parse(JSON.stringify(req));
}

/** Admin assigns specific seat IDs to a request */
export function assignSeats(requestId: string, seatIds: string[]): BookingRequest | null {
  const req = requestStore.find(r => r.id === requestId);
  if (!req) return null;
  req.assignedSeats = seatIds;
  req.status = 'assigned';
  broadcastRequests();
  return JSON.parse(JSON.stringify(req));
}

/** Admin confirms the assignment — marks seats as booked on the seat map */
export function confirmRequest(requestId: string): BookingRequest | null {
  const req = requestStore.find(r => r.id === requestId);
  if (!req || req.assignedSeats.length === 0) return null;

  // Mark seats on the seat map
  const seats = getOrInitSeats(req.busId);
  req.assignedSeats.forEach(seatId => {
    const seat = seats.find(s => s.id === seatId);
    if (seat) {
      seat.gender = req.passengerGender;
      seat.held = false;
    }
  });
  req.status = 'confirmed';

  broadcastSeats(req.busId, seats);
  broadcastRequests();
  return JSON.parse(JSON.stringify(req));
}

/** Admin cancels a request */
export function cancelRequest(requestId: string): BookingRequest | null {
  const req = requestStore.find(r => r.id === requestId);
  if (!req) return null;

  // Release any held/assigned seats back to available
  if (req.assignedSeats.length > 0) {
    const seats = getOrInitSeats(req.busId);
    req.assignedSeats.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat && seat.gender === null) seat.held = false;
    });
    broadcastSeats(req.busId, seats);
  }

  req.status = 'cancelled';
  req.assignedSeats = [];
  broadcastRequests();
  return JSON.parse(JSON.stringify(req));
}

// ─── Legacy seat helpers (kept for SeatMap component) ────────────────────────

export function holdSeat(busId: BusId, seatId: string): Seat[] {
  const seats = getOrInitSeats(busId);
  const seat = seats.find(s => s.id === seatId);
  if (seat && seat.gender === null) seat.held = true;
  broadcastSeats(busId, seats);
  return JSON.parse(JSON.stringify(seats));
}

export function releaseSeat(busId: BusId, seatId: string): Seat[] {
  const seats = getOrInitSeats(busId);
  const seat = seats.find(s => s.id === seatId);
  if (seat) seat.held = false;
  broadcastSeats(busId, seats);
  return JSON.parse(JSON.stringify(seats));
}