// lib/Booking/mock/seats.ts

export type SeatGender = 'male' | 'female' | null;

export interface Seat {
  id: string;       // e.g. "1A"
  row: number;
  col: 'A' | 'B' | 'C' | 'D';
  gender: SeatGender; // null = available
  held: boolean;
}

// Deterministic pseudo-random seeded by busId so seats are consistent across renders
function seededRand(busId: string, index: number): number {
  const seed = busId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((seed * 9301 + index * 49297 + 233) % 233280) / 233280;
}

export function generateSeats(busId: string): Seat[] {
  const cols: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const seats: Seat[] = [];

  for (let row = 1; row <= 13; row++) {
    cols.forEach((col, ci) => {
      const r = seededRand(busId, row * 10 + ci);
      let gender: SeatGender = null;
      if (r < 0.18) gender = 'male';
      else if (r < 0.30) gender = 'female';
      seats.push({ id: `${row}${col}`, row, col, gender, held: false });
    });
  }

  return seats;
}