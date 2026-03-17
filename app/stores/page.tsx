// app/stores/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreType = "custom" | "template";

interface Store {
  slug: string;
  name: string;
  type: StoreType;
  isNew?: boolean;
  bannerStyle: React.CSSProperties;
  bannerText: string;
  category: string;
  description: string;
  shipping: string;
  payment: string;
  tags: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STORES: Store[] = [
  {
    slug: "casecraft",
    name: "CaseCraft",
    type: "custom",
    isNew: true,
    bannerStyle: { background: "#1a1a1a", color: "#fff" },
    bannerText: "CASECRAFT",
    category: "Phone cases",
    description:
      "Design your own printed phone case — pick your model, upload your photo, preview it live.",
    shipping: "Ships island-wide",
    payment: "COD",
    tags: ["Custom print", "iPhone", "Samsung"],
  },
  {
    slug: "bloom-and-co",
    name: "Bloom & Co.",
    type: "template",
    bannerStyle: { background: "#f5f0e8", color: "#2c2c1a", fontFamily: "Georgia, serif" },
    bannerText: "Bloom & Co.",
    category: "Flowers",
    description:
      "Fresh flower arrangements and bouquets for every occasion, delivered same-day in Colombo.",
    shipping: "Colombo only",
    payment: "COD",
    tags: ["Bouquets", "Gifting", "Same-day"],
  },
  {
    slug: "zylon",
    name: "Zylon Apparel",
    type: "template",
    isNew: true,
    bannerStyle: { background: "#0f2027", color: "#c9a96e", letterSpacing: "4px" },
    bannerText: "ZYLON",
    category: "Clothing",
    description:
      "Minimal streetwear made in Sri Lanka. Small-batch drops, direct from the designer.",
    shipping: "Ships island-wide",
    payment: "COD",
    tags: ["Streetwear", "Unisex", "Local brand"],
  },
  {
    slug: "scent-lab",
    name: "Scent Lab",
    type: "custom",
    bannerStyle: { background: "#1b3a2f", color: "#7ecfa0", fontFamily: "Georgia, serif", letterSpacing: "1px" },
    bannerText: "Scent Lab",
    category: "Fragrance",
    description:
      "Build your own attar blend — choose base, heart and top notes, name your scent, order it bottled.",
    shipping: "Ships island-wide",
    payment: "Bank transfer",
    tags: ["Attar", "Custom blend", "Artisan"],
  },
  {
    slug: "kade-crafts",
    name: "Kade Crafts",
    type: "template",
    bannerStyle: { background: "#faf5f0", color: "#5c3d2e" },
    bannerText: "KADE CRAFTS",
    category: "Handmade",
    description:
      "Handmade resin art, earrings and home décor by local artisans across Sri Lanka.",
    shipping: "Ships island-wide",
    payment: "COD",
    tags: ["Resin art", "Jewellery", "Home décor"],
  },
];

type FilterKey = "all" | "custom" | "template" | "new";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All"           },
  { key: "custom",   label: "Custom builds" },
  { key: "template", label: "Templates"     },
  { key: "new",      label: "New arrivals"  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ type }: { type: StoreType }) {
  return type === "custom" ? (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3C3489] shrink-0">
      Custom build
    </span>
  ) : (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#E1F5EE] text-[#085041] shrink-0">
      Template
    </span>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group block bg-background border border-border rounded-xl overflow-hidden
                 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20"
    >
      {/* Banner */}
      <div
        className="h-24 w-full flex items-center justify-center text-2xl font-semibold tracking-widest"
        style={store.bannerStyle}
      >
        {store.bannerText}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">{store.name}</span>
          <Badge type={store.type} />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {store.description}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
          <span>{store.category}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{store.shipping}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{store.payment}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {store.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function EmptySlot() {
  return (
    <Link
      href="/stores/apply"
      className="flex flex-col items-center justify-center gap-2 min-h-[200px]
                 border border-dashed border-border rounded-xl bg-muted/30
                 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50"
    >
      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg">
        +
      </div>
      <p className="text-sm">Open your store here</p>
      <span className="text-xs opacity-60">Apply for a spot — we verify every seller</span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered = STORES.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new") return s.isNew;
    return s.type === activeFilter;
  });

  return (
    <>
      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-30 bg-background/80">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">
              Home
            </Link>
            <ChevronRight size={11} />
            <span className="text-foreground">Stores</span>
          </div>

          {/* Filter pills */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeFilter === key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Store count */}
          <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
            <span className="text-foreground font-semibold">{STORES.length}</span> verified stores
          </p>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 min-w-0">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Browse the Mall
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Every store is verified and curated — shop with confidence.
            </p>
          </div>

          {/* Mobile filter pills */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto scrollbar-hide mb-5">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border
                  ${activeFilter === key
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((store) => (
              <StoreCard key={store.slug} store={store} />
            ))}
            <EmptySlot />
          </div>

        </div>
      </div>
    </>
  );
}