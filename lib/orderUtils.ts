import JSZip from 'jszip';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cod' | 'bank' | 'card' | 'koko' | 'mint';

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
}

export interface OrderItem {
  type: 'custom' | 'preprinted';
  label: string;         // e.g. "Tough Case" or "Sunset Waves"
  modelLabel: string;    // phone model
  templateLabel?: string;// print style (custom only)
  price: number;         // LKR
  imageUrl?: string;     // pre-printed thumbnail
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const WHATSAPP_NUMBER =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+94755354830').replace(/\D/g, '');

export const SRI_LANKA_DISTRICTS = [
  'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo',
  'Galle','Gampaha','Hambantota','Jaffna','Kalutara',
  'Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar',
  'Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya',
  'Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya',
];

// ─── WhatsApp message builder ─────────────────────────────────────────────────

export function buildWhatsAppUrl(params: {
  order: OrderItem;
  delivery: DeliveryDetails;
  payment: PaymentMethod;
  orderId: string;
  hasZip?: boolean;
}) {
  const { order, delivery, payment, orderId, hasZip } = params;

  const paymentLabel: Record<PaymentMethod, string> = {
    cod:  'Cash on Delivery',
    bank: 'Bank Transfer',
    card: 'Card (TBC)',
    koko: 'KOKO (TBC)',
    mint: 'Mint (TBC)',
  };

  const lines = [
    `🛍️ *New Case Order*`,
    `🔖 Ref: ${orderId}`,
    ``,
    `📦 *Order*`,
    `  Type   : ${order.type === 'custom' ? 'Custom Print' : 'Pre-printed'}`,
    `  Case   : ${order.label}`,
    `  Model  : ${order.modelLabel}`,
    ...(order.templateLabel ? [`  Style  : ${order.templateLabel}`] : []),
    `  Price  : LKR ${order.price.toLocaleString()}`,
    ``,
    `🚚 *Delivery*`,
    `  Name   : ${delivery.name}`,
    `  Phone  : ${delivery.phone}`,
    `  Address: ${delivery.address}`,
    `  City   : ${delivery.city}`,
    `  District: ${delivery.district}`,
    `  Postal : ${delivery.postalCode}`,
    ...(delivery.notes ? [`  Notes  : ${delivery.notes}`] : []),
    ``,
    `💳 *Payment* : ${paymentLabel[payment]}`,
    ...(hasZip ? [
      ``,
      `📎 Print ZIP downloaded (order-${orderId}.zip)`,
      `  • original-photo — raw upload`,
      `  • print-composite.png — ready to print`,
    ] : []),
    ``,
    `Please confirm and proceed. Thank you!`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

// ─── Canvas composite + ZIP (custom orders only) ──────────────────────────────

export type TemplateId = 'full' | 'centered' | 'top';

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export async function buildCompositeBlob(params: {
  photoUrl: string;
  mockupSrc: string;
  zoom: number;
  offset: { x: number; y: number };
  template: TemplateId;
  width?: number;
  height?: number;
}): Promise<Blob> {
  const W = params.width  ?? 1080;
  const H = params.height ?? 1920;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const photo = await loadImg(params.photoUrl);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

  const baseScale  = Math.max(W / photo.width, H / photo.height);
  const finalScale = baseScale * params.zoom;
  ctx.translate(W / 2 + params.offset.x, H / 2 + params.offset.y);
  ctx.scale(finalScale, finalScale);
  if (params.template === 'centered') ctx.scale(0.76, 0.76);
  ctx.drawImage(photo, -photo.width / 2, -photo.height / 2);
  ctx.restore();

  if (params.template === 'top') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, H / 2, W, H / 2);
  }

  const mockup = await loadImg(params.mockupSrc);
  ctx.drawImage(mockup, 0, 0, W, H);

  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png', 1)
  );
}

export async function buildAndDownloadZip(params: {
  photoUrl: string;
  mockupSrc: string;
  zoom: number;
  offset: { x: number; y: number };
  template: TemplateId;
  order: OrderItem;
  delivery: DeliveryDetails;
  payment: PaymentMethod;
  orderId: string;
}): Promise<void> {
  const zip = new JSZip();

  // 1. Original photo
  const origBlob = await (await fetch(params.photoUrl)).blob();
  const ext = origBlob.type.includes('png') ? 'png' : 'jpg';
  zip.file(`original-photo.${ext}`, origBlob);

  // 2. Print composite
  const composite = await buildCompositeBlob({
    photoUrl:  params.photoUrl,
    mockupSrc: params.mockupSrc,
    zoom: params.zoom, offset: params.offset, template: params.template,
  });
  zip.file('print-composite.png', composite);

  // 3. Order + delivery sheet
  const info = [
    `Order ref   : ${params.orderId}`,
    ``,
    `── ORDER ───────────────────────`,
    `Case type   : ${params.order.label}`,
    `Phone model : ${params.order.modelLabel}`,
    `Print style : ${params.order.templateLabel ?? 'N/A'}`,
    `Total (LKR) : ${params.order.price.toLocaleString()}`,
    ``,
    `── DELIVERY ────────────────────`,
    `Name        : ${params.delivery.name}`,
    `Phone       : ${params.delivery.phone}`,
    `Address     : ${params.delivery.address}`,
    `City        : ${params.delivery.city}`,
    `District    : ${params.delivery.district}`,
    `Postal code : ${params.delivery.postalCode}`,
    `Notes       : ${params.delivery.notes || '—'}`,
    ``,
    `── PAYMENT ─────────────────────`,
    `Method      : ${params.payment.toUpperCase()}`,
    ``,
    `Generated   : ${new Date().toISOString()}`,
  ].join('\n');
  zip.file('order-info.txt', info);

  // 4. Download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `order-${params.orderId}.zip` });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Order ID generator ───────────────────────────────────────────────────────

export function generateOrderId(): string {
  return `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}