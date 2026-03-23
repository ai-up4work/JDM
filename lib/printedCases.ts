// ─── Pre-printed cases catalogue ─────────────────────────────────────────────
// Add your images to /public/phoneCases/Printed/ and register them here.
// Each entry needs: id, file (relative to /phoneCases/Printed/), label,
// compatibleModels (display string), and optional tags for filtering.

export interface PrintedCase {
  id: string;
  file: string;         // filename inside /public/phoneCases/Printed/
  label: string;        // display name
  subtitle?: string;    // e.g. "Abstract · Dark"
  compatible: string;   // e.g. "iPhone 13 / 14 / 15 series"
  price: number;        // LKR — default 1500
  tags?: string[];      // for future filtering
  isNew?: boolean;
  isBestseller?: boolean;
}

export const PRINTED_CASES: PrintedCase[] = [
  {
    id: 'pc-001',
    file: 'case-001.png',
    label: 'Sunset Waves',
    subtitle: 'Abstract · Warm',
    compatible: 'iPhone 13 / 14 / 15',
    price: 1500,
    tags: ['abstract', 'warm'],
    isBestseller: true,
  },
  {
    id: 'pc-002',
    file: 'case-002.png',
    label: 'Midnight Bloom',
    subtitle: 'Floral · Dark',
    compatible: 'iPhone 13 / 14 / 15',
    price: 1500,
    tags: ['floral', 'dark'],
    isNew: true,
  },
  {
    id: 'pc-003',
    file: 'case-003.png',
    label: 'Neo Grid',
    subtitle: 'Geometric · Minimal',
    compatible: 'Samsung S23 / S24',
    price: 1500,
    tags: ['geometric', 'minimal'],
  },
  {
    id: 'pc-004',
    file: 'case-004.png',
    label: 'Ocean Drift',
    subtitle: 'Nature · Blue',
    compatible: 'iPhone 13 / 14 / 15',
    price: 1500,
    tags: ['nature', 'cool'],
  },
  {
    id: 'pc-005',
    file: 'case-005.png',
    label: 'Tokyo Nights',
    subtitle: 'Urban · Neon',
    compatible: 'Samsung S22 / S23',
    price: 1500,
    tags: ['urban', 'neon'],
    isBestseller: true,
  },
  {
    id: 'pc-006',
    file: 'case-006.png',
    label: 'Sakura Dream',
    subtitle: 'Floral · Pastel',
    compatible: 'iPhone 14 / 15',
    price: 1500,
    tags: ['floral', 'pastel'],
    isNew: true,
  },

  // ── Mock entries ──
  ...Array.from({ length: 37 }).map((_, i) => {
    const idNum = i + 7;
    return {
      id: `pc-${String(idNum).padStart(3, '0')}`,
      file: `case-${String(idNum).padStart(3, '0')}.png`,
      label: [
        'Aurora Glow', 'Desert Lines', 'Velvet Smoke', 'Crystal Fade',
        'Electric Pulse', 'Monochrome Ink', 'Golden Horizon',
        'Cyber Wave', 'Pastel Clouds', 'Urban Texture',
        'Retro Stripes', 'Galaxy Mist', 'Stone Marble',
        'Neon Splash', 'Soft Gradient', 'Ink Flow',
        'Abstract Dust', 'Digital Rain', 'Vintage Paper',
        'Color Burst', 'Midnight Lines', 'Dreamscape',
        'Muted Tones', 'Shadow Play', 'Aqua Lines',
        'Modern Grid', 'Lava Flow', 'Ice Texture',
        'Calm Waves', 'Pixel Drift', 'Street Paint',
        'Soft Bloom', 'Horizon Fade', 'Deep Space',
        'Cloud Nine', 'Urban Blur', 'Zen Pattern'
      ][i],
      subtitle: [
        'Abstract · Cool', 'Minimal · Neutral', 'Dark · Texture',
        'Gradient · Soft', 'Neon · Bold'
      ][i % 5],
      compatible: i % 2 === 0
        ? 'iPhone 13 / 14 / 15'
        : 'Samsung S22 / S23 / S24',
      price: 1500,
      tags: ['trending'],
      isNew: i % 6 === 0,
      isBestseller: i % 8 === 0,
    };
  }),
];