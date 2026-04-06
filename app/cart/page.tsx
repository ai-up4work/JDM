'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, Truck, RefreshCw, Shield } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-40 py-16 sm:py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-6">
            <ShoppingBag size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your bag is empty</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            Browse our stores and add something you love.
          </p>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors"
          >
            Browse stores
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal  = getTotal();
  const shipping  = subtotal > 1000 ? 0 : 200;
  const tax       = Math.round(subtotal * 0.17);
  const grandTotal = subtotal + shipping + tax;

  const fmt = (n: number) =>
    `Rs.\u00a0${n.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Breadcrumb bar ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Cart</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{items.reduce((s, i) => s + i.quantity, 0)}</span> items
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-40 py-8 sm:py-12">

        {/* ── Back link ── */}
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Continue shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group"
              >
                {/* Image */}
                <Link
                  href={`/shop/${item.id}`}
                  className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-secondary/40"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                    {item.category}
                  </p>
                  <Link href={`/shop/${item.id}`}>
                    <p className="text-sm font-semibold text-foreground leading-snug truncate hover:opacity-70 transition-opacity">
                      {item.name}
                    </p>
                  </Link>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-sm font-bold text-foreground mt-1.5">
                    {fmt(item.price)}
                  </p>
                </div>

                {/* Qty + remove */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Quantity stepper */}
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-foreground"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-foreground"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="text-xs font-bold text-foreground">
                    {fmt(item.price * item.quantity)}
                  </p>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.success('Item removed');
                    }}
                    className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Clear cart */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => { clearCart(); toast.success('Cart cleared'); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all items
              </button>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:sticky lg:top-24 space-y-4">

            <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Order summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Shipping {subtotal > 1000 ? <span className="text-emerald-500 text-[10px] font-semibold">(free)</span> : ''}
                  </span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? 'Free' : fmt(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax (17% GST)</span>
                  <span className="font-semibold text-foreground">{fmt(tax)}</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{fmt(grandTotal)}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-3.5 rounded-2xl bg-foreground text-background text-sm font-bold
                  hover:bg-foreground/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.12)]
                  active:scale-[0.98]"
              >
                Proceed to checkout
              </button>
            </div>

            {/* Trust signals */}
            <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
              {[
                { icon: <Truck size={13} />,     label: 'Free shipping on orders above Rs. 1,000' },
                { icon: <RefreshCw size={13} />, label: '7-day easy return policy'                },
                { icon: <Shield size={13} />,    label: 'Secure checkout'                        },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="text-foreground shrink-0">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}