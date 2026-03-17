/**
 * lib/caseTypes/caseTypes.meta.ts
 *
 * All printable phone case & accessory types available via Printify.
 * Each entry is a CaseType — a product category, not a phone model.
 *
 * Used to:
 *  - Drive the product-type selector in the custom case UI
 *  - Show pricing, availability, and feature badges
 *  - Gate which phone models are available per type (via compatibleBrands)
 *  - Inform customers of protection level, bulk, and special features
 */

export type CaseTypeId =
  | 'tough-cases'
  | 'tough-phone-cases'
  | 'tough-magnetic-cases'
  | 'slim-phone-cases'
  | 'slim-cases'
  | 'snap-cases'
  | 'flexi-cases'
  | 'impact-resistant-cases'
  | 'clear-cases'
  | 'clear-impact-resistant-cases'
  | 'magnetic-impact-resistant-cases'
  | 'biodegradable-cases'
  | 'card-holder-cases'
  | 'flip-cases'
  | 'vegan-wallet'
  | 'phone-skin'
  | 'click-on-grip'
  | 'wireless-charging-pad'
  | 'uv-sanitizer-pad';

export type ProtectionLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type BulkLevel       = 'none' | 'low' | 'medium' | 'high' | 'highest';
export type Tier            = 'tough' | 'impact' | 'slim' | 'specialty' | 'accessory';
export type Supplier        = 'SPOKE' | 'WOYC' | 'Casestry' | 'SwagRabbit';

export interface CaseType {
  id:               CaseTypeId;
  label:            string;
  tier:             Tier;
  supplier:         Supplier;
  /** Short description shown in cards */
  tagline:          string;
  /** Full description shown in detail/tooltip */
  description:      string;
  priceUSD:         number;         // base price
  premiumPriceUSD:  number;         // Printify Premium price
  sizes:            number;         // number of compatible sizes
  colors?:          number;         // if the case body comes in colors
  protection:       ProtectionLevel; // 0 = none, 5 = maximum
  bulk:             BulkLevel;
  magsafe:          boolean;
  transparent:      boolean;
  /** Whether a custom image/design can be printed on this product */
  printable:        boolean;
  /** Brands this type is compatible with (null = all brands) */
  compatibleBrands: ('iphone' | 'samsung' | 'google')[] | null;
  badge?:           'bestseller' | 'sale' | 'early-access' | 'eco-friendly' | 'new';
  /** Whether this is a case or a separate accessory */
  isAccessory:      boolean;
  /** Folder name inside /public/phoneCases/ — null until mockups are added */
  mockupFolder:     string | null;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const CASE_TYPES: CaseType[] = [

  // ── TOUGH TIER ─────────────────────────────────────────────────────────────

  {
    id:               'tough-cases',
    label:            'Tough Cases',
    tier:             'tough',
    supplier:         'WOYC',
    tagline:          'Maximum protection, dual-layer build',
    description:      'Dual-layer construction: hard polycarbonate back with a soft rubber inner layer. The most popular tough format — 80 sizes across iPhone, Samsung, and Google.',
    priceUSD:         14.48,
    premiumPriceUSD:  10.73,
    sizes:            80,
    protection:       5,
    bulk:             'high',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    badge:            'bestseller',
    isAccessory:      false,
    mockupFolder:     'toughCases',   // ← your existing ToughCases folder
  },

  {
    id:               'tough-phone-cases',
    label:            'Tough Phone Cases',
    tier:             'tough',
    supplier:         'SPOKE',
    tagline:          'Original tough series — print-template assets',
    description:      'Same dual-layer hard shell as Tough Cases. Original series with print-template style mockups (300 dpi, dimension labels, port notch). Heavier case border, large bold camera cutout.',
    priceUSD:         12.62,
    premiumPriceUSD:  9.57,
    sizes:            42,
    protection:       5,
    bulk:             'high',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: ['iphone', 'samsung'],
    isAccessory:      false,
    mockupFolder:     'toughPhoneCases', // ← your existing Tough Phone Cases folder
  },

  {
    id:               'tough-magnetic-cases',
    label:            'Tough Magnetic Cases',
    tier:             'tough',
    supplier:         'WOYC',
    tagline:          'Dual-layer tough build with MagSafe magnets',
    description:      'Same hard polycarbonate + rubber dual-layer construction as Tough Cases, with an embedded MagSafe magnet ring. Works with MagSafe chargers, car mounts, and wallets. iPhone 12+ only.',
    priceUSD:         17.71,
    premiumPriceUSD:  12.84,
    sizes:            19,
    protection:       5,
    bulk:             'high',
    magsafe:          true,
    transparent:      false,
    printable:        true,
    compatibleBrands: ['iphone'],
    badge:            'bestseller',
    isAccessory:      false,
    mockupFolder:     null,
  },

  // ── IMPACT TIER ────────────────────────────────────────────────────────────

  {
    id:               'impact-resistant-cases',
    label:            'Impact-Resistant Cases',
    tier:             'impact',
    supplier:         'Casestry',
    tagline:          'Shock-absorbing corners, slim profile',
    description:      'Single-layer with engineered shock-absorbing corners and raised camera/screen edges. Lighter and slimmer than tough cases while still offering meaningful drop protection.',
    priceUSD:         11.51,
    premiumPriceUSD:  8.81,
    sizes:            46,
    protection:       4,
    bulk:             'medium',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'clear-impact-resistant-cases',
    label:            'Clear Impact-Resistant Cases',
    tier:             'impact',
    supplier:         'Casestry',
    tagline:          'Transparent protection — phone colour shows through',
    description:      'Same shock-absorbing construction as Impact-Resistant Cases but fully transparent. The design prints on the inner surface so it stays scratch-free. Your phone\'s original colour shows through.',
    priceUSD:         12.10,
    premiumPriceUSD:  9.03,
    sizes:            45,
    protection:       4,
    bulk:             'medium',
    magsafe:          false,
    transparent:      true,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'magnetic-impact-resistant-cases',
    label:            'Magnetic Impact-Resistant Cases',
    tier:             'impact',
    supplier:         'Casestry',
    tagline:          'Clear impact protection + MagSafe',
    description:      'Transparent impact-resistant construction with embedded MagSafe magnets. Protective + transparent + magnetic — ideal for iPhone 12+ users who want MagSafe without sacrificing the phone\'s look.',
    priceUSD:         16.91,
    premiumPriceUSD:  12.14,
    sizes:            23,
    protection:       4,
    bulk:             'medium',
    magsafe:          true,
    transparent:      true,
    printable:        true,
    compatibleBrands: ['iphone'],
    badge:            'sale',
    isAccessory:      false,
    mockupFolder:     null,
  },

  // ── SLIM TIER ──────────────────────────────────────────────────────────────

  {
    id:               'slim-phone-cases',
    label:            'Slim Phone Cases',
    tier:             'slim',
    supplier:         'SPOKE',
    tagline:          'Ultra-thin hard shell, pure aesthetics',
    description:      'Thin single-layer hard shell. Minimal bulk — purely aesthetic. No meaningful drop protection. Best for customers who want a custom design without adding bulk to their phone.',
    priceUSD:         12.08,
    premiumPriceUSD:  9.01,
    sizes:            35,
    protection:       1,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'slim-cases',
    label:            'Slim Cases',
    tier:             'slim',
    supplier:         'Casestry',
    tagline:          'Slim hard shell by Casestry',
    description:      'Similar to Slim Phone Cases — thin single-layer hard shell. Different supplier (Casestry) means slightly different material quality and fit. Compare alongside Slim Phone Cases when choosing.',
    priceUSD:         12.32,
    premiumPriceUSD:  9.38,
    sizes:            31,
    protection:       1,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'snap-cases',
    label:            'Snap Cases',
    tier:             'slim',
    supplier:         'WOYC',
    tagline:          'Widest slim compatibility — 62 sizes',
    description:      'Hard shell that snaps onto the back. Slightly thinner than slim cases. Maximum print area on the flat back — great for full-bleed designs. 62 sizes makes this the most compatible slim format.',
    priceUSD:         13.20,
    premiumPriceUSD:  9.57,
    sizes:            62,
    protection:       1,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'flexi-cases',
    label:            'Flexi Cases',
    tier:             'slim',
    supplier:         'WOYC',
    tagline:          'Soft TPU rubber — 92 sizes, most compatible',
    description:      'Soft flexible TPU rubber single-layer case. Flexes instead of shattering on impact. Slightly grippy feel. Highest size count (92) — most universally compatible format across all brands.',
    priceUSD:         10.48,
    premiumPriceUSD:  7.83,
    sizes:            92,
    protection:       2,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'clear-cases',
    label:            'Clear Cases',
    tier:             'slim',
    supplier:         'WOYC',
    tagline:          'Transparent slim — phone colour shows through',
    description:      'Fully transparent slim case. Design prints on the inner surface. The phone\'s original colour and finish remain visible. Minimal protection — purely aesthetic with transparency.',
    priceUSD:         10.06,
    premiumPriceUSD:  7.52,
    sizes:            27,
    protection:       1,
    bulk:             'low',
    magsafe:          false,
    transparent:      true,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'biodegradable-cases',
    label:            'Biodegradable Cases',
    tier:             'slim',
    supplier:         'WOYC',
    tagline:          'Eco-friendly plant-based material',
    description:      'Slim single-layer construction made from plant-based or compostable materials. Comparable print quality and durability to regular slim cases. Appeals to eco-conscious customers. 56 sizes.',
    priceUSD:         16.10,
    premiumPriceUSD:  12.03,
    sizes:            56,
    protection:       2,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    badge:            'eco-friendly',
    isAccessory:      false,
    mockupFolder:     null,
  },

  // ── SPECIALTY TIER ─────────────────────────────────────────────────────────

  {
    id:               'card-holder-cases',
    label:            'Phone Case With Card Holder',
    tier:             'specialty',
    supplier:         'WOYC',
    tagline:          'Built-in card slots — replaces your wallet',
    description:      'Hard back case with 1–3 card slots moulded into the back. Holds credit cards, ID, and transit cards. Replaces a wallet for many customers. Bulkier than slim cases due to card pocket depth.',
    priceUSD:         16.10,
    premiumPriceUSD:  12.12,
    sizes:            26,
    protection:       3,
    bulk:             'medium',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'flip-cases',
    label:            'Flip Cases',
    tier:             'specialty',
    supplier:         'WOYC',
    tagline:          'Folio cover — protects screen too',
    description:      'Folio-style hinged cover that folds over the screen. Full front and back protection. Usually includes card slots inside. Print goes on the outer cover. Most bulk but only type protecting the screen.',
    priceUSD:         20.93,
    premiumPriceUSD:  15.53,
    sizes:            42,
    protection:       3,
    bulk:             'highest',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      false,
    mockupFolder:     null,
  },

  {
    id:               'vegan-wallet',
    label:            'Vegan Wallet (MagSafe Compatible)',
    tier:             'specialty',
    supplier:         'WOYC',
    tagline:          'MagSafe detachable wallet — vegan leather',
    description:      'Detachable MagSafe wallet in vegan leather. Not a case — attaches magnetically to the back of any MagSafe case. Holds 1–3 cards. Universal size (attaches via MagSafe ring). 2 colour options.',
    priceUSD:         20.05,
    premiumPriceUSD:  14.53,
    sizes:            1,
    colors:           2,
    protection:       0,
    bulk:             'none',
    magsafe:          true,
    transparent:      false,
    printable:        true,
    compatibleBrands: ['iphone'],
    isAccessory:      true,
    mockupFolder:     null,
  },

  {
    id:               'phone-skin',
    label:            'Phone Skin',
    tier:             'specialty',
    supplier:         'WOYC',
    tagline:          'Adhesive vinyl wrap — zero bulk, zero protection',
    description:      'Precision-cut adhesive vinyl wrap covering the back and sides of the phone. No added bulk whatsoever. No drop protection. Purely changes the phone\'s look. Needs exact cutouts per model — 17 sizes.',
    priceUSD:         16.57,
    premiumPriceUSD:  12.01,
    sizes:            17,
    protection:       0,
    bulk:             'none',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    badge:            'early-access',
    isAccessory:      false,
    mockupFolder:     null,
  },

  // ── ACCESSORIES ────────────────────────────────────────────────────────────

  {
    id:               'click-on-grip',
    label:            'Phone Click-On Grip',
    tier:             'accessory',
    supplier:         'WOYC',
    tagline:          'Click-on grip & stand — universal fit',
    description:      'Branded grip/ring/stand accessory that clicks onto the back of the phone or a compatible case. Similar to a PopSocket but with a click-on mechanism. 1 universal size, 1 colour.',
    priceUSD:         13.69,
    premiumPriceUSD:  10.22,
    sizes:            1,
    colors:           1,
    protection:       0,
    bulk:             'low',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      true,
    mockupFolder:     null,
  },

  {
    id:               'wireless-charging-pad',
    label:            'Wireless Charging Pad',
    tier:             'accessory',
    supplier:         'SwagRabbit',
    tagline:          'Branded Qi wireless charging pad',
    description:      'Branded wireless Qi charging pad. Print your design on the pad surface. Desk accessory — not a phone case. 1 size, 5 colour options for the pad body.',
    priceUSD:         12.88,
    premiumPriceUSD:  9.63,
    sizes:            1,
    colors:           5,
    protection:       0,
    bulk:             'none',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      true,
    mockupFolder:     null,
  },

  {
    id:               'uv-sanitizer-pad',
    label:            'UV Phone Sanitizer & Wireless Charging Pad',
    tier:             'accessory',
    supplier:         'SwagRabbit',
    tagline:          'UV-C sanitizer + wireless charging — premium desk piece',
    description:      'UV-C light sanitizer box that sanitises your phone while wirelessly charging it. Premium price reflects electronics inside. Print your branding on the exterior. 1 size, 1 colour.',
    priceUSD:         37.84,
    premiumPriceUSD:  27.42,
    sizes:            1,
    colors:           1,
    protection:       0,
    bulk:             'none',
    magsafe:          false,
    transparent:      false,
    printable:        true,
    compatibleBrands: null,
    isAccessory:      true,
    mockupFolder:     null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getCaseType = (id: CaseTypeId) =>
  CASE_TYPES.find(c => c.id === id);

export const getCaseTypesByTier = (tier: Tier) =>
  CASE_TYPES.filter(c => c.tier === tier);

export const TIERS: { id: Tier; label: string; desc: string }[] = [
  { id: 'tough',     label: 'Tough',       desc: 'Maximum drop protection'         },
  { id: 'impact',    label: 'Impact',      desc: 'Balanced protection & slim'       },
  { id: 'slim',      label: 'Slim',        desc: 'Minimal bulk, pure aesthetics'    },
  { id: 'specialty', label: 'Specialty',   desc: 'Wallets, flips & skins'           },
  { id: 'accessory', label: 'Accessories', desc: 'Grips, pads & charging'          },
];

export const BADGE_LABELS: Record<NonNullable<CaseType['badge']>, string> = {
  'bestseller':   'Bestseller',
  'sale':         'Sale',
  'early-access': 'Early Access',
  'eco-friendly': 'Eco-friendly',
  'new':          'New',
};

export const SUPPLIER_LABELS: Record<Supplier, string> = {
  SPOKE:       'SPOKE Custom Products',
  WOYC:        'WOYC',
  Casestry:    'Casestry',
  SwagRabbit:  'SwagRabbit',
};