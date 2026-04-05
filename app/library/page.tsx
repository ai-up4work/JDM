'use client';

import Link from 'next/link';
import { useLibrary } from '@/lib/library/context';
import { getSubjectMeta, TYPE_LABELS } from '@/lib/library/subjects';
import { Subject } from '@/lib/library/context';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';

const KNOWN_SUBJECTS: Array<Subject | 'all'> = ['all'];

function CatalogSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-56 rounded-lg bg-muted animate-pulse mb-2" />
        <div className="h-4 w-40 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="h-10 w-full rounded-xl bg-muted animate-pulse mb-5" />
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['All Subjects', 'Physics', 'Chemistry', 'Biology', 'Mathematics'].map(s => (
          <div key={s} className="h-7 rounded-full bg-muted animate-pulse" style={{ width: `${s.length * 8 + 24}px` }} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-muted animate-pulse" />
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const {
    filteredItems, activeSubject, setActiveSubject,
    searchQuery, setSearchQuery, setSelectedItem,
    items: allItems, loading,
  } = useLibrary();

  if (loading) return <CatalogSkeleton />;

  const items = filteredItems();

  const dynamicSubjects: Array<Subject | 'all'> = [
    'all',
    ...Array.from(new Set([
      ...KNOWN_SUBJECTS.filter(s => s !== 'all'),
      ...allItems.map(i => i.subject),
    ])),
  ];

  const stats = {
    total: allItems.length,
    available: allItems.filter(i => i.availableCopies > 0).length,
  };

  return (
    <div>

      {/* ── Hero Banner ── */}
      {/* min-h lets content expand naturally on iPad instead of clipping */}
      <div
        className="relative overflow-hidden mb-8 -mt-4 lg:px-20"
        style={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          minHeight: 'clamp(200px, 24vw, 320px)',
          background: 'linear-gradient(135deg, #0a1a12 0%, #0f2318 40%, #0d2e1e 70%, #092018 100%)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute" style={{ right: '-5%', top: '-30%', width: '55%', paddingBottom: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,78,59,0.5) 0%, transparent 65%)' }} />
          <div className="absolute" style={{ left: '-5%', bottom: '-40%', width: '45%', paddingBottom: '45%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(15,30,25,0.65) 0%, transparent 65%)' }} />
          <div className="absolute" style={{ left: '0', top: '-20%', width: '30%', paddingBottom: '30%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(13,46,30,0.6) 0%, transparent 70%)' }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.10] mix-blend-overlay pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        {/* ── MCC circles ── */}
        <div>
          <div className="absolute pointer-events-none" style={{
            right: '10%', top: '50%', transform: 'translateY(-50%)',
            width: 'min(30%, 260px)', aspectRatio: '1/1', borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.09)',
          }} />
          <div className="absolute pointer-events-none" style={{
            right: 'calc(10% + min(4%, 24px))', top: '50%', transform: 'translateY(-50%)',
            width: 'min(23%, 200px)', aspectRatio: '1/1', borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.15)',
            background: 'radial-gradient(ellipse at center, rgba(6,78,59,0.2) 0%, transparent 70%)',
          }} />
          <div className="absolute overflow-hidden pointer-events-none" style={{
            right: 'calc(10% + min(8%, 52px))', top: '50%', transform: 'translateY(-50%)',
            width: 'min(15%, 140px)', aspectRatio: '1/1', borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.22)', background: 'rgba(6,30,18,0.55)',
          }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '12%' }}>
              <div className="relative w-full h-full">
                <Image src="/mcc-logo.png" alt="Muslim Central College" fill className="object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ──
            Key fix: drop the h-full constraint at sm so the div sizes to content.
            Use padding + gap to space things, not mt-auto (which needs a fixed height parent).
        ── */}
        <div className="relative flex flex-col justify-between px-4 sm:px-10 lg:px-40 py-5 sm:py-6 lg:py-5 gap-4 sm:gap-5 lg:h-full lg:min-h-[320px]">

          {/* Top row */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-white/55 font-medium">MCC Muslim Central College</span>
              <span className="text-white/20 mx-0.5">·</span>
              <span className="text-white/30">Library</span>
            </div>
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="relative shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                <Image src="/ugaa-logo.png" alt="UGAA" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white/80 text-[10px] sm:text-[11px] lg:text-xs font-bold">UGAA</span>
                <span className="text-white/35 text-[8px] sm:text-[9px] lg:text-[10px]">undergrad assoc.</span>
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="shrink-0 rounded-sm w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3" style={{ background: '#10b981' }} />
              <span className="text-[8px] sm:text-[10px] lg:text-[11px] font-bold text-emerald-400 uppercase tracking-[0.14em]">
                Undergraduate Association · Book Cloud
              </span>
            </div>
            <h1
              className="font-black text-white leading-none tracking-tight text-xl sm:text-3xl lg:text-5xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              UGAA Book Cloud
            </h1>
            <p className="text-white/50 text-[10px] sm:text-sm lg:text-base leading-relaxed max-w-[55%] sm:max-w-[50%] lg:max-w-[42%]">
              Browse, borrow and return books managed by the Undergraduate Association.
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="shrink-0 h-px w-4 sm:w-6" style={{ background: 'rgba(16,185,129,0.6)' }} />
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-white/20 tracking-widest uppercase font-medium">
                Muslim Central College · Akkaraipattu
              </span>
            </div>
            <div
              className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 shrink-0"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <GraduationCap className="text-emerald-400 shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3" />
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-semibold text-emerald-400">
                {stats.available} / {stats.total} available
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search by title, author, or reference number…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">✕</button>
        )}
      </div>

      {/* ── Subject tabs ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {dynamicSubjects.map(s => {
          const active = activeSubject === s;
          const meta = s !== 'all' ? getSubjectMeta(s) : null;
          return (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                active
                  ? s === 'all' ? 'bg-foreground text-background border-foreground' : `${meta!.accent} text-white border-transparent`
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground',
              ].join(' ')}
            >
              {s === 'all' ? 'All Subjects' : meta!.label}
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No items found. Try adjusting your search or filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const meta = getSubjectMeta(item.subject);
            const available = item.availableCopies > 0;
            return (
              <Link
                key={item.id}
                href="/library/borrow"
                onClick={() => setSelectedItem(item)}
                className="group rounded-2xl border border-border bg-background hover:border-foreground/30 hover:shadow-sm transition-all overflow-hidden flex flex-col"
              >
                <div className={`h-1.5 w-full ${meta.accent}`} />
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.accentLight} ${meta.accentText}`}>{meta.label}</span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{TYPE_LABELS[item.type] ?? item.type}</span>
                    {item.edition && <span className="text-[10px] text-muted-foreground">{item.edition} ed.</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-snug group-hover:underline">{item.title}</h3>
                    {item.author && <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.description || 'No description available.'}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{item.isbn}</span>
                    <span className={['text-[10px] font-bold px-2 py-0.5 rounded-full', available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'].join(' ')}>
                      {available ? `${item.availableCopies} available` : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}