'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Lock, Eye, EyeOff, LogOut, Package,
  Scissors, CheckCircle, XCircle, Star, Clock,
  RefreshCw, AlertCircle, Tag, Pencil, X, Save,
  BarChart2, ShoppingBag, TrendingUp, Layers,
} from 'lucide-react';
import { checkAdminPassword, adminLogout } from './action';
import type { MFProduct } from '@/lib/muizza.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  total: number;
  featured: number;
  categories: number;
  avgPrice: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) {
  return `රු${lkr.toLocaleString('en-LK')}`;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword]   = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [error,    setError]      = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const ok = await checkAdminPassword(password);
      if (ok) {
        onSuccess();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-12 h-12 rounded-2xl bg-foreground overflow-hidden mb-4">
            <Image
              src="/store-icon/muizza-fashion.png"
              alt="Muizza Fashion"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <h1 className="text-lg font-black text-foreground tracking-tight">MUIZZA FASHION</h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-background border border-border rounded-2xl p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={15} className="text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background
                    placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                    focus:border-foreground/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
                <AlertCircle size={12} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !password}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-bold
                hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><RefreshCw size={13} className="animate-spin" /> Verifying…</>
              ) : (
                <><Lock size={13} /> Enter Admin</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-5">
          <Link href="/stores/muizza-fashion" className="hover:text-foreground transition-colors underline underline-offset-2">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-background hover:bg-secondary/20 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ product, onClose, onSave }: {
  product: MFProduct;
  onClose: () => void;
  onSave: (updated: Partial<MFProduct>) => void;
}) {
  const [name,       setName]       = useState(product.name);
  const [basePrice,  setBasePrice]  = useState(String(product.basePrice));
  const [fabric,     setFabric]     = useState(product.fabric ?? '');
  const [occasion,   setOccasion]   = useState(product.occasion ?? '');
  const [desc,       setDesc]       = useState(product.description ?? '');
  const [estDays,    setEstDays]    = useState(String(product.estimatedDays));
  const [featured,   setFeatured]   = useState(product.featured);
  const [tags,       setTags]       = useState(product.tags?.join(', ') ?? '');

  const handleSave = () => {
    onSave({
      name,
      basePrice: Number(basePrice) || product.basePrice,
      fabric,
      occasion,
      description: desc,
      estimatedDays: Number(estDays) || product.estimatedDays,
      featured,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Editing</p>
            <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {[
            { label: 'Style name',        value: name,       setter: setName,       type: 'text' },
            { label: 'Base price (LKR)',   value: basePrice,  setter: setBasePrice,  type: 'number' },
            { label: 'Fabrics (comma-sep)',value: fabric,     setter: setFabric,     type: 'text' },
            { label: 'Occasions',          value: occasion,   setter: setOccasion,   type: 'text' },
            { label: 'Est. days',          value: estDays,    setter: setEstDays,    type: 'number' },
            { label: 'Tags (comma-sep)',   value: tags,       setter: setTags,       type: 'text' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] font-medium text-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setFeatured(v => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${featured ? 'bg-foreground' : 'bg-border'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${featured ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-foreground">Featured style</span>
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4 flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold
              hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
            <Save size={13} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({
  product, onToggleFeatured, onEdit,
}: {
  product: MFProduct & { active?: boolean };
  onToggleFeatured: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-foreground/20 hover:bg-secondary/10 transition-all group">

      {/* Thumbnail */}
      <div className="relative w-14 h-18 shrink-0 rounded-xl overflow-hidden bg-secondary/40" style={{ height: '72px' }}>
        {product.image
          ? <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Scissors size={16} className="text-muted-foreground/30" />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
          {product.featured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground text-background uppercase tracking-wider shrink-0">
              Featured
            </span>
          )}
          {product.tags?.map(t => (
            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider shrink-0">
              {t}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">{product.categoryLabel}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs font-bold text-foreground">{fmtPrice(product.basePrice)}</span>
          {product.fabric && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Scissors size={9} /> {product.fabric}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock size={9} /> {product.estimatedDays}d
          </span>
          {product.rating > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Star size={9} className="fill-muted-foreground" /> {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onToggleFeatured}
          title={product.featured ? 'Unfeature' : 'Feature'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all
            ${product.featured
              ? 'border-foreground bg-foreground text-background hover:opacity-80'
              : 'border-border hover:border-foreground/40 hover:bg-secondary'}`}
        >
          <Star size={12} className={product.featured ? 'fill-background' : ''} />
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 hover:bg-secondary transition-all"
        >
          <Pencil size={12} />
        </button>
        <Link
          href={`/stores/muizza-fashion/${product.slug}`}
          target="_blank"
          title="View live"
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 hover:bg-secondary transition-all"
        >
          <Eye size={12} />
        </Link>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products,   setProducts]   = useState<MFProduct[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<MFProduct | null>(null);
  const [filter,     setFilter]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isPending,  startTransition] = useTransition();

  const fetchProducts = () => {
    setLoading(true); setError(null);
    fetch('/api/muizza-fashion?per_page=100')
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogout();
      onLogout();
    });
  };

  const handleToggleFeatured = (id: string) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p)
    );
    // In production: call a PATCH /api/muizza-fashion/product?id=... endpoint
  };

  const handleSave = (id: string, updates: Partial<MFProduct>) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
    // In production: call a PATCH /api/muizza-fashion/product?id=... endpoint
  };

  // Stats
  const stats: AdminStats = {
    total:      products.length,
    featured:   products.filter(p => p.featured).length,
    categories: new Set(products.map(p => p.category)).size,
    avgPrice:   products.length
      ? Math.round(products.reduce((s, p) => s + p.basePrice, 0) / products.length)
      : 0,
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchesSearch = !filter ||
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(filter.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(filter.toLowerCase());
    const matchesCat = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-background">

      {/* Top nav */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores/muizza-fashion" className="hover:text-foreground transition-colors font-medium">Muizza Fashion</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-muted-foreground hidden sm:block">Signed in</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium
                hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut size={11} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Product Catalogue</h1>
            <p className="text-sm text-muted-foreground">
              Manage styles, toggle featured, edit details. Changes are in-memory until you wire up the API.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium
              hover:bg-secondary transition-colors shrink-0"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<Package size={16} />}    label="Total styles"  value={stats.total}              sub="in catalogue" />
          <StatCard icon={<Star size={16} />}        label="Featured"      value={stats.featured}           sub="highlighted styles" />
          <StatCard icon={<Layers size={16} />}      label="Categories"    value={stats.categories}         sub="active categories" />
          <StatCard icon={<TrendingUp size={16} />}  label="Avg. price"    value={fmtPrice(stats.avgPrice)} sub="base price" />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name, fabric…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full pl-3.5 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                focus:border-foreground/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                ${!categoryFilter ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap capitalize
                  ${categoryFilter === c ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground ml-auto shrink-0">
            <span className="font-semibold text-foreground">{filtered.length}</span> / {stats.total}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Failed to load products</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <button type="button" onClick={fetchProducts}
                className="mt-1.5 text-xs font-semibold text-foreground underline hover:no-underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <ShoppingBag size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No styles match your filter.</p>
            {(filter || categoryFilter) && (
              <button type="button" onClick={() => { setFilter(''); setCategoryFilter(''); }}
                className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map(p => (
              <ProductRow
                key={p.id}
                product={p}
                onToggleFeatured={() => handleToggleFeatured(p.id)}
                onEdit={() => setEditTarget(p)}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground text-center mt-10 leading-relaxed">
          Edits are in-memory only. To persist, wire{' '}
          <code className="font-mono bg-secondary px-1 py-0.5 rounded">handleSave</code> and{' '}
          <code className="font-mono bg-secondary px-1 py-0.5 rounded">handleToggleFeatured</code>{' '}
          to a <code className="font-mono bg-secondary px-1 py-0.5 rounded">PATCH /api/muizza-fashion/product</code> endpoint.
        </p>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          product={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={updates => handleSave(editTarget.id, updates)}
        />
      )}
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function MuizzaAdminPage() {
  // Three states: 'loading' | 'login' | 'dashboard'
  const [authState, setAuthState] = useState<'loading' | 'login' | 'dashboard'>('loading');

  // On mount, check if a valid session cookie already exists
  useEffect(() => {
    fetch('/api/muizza-fashion/admin-check')
      .then(r => setAuthState(r.ok ? 'dashboard' : 'login'))
      .catch(() => setAuthState('login'));
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authState === 'login') {
    return <LoginScreen onSuccess={() => setAuthState('dashboard')} />;
  }

  return <Dashboard onLogout={() => setAuthState('login')} />;
}