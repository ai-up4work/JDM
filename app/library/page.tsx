'use client';
// app/library/page.tsx  →  Catalog — browse, search and filter library items

import Link from 'next/link';
import { useLibrary } from '@/lib/library/context';
import { SUBJECT_META, TYPE_LABELS } from '@/lib/library/subjects';
import { Subject } from '@/lib/library/context';

const SUBJECTS: Array<Subject | 'all'> = ['all', 'physics', 'chemistry', 'biology', 'mathematics'];

const SUBJECT_COLORS: Record<Subject, string> = {
  physics:     'bg-blue-600',
  chemistry:   'bg-emerald-600',
  biology:     'bg-green-700',
  mathematics: 'bg-amber-500',
};

export default function CatalogPage() {
  const {
    filteredItems, activeSubject, setActiveSubject,
    searchQuery, setSearchQuery, setSelectedItem,
  } = useLibrary();

  const items = filteredItems();

  const stats = {
    total: items.length,
    available: items.filter(i => i.availableCopies > 0).length,
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Science Library Catalog</h1>
        <p className="text-sm text-muted-foreground">
          {stats.available} of {stats.total} items available to borrow
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Subject filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {SUBJECTS.map(s => {
          const active = activeSubject === s;
          const meta = s !== 'all' ? SUBJECT_META[s] : null;
          return (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                active
                  ? s === 'all'
                    ? 'bg-foreground text-background border-foreground'
                    : `${meta!.accent} text-white border-transparent`
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground',
              ].join(' ')}
            >
              {s === 'all' ? 'All Subjects' : meta!.label}
            </button>
          );
        })}
      </div>

      {/* Item grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No items found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const meta = SUBJECT_META[item.subject];
            const available = item.availableCopies > 0;
            return (
              <Link
                key={item.id}
                href="/library/borrow"
                onClick={() => setSelectedItem(item)}
                className="group rounded-2xl border border-border bg-background hover:border-foreground/30 hover:shadow-sm transition-all overflow-hidden flex flex-col"
              >
                {/* Color band */}
                <div className={`h-1.5 w-full ${SUBJECT_COLORS[item.subject]}`} />

                <div className="p-4 flex flex-col gap-2 flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.accentLight} ${meta.accentText}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.edition && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.edition} ed.
                      </span>
                    )}
                  </div>

                  {/* Title & author */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-snug group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.isbn}
                    </span>
                    <span className={[
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200',
                    ].join(' ')}>
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