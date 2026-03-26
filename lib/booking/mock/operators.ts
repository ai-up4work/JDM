// lib/Booking/mock/operators.ts
export interface Bus {
  id: string;
  operatorId: string;
  from: string;
  to: string;
  departureTime: string;
  date: string; // ISO date string
  duration: string;
  distance: string;
  fare: number;
  totalSeats: number;
}

export interface Operator {
  id: string;
  name: string;
  type: 'government' | 'private';
  badge?: string;
  rating: number;
  reviews: number;
  amenities: string[];
  fare: number;
  accentColor: string;
  buses: Bus[];
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const OPERATORS: Operator[] = [
  {
    id: 'al-ahla',
    name: 'AL AHLA',
    type: 'private',
    badge: 'Premium',
    rating: 3.8,
    reviews: 1240,
    amenities: ['AC'],
    fare: 320,
    accentColor: '#1a4a8a',
    buses: [
      { id: 'al-ahla-b1', operatorId: 'al-ahla', from: 'Colombo Fort', to: 'Kandy',  departureTime: '05:30', date: getDateOffset(0), duration: '2h 45m', distance: '115 km', fare: 320, totalSeats: 52 },
      { id: 'al-ahla-b2', operatorId: 'al-ahla', from: 'Colombo Fort', to: 'Kandy',  departureTime: '09:30', date: getDateOffset(0), duration: '2h 45m', distance: '115 km', fare: 320, totalSeats: 52 },
      { id: 'al-ahla-b3', operatorId: 'al-ahla', from: 'Colombo Fort', to: 'Galle',  departureTime: '07:00', date: getDateOffset(1), duration: '2h 10m', distance: '119 km', fare: 320, totalSeats: 52 },
      { id: 'al-ahla-b4', operatorId: 'al-ahla', from: 'Colombo Fort', to: 'Jaffna', departureTime: '05:00', date: getDateOffset(1), duration: '6h 30m', distance: '393 km', fare: 320, totalSeats: 52 },
    ],
  },
  {
    id: 'mjs',
    name: 'MJS Travels',
    type: 'private',
    badge: 'Popular',
    rating: 4.5,
    reviews: 876,
    amenities: ['AC', 'WiFi', 'USB'],
    fare: 650,
    accentColor: '#8a2a1a',
    buses: [
      { id: 'mjs-b1', operatorId: 'mjs', from: 'Colombo Fort', to: 'Kandy',        departureTime: '06:00', date: getDateOffset(0), duration: '2h 15m', distance: '115 km', fare: 650, totalSeats: 52 },
      { id: 'mjs-b2', operatorId: 'mjs', from: 'Colombo Fort', to: 'Nuwara Eliya', departureTime: '08:30', date: getDateOffset(0), duration: '3h 30m', distance: '160 km', fare: 650, totalSeats: 52 },
      { id: 'mjs-b3', operatorId: 'mjs', from: 'Colombo Fort', to: 'Trincomalee',  departureTime: '06:00', date: getDateOffset(1), duration: '5h 00m', distance: '257 km', fare: 650, totalSeats: 52 },
      { id: 'mjs-b4', operatorId: 'mjs', from: 'Colombo Fort', to: 'Kandy',        departureTime: '20:00', date: getDateOffset(2), duration: '2h 15m', distance: '115 km', fare: 650, totalSeats: 52 },
    ],
  },
  {
    id: 'mbi',
    name: 'MBI Transport',
    type: 'private',
    rating: 4.2,
    reviews: 534,
    amenities: ['AC', 'USB'],
    fare: 520,
    accentColor: '#1a6a3a',
    buses: [
      { id: 'mbi-b1', operatorId: 'mbi', from: 'Colombo Fort', to: 'Galle',      departureTime: '07:00', date: getDateOffset(0), duration: '2h 00m', distance: '119 km', fare: 520, totalSeats: 52 },
      { id: 'mbi-b2', operatorId: 'mbi', from: 'Colombo Fort', to: 'Matara',     departureTime: '09:30', date: getDateOffset(0), duration: '2h 45m', distance: '160 km', fare: 520, totalSeats: 52 },
      { id: 'mbi-b3', operatorId: 'mbi', from: 'Colombo Fort', to: 'Batticaloa', departureTime: '05:30', date: getDateOffset(1), duration: '6h 00m', distance: '314 km', fare: 520, totalSeats: 52 },
    ],
  },
  {
    id: 'superline',
    name: 'Super Line',
    type: 'private',
    badge: 'Top Rated',
    rating: 4.7,
    reviews: 2103,
    amenities: ['AC', 'WiFi', 'USB', 'Recliner'],
    fare: 850,
    accentColor: '#5a1a8a',
    buses: [
      { id: 'superline-b1', operatorId: 'superline', from: 'Colombo Fort', to: 'Kandy',        departureTime: '06:00', date: getDateOffset(0), duration: '2h 00m', distance: '115 km', fare: 850, totalSeats: 52 },
      { id: 'superline-b2', operatorId: 'superline', from: 'Colombo Fort', to: 'Jaffna',       departureTime: '14:00', date: getDateOffset(0), duration: '5h 45m', distance: '393 km', fare: 850, totalSeats: 52 },
      { id: 'superline-b3', operatorId: 'superline', from: 'Colombo Fort', to: 'Nuwara Eliya', departureTime: '07:00', date: getDateOffset(1), duration: '3h 15m', distance: '160 km', fare: 850, totalSeats: 52 },
      { id: 'superline-b4', operatorId: 'superline', from: 'Colombo Fort', to: 'Trincomalee',  departureTime: '21:30', date: getDateOffset(2), duration: '4h 30m', distance: '257 km', fare: 850, totalSeats: 52 },
    ],
  },
];

export function getOperator(id: string): Operator | undefined {
  return OPERATORS.find(o => o.id === id);
}

export function getBus(operatorId: string, busId: string): Bus | undefined {
  return getOperator(operatorId)?.buses.find(b => b.id === busId);
}