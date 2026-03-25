// app/stores/muizza-fashion/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Scissors, Trash2,
  Plus, Minus, Package, CheckCircle,
  Ruler, Palette, Clock,
} from 'lucide-react';
import type { MFCartItem } from '@/lib/muizza.types';

const WA_NUMBER = (process.env.NEXT_PUBLIC_MF_WHATSAPP ?? '+94755354830').replace(/\D/g, '');
const CART_KEY  = 'mf_cart';

function fmtPrice(lkr: number) {
  return `රු${lkr.toLocaleString('en-LK')}`;
}
function readCart(): MFCartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: MFCartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('mf_cart_updated'));
}

export default function MuizzaFashionCartPage() {
  const [items,   setItems]   = useState<MFCartItem[]>([]);
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [notes,   setNotes]   = useState('');
  const [sent,    setSent]    = useState(false);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener('mf_cart_updated', sync);
    return () => window.removeEventListener('mf_cart_updated', sync);
  }, []);

  const updateQty = (idx: number, delta: number) => {
    const next = [...items];
    next[idx].qty = Math.max(1, next[idx].qty + delta);
    setItems(next); writeCart(next);
  };
  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next); writeCart(next);
  };
  const clear = () => { setItems([]); writeCart([]); };

  const itemLines = items
    .map((it, i) =>
      `*${i + 1}. ${it.name}*\n` +
      `   Colour: ${it.selectedColour || '—'}\n` +
      `   Fabric: ${it.selectedFabric || '—'}\n` +
      `   Size / Measurements: ${it.customMeasurements || it.selectedSize || '—'}\n` +
      `   Quantity: ${it.qty}\n` +
      `   Starting from: ${fmtPrice(it.basePrice)} each`
    ).join('\n\n');

  const waText = encodeURIComponent(
    `Assalamu Alaikum! 🌙 I'd like to place a bulk enquiry with Muizza Fashion.\n\n` +
    `*My Enquiry Bag (${items.length} style${items.length !== 1 ? 's' : ''})*\n\n` +
    `${itemLines}\n\n` +
    `*My Details:*\n` +
    `• Name: ${name || '—'}\n` +
    `• Phone: ${phone || '—'}\n` +
    `• Delivery address: ${address || '—'}\n` +
    (notes ? `• Notes: ${notes}\n` : '') +
    `\nPlease confirm fabric availability, final pricing and delivery dates. Thank you! ✂️`
  );

  if (items.length === 0 && !sent) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="w-full px-4 sm:px-10 lg:px-40">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-5 py-32">
            <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Package size={28} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-1">Your enquiry bag is empty</p>
              <p className="text-sm text-muted-foreground max-w-xs">Browse our styles and add pieces you'd like custom-tailored.</p>
            </div>
            <Link href="/stores/muizza-fashion"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity">
              <Scissors size={14} /> Browse styles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="w-full px-4 sm:px-10 lg:px-40">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-5 py-32">
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-1">Enquiry sent!</p>
              <p className="text-sm text-muted-foreground max-w-xs">We'll confirm fabric availability, pricing and delivery time shortly on WhatsApp.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button type="button" onClick={() => { clear(); setSent(false); }}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                Clear bag
              </button>
              <Link href="/stores/muizza-fashion"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity">
                <Scissors size={14} /> Browse more styles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="w-full px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">Enquiry bag</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} style{items.length !== 1 ? 's' : ''} · Review and send your order enquiry via WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

            {/* Left: item list */}
            <div className="flex flex-col gap-4">
              {items.map((item, idx) => (
                <div key={`${item.id}-${idx}`}
                  className="flex gap-4 p-4 rounded-2xl border border-border bg-background hover:bg-secondary/10 transition-colors">
                  <Link href={`/stores/muizza-fashion/${item.slug}`}>
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-secondary/40 shrink-0">
                      {item.image
                        ? <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Scissors size={18} className="text-muted-foreground/30" /></div>
                      }
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{item.categoryLabel}</p>
                        <Link href={`/stores/muizza-fashion/${item.slug}`}>
                          <p className="text-sm font-semibold text-foreground line-clamp-2 hover:underline">{item.name}</p>
                        </Link>
                      </div>
                      <button type="button" onClick={() => remove(idx)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 mb-3">
                      {item.selectedColour && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Palette size={10} /> {item.selectedColour}</span>}
                      {item.selectedFabric && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Scissors size={10} /> {item.selectedFabric}</span>}
                      {(item.customMeasurements || item.selectedSize) && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Ruler size={10} /> {item.customMeasurements || item.selectedSize}</span>}
                      {item.estimatedDays > 0 && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={10} /> ~{item.estimatedDays} days</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">
                        {fmtPrice(item.basePrice * item.qty)}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">(from {fmtPrice(item.basePrice)} each)</span>
                      </p>
                      <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden">
                        <button type="button" onClick={() => updateQty(idx, -1)} className="px-3 py-1.5 hover:bg-secondary transition-colors"><Minus size={11} /></button>
                        <span className="px-3 py-1.5 text-xs font-bold text-foreground border-x border-border min-w-[32px] text-center">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(idx, 1)} className="px-3 py-1.5 hover:bg-secondary transition-colors"><Plus size={11} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={clear}
                className="self-start text-xs text-muted-foreground hover:text-foreground underline hover:no-underline transition-colors mt-1">
                Clear all items
              </button>
            </div>

            {/* Right: summary + form */}
            <div className="flex flex-col gap-5">
              <div className="p-5 rounded-2xl border border-border bg-secondary/10">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Order summary</p>
                <div className="flex flex-col gap-2 mb-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-muted-foreground line-clamp-1 flex-1">{item.name} × {item.qty}</span>
                      <span className="text-foreground font-medium shrink-0">{fmtPrice(item.basePrice * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Estimated starting from</span>
                  <span className="text-base font-bold text-foreground">{fmtPrice(items.reduce((s, i) => s + i.basePrice * i.qty, 0))}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  Final price confirmed after fabric selection. Delivery charges added at checkout.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-background flex flex-col gap-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Your details</p>
                {[
                  { label: 'Name',             value: name,    setter: setName,    placeholder: 'e.g. Fathima' },
                  { label: 'WhatsApp number',  value: phone,   setter: setPhone,   placeholder: 'e.g. 077 123 4567' },
                  { label: 'Delivery address', value: address, setter: setAddress, placeholder: 'City or full address' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[11px] font-medium text-foreground mb-1.5">{f.label}</label>
                    <input type="text" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                        placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                        focus:border-foreground/30 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1.5">
                    Additional notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Rush order, special requests, reference photos link…"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                      placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                      focus:border-foreground/30 transition-all resize-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  onClick={() => setSent(true)}
                  className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold
                    flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send enquiry via WhatsApp
                </a>
                <p className="text-[10px] text-center text-muted-foreground">
                  We confirm fabric, final price and delivery time before stitching begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
      <div className="max-w-7xl mx-auto h-14 flex items-center gap-2 px-4 sm:px-10 lg:px-40 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
        <ChevronRight size={11} />
        <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
        <ChevronRight size={11} />
        <Link href="/stores/muizza-fashion" className="hover:text-foreground transition-colors font-medium">Muizza Fashion</Link>
        <ChevronRight size={11} />
        <span className="text-foreground font-medium">Enquiry bag</span>
      </div>
    </div>
  );
}