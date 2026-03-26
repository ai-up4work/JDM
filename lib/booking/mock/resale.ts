// lib/booking/mock/resale.ts

export type ResaleTicket = {
  id: string;
  busId: string;
  operatorId: string;
  operatorName: string;
  accentColor: string;
  from: string;
  to: string;
  departure: string;
  date: string;
  seat: string;
  originalFare: number;
  mediationFee: number;
  totalPrice: number;
  status: 'available' | 'sold' | 'expired';
};

export type MyTicket = {
  id: string;
  busId: string;
  operatorId: string;
  operatorName: string;
  accentColor: string;
  from: string;
  to: string;
  departure: string;
  date: string;
  seat: string;
  fare: number;
  status: 'upcoming' | 'listed' | 'transferred' | 'travelled';
};

export const MY_TICKETS: MyTicket[] = [
  {
    id: 'TKT-001',
    busId: 'al-ahla-1',
    operatorId: 'al-ahla',
    operatorName: 'AL AHLA',
    accentColor: '#1d4ed8',
    from: 'Colombo Fort',
    to: 'Kandy',
    departure: '05:30',
    date: '2026-03-26',
    seat: 'A4',
    fare: 320,
    status: 'upcoming',
  },
  {
    id: 'TKT-002',
    busId: 'mbi-2',
    operatorId: 'mbi',
    operatorName: 'MBI Transport',
    accentColor: '#1d4ed8',
    from: 'Colombo Fort',
    to: 'Galle',
    departure: '07:00',
    date: '2026-03-27',
    seat: 'B2',
    fare: 320,
    status: 'listed',
  },
];

export const RESALE_TICKETS: ResaleTicket[] = [
  {
    id: 'RSL-001',
    busId: 'mjs-1',
    operatorId: 'mjs',
    operatorName: 'MJS Travels',
    accentColor: '#1d4ed8',
    from: 'Colombo Fort',
    to: 'Kandy',
    departure: '05:30',
    date: '2026-03-26',
    seat: 'B7',
    originalFare: 320,
    mediationFee: 75,
    totalPrice: 395,
    status: 'available',
  },
  {
    id: 'RSL-002',
    busId: 'superline-1',
    operatorId: 'superline',
    operatorName: 'Super Line',
    accentColor: '#1d4ed8',
    from: 'Colombo Fort',
    to: 'Kandy',
    departure: '09:30',
    date: '2026-03-26',
    seat: 'C3',
    originalFare: 320,
    mediationFee: 75,
    totalPrice: 395,
    status: 'available',
  },
];