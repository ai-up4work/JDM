'use client';
// app/library/admin/page.tsx  →  Admin dashboard — stats, all loans, overdue alerts, inventory

import { useState } from 'react';
import { useLibrary, BorrowRecord, Subject } from '@/lib/library/context';
import { SUBJECT_META, TYPE_LABELS } from '@/lib/library/subjects';
import { formatShort, isOverdue, daysUntil } from '@/lib/library/dates';

type AdminTab = 'overview' | 'loans' | 'inventory';

const SUBJECT_COLORS: Record<Subject, string> = {
  physics:     'bg-blue-600',
  chemistry:   'bg-emerald-600',
  biology:     'bg-green-700',
  mathematics: 'bg-amber-500',
};

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? 'text-foreground'}`}>{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function AdminPage() {
  const {
    items, borrowRecords, getActiveRecords,
    getOverdueRecords, returnItem,
  } = useLibrary();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [returnedId, setReturnedId] = useState<string | null>(null);

  const activeRecords = getActiveRecords();
  const overdueRecords = getOverdueRecords();
  const totalBorrowed = borrowRecords.filter(r => !r.returnedDate).length;
  const totalReturned = borrowRecords.filter(r => r.returnedDate).length;
  const totalItems = items.reduce((s, i) => s + i.totalCopies, 0);
  const totalAvailable = items.reduce((s, i) => s + i.availableCopies, 0);

  const filteredItems = filterSubject === 'all'
    ? items
    : items.filter(i => i.subject === filterSubject);

  const handleReturn = (id: string) => {
    returnItem(id);
    setReturnedId(id);
  };

  const TABS: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'loans',     label: `Active Loans (${activeRecords.length})` },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Library management — loans, returns, and inventory</p>
        </div>
        {overdueRecords.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
            <span className="text-red-600 text-sm">⚠</span>
            <span className="text-xs font-bold text-red-700">
              {overdueRecords.length} overdue loan{overdueRecords.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Currently borrowed" value={totalBorrowed} sub="items out" />
            <StatCard label="Overdue"             value={overdueRecords.length} accent={overdueRecords.length > 0 ? 'text-red-600' : undefined} sub="need chasing" />
            <StatCard label="Total in collection" value={totalItems} sub="across all subjects" />
            <StatCard label="Available now"       value={totalAvailable} sub="ready to lend" accent="text-emerald-600" />
          </div>

          {/* Per-subject breakdown */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-secondary/30 border-b border-border">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">By subject</p>
            </div>
            {(['physics', 'chemistry', 'biology', 'mathematics'] as Subject[]).map(subject => {
              const subItems = items.filter(i => i.subject === subject);
              const total = subItems.reduce((s, i) => s + i.totalCopies, 0);
              const avail = subItems.reduce((s, i) => s + i.availableCopies, 0);
              const out = total - avail;
              const meta = SUBJECT_META[subject];
              return (
                <div key={subject} className="px-4 py-3 border-b border-border last:border-0 flex items-center gap-4">
                  <div className={`w-2 h-8 rounded-full ${SUBJECT_COLORS[subject]}`} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{meta.label}</p>
                    <p className="text-[10px] text-muted-foreground">{subItems.length} titles · {total} copies</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{avail} available</p>
                    <p className="text-[10px] text-muted-foreground">{out} out</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent activity */}
          {borrowRecords.length > 0 && (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-secondary/30 border-b border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Recent activity</p>
              </div>
              {[...borrowRecords].reverse().slice(0, 5).map(r => (
                <div key={r.id} className="px-4 py-3 border-b border-border last:border-0 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{r.itemTitle}</p>
                    <p className="text-[10px] text-muted-foreground">{r.borrowerName} · {r.borrowerNIC}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={[
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      r.returnedDate
                        ? 'bg-secondary text-muted-foreground border-border'
                        : isOverdue(r.dueDate)
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    ].join(' ')}>
                      {r.returnedDate ? 'Returned' : isOverdue(r.dueDate) ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE LOANS ── */}
      {tab === 'loans' && (
        <div className="space-y-4">
          {returnedId && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-600 text-sm">✓</span>
              <p className="text-xs text-emerald-700 font-semibold">Item marked as returned.</p>
            </div>
          )}

          {activeRecords.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No active loans at the moment.
            </div>
          ) : (
            activeRecords.map(record => {
              const overdue = isOverdue(record.dueDate);
              const days = daysUntil(record.dueDate);
              return (
                <div
                  key={record.id}
                  className={[
                    'rounded-2xl border overflow-hidden',
                    overdue ? 'border-red-200' : 'border-border',
                  ].join(' ')}
                >
                  <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
                    overdue ? 'bg-red-50 border-red-200' : 'bg-secondary/30 border-border'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{record.id}</span>
                      {overdue && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                          {Math.abs(days)}d overdue
                        </span>
                      )}
                      {!overdue && days <= 3 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Due in {days}d
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleReturn(record.id)}
                      className="text-[10px] font-bold px-3 py-1 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    >
                      Return
                    </button>
                  </div>

                  <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Item',      value: record.itemTitle },
                      { label: 'Borrower',  value: record.borrowerName },
                      { label: 'NIC',       value: record.borrowerNIC },
                      { label: 'Phone',     value: record.borrowerPhone },
                      { label: 'Borrowed',  value: formatShort(record.borrowedDate) },
                      { label: 'Due',       value: formatShort(record.dueDate) },
                    ].map(row => (
                      <div key={row.label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{row.label}</span>
                        <span className={[
                          'text-xs font-semibold truncate',
                          row.label === 'Due' && overdue ? 'text-red-700' : 'text-foreground',
                        ].join(' ')}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── INVENTORY ── */}
      {tab === 'inventory' && (
        <div>
          {/* Subject filter */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {(['all', 'physics', 'chemistry', 'biology', 'mathematics'] as Array<Subject | 'all'>).map(s => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  filterSubject === s
                    ? s === 'all'
                      ? 'bg-foreground text-background border-foreground'
                      : `${SUBJECT_COLORS[s as Subject]} text-white border-transparent`
                    : 'bg-background text-muted-foreground border-border hover:border-foreground/30',
                ].join(' ')}
              >
                {s === 'all' ? 'All' : SUBJECT_META[s as Subject].label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-secondary/30 border-b border-border grid grid-cols-12 gap-2">
              {['Title', 'Type', 'Total', 'Available', 'Status'].map(h => (
                <span key={h} className={[
                  'text-[10px] font-semibold text-muted-foreground uppercase tracking-wider',
                  h === 'Title' ? 'col-span-5' : h === 'Status' ? 'col-span-2' : 'col-span-1',
                ].join(' ')}>{h}</span>
              ))}
            </div>

            {filteredItems.map((item, i) => {
              const meta = SUBJECT_META[item.subject];
              const out = item.totalCopies - item.availableCopies;
              return (
                <div
                  key={item.id}
                  className={[
                    'px-4 py-3 grid grid-cols-12 gap-2 items-center',
                    i < filteredItems.length - 1 ? 'border-b border-border' : '',
                  ].join(' ')}
                >
                  <div className="col-span-5 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.author}</p>
                  </div>
                  <span className="col-span-1 text-[10px] text-muted-foreground">{TYPE_LABELS[item.type]}</span>
                  <span className="col-span-1 text-xs font-semibold text-foreground">{item.totalCopies}</span>
                  <span className={[
                    'col-span-1 text-xs font-bold',
                    item.availableCopies === 0 ? 'text-red-600' : 'text-emerald-600',
                  ].join(' ')}>{item.availableCopies}</span>
                  <div className="col-span-2">
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${SUBJECT_COLORS[item.subject]}`}
                        style={{ width: `${(item.availableCopies / item.totalCopies) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{out} out</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}