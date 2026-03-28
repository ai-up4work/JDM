'use client';
// app/library/returns/page.tsx  →  Returns — look up active loans and mark as returned

import { useState } from 'react';
import { useLibrary, BorrowRecord } from '@/lib/library/context';
import { formatDate, formatShort, daysUntil, isOverdue } from '@/lib/library/dates';
import { SUBJECT_META, TYPE_LABELS } from '@/lib/library/subjects';

function StatusBadge({ record }: { record: BorrowRecord }) {
  const overdue = isOverdue(record.dueDate) && !record.returnedDate;
  const returned = !!record.returnedDate;

  if (returned) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
      Returned
    </span>
  );
  if (overdue) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
      Overdue
    </span>
  );
  const days = daysUntil(record.dueDate);
  return (
    <span className={[
      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
      days <= 2
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ].join(' ')}>
      Due in {days}d
    </span>
  );
}

export default function ReturnsPage() {
  const { getRecordsByNIC, returnItem, getItemById } = useLibrary();
  const [nic, setNic] = useState('');
  const [searched, setSearched] = useState(false);
  const [returnedId, setReturnedId] = useState<string | null>(null);

  const records = searched ? getRecordsByNIC(nic.trim()) : [];
  const active = records.filter(r => !r.returnedDate);
  const history = records.filter(r => r.returnedDate);

  const handleSearch = () => {
    if (!nic.trim()) return;
    setSearched(true);
    setReturnedId(null);
  };

  const handleReturn = (recordId: string) => {
    returnItem(recordId);
    setReturnedId(recordId);
  };

  return (
    <div className="max-w-[640px] mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Returns</h1>
        <p className="text-sm text-muted-foreground">
          Enter your NIC number to view your active loans and return items.
        </p>
      </div>

      {/* NIC lookup */}
      <div className="rounded-2xl border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Look up your loans</p>
        </div>
        <div className="p-4 flex gap-3">
          <input
            type="text"
            value={nic}
            onChange={e => setNic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter NIC number e.g. 991234567V"
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98] whitespace-nowrap"
          >
            Look up
          </button>
        </div>
      </div>

      {/* Return success toast */}
      {returnedId && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-5">
          <span className="text-emerald-600 text-sm">✓</span>
          <p className="text-xs text-emerald-700 font-semibold">
            Item returned successfully. Thank you!
          </p>
        </div>
      )}

      {/* Results */}
      {searched && (
        <>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No loan records found for NIC <strong className="text-foreground">{nic}</strong>.
            </div>
          ) : (
            <>
              {/* Active loans */}
              {active.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-foreground mb-3">
                    Active loans ({active.length})
                  </h2>
                  <div className="space-y-3">
                    {active.map(record => {
                      const item = getItemById(record.itemId);
                      const meta = item ? SUBJECT_META[item.subject] : null;
                      const overdue = isOverdue(record.dueDate);
                      return (
                        <div
                          key={record.id}
                          className={[
                            'rounded-2xl border overflow-hidden',
                            overdue ? 'border-red-200' : 'border-border',
                          ].join(' ')}
                        >
                          {/* Color band */}
                          {meta && (
                            <div className={`h-1 w-full ${
                              { physics: 'bg-blue-600', chemistry: 'bg-emerald-600', biology: 'bg-green-700', mathematics: 'bg-amber-500' }[item!.subject]
                            }`} />
                          )}

                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground leading-snug">{record.itemTitle}</p>
                                {item && <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {meta && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.accentLight} ${meta.accentText}`}>
                                      {meta.label}
                                    </span>
                                  )}
                                  {item && (
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                      {TYPE_LABELS[item.type]}
                                    </span>
                                  )}
                                  <StatusBadge record={record} />
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{record.id}</span>
                            </div>

                            {/* Dates row */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              {[
                                { label: 'Borrowed', value: formatShort(record.borrowedDate) },
                                { label: 'Due', value: formatShort(record.dueDate) },
                              ].map(d => (
                                <div key={d.label} className="flex flex-col gap-0.5">
                                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                                  <span className={[
                                    'text-xs font-semibold',
                                    d.label === 'Due' && overdue ? 'text-red-700' : 'text-foreground',
                                  ].join(' ')}>{d.value}</span>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => handleReturn(record.id)}
                              className="w-full py-2 rounded-xl border border-foreground text-foreground text-xs font-bold hover:bg-foreground hover:text-background transition-all active:scale-[0.98]"
                            >
                              Mark as returned
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loan history */}
              {history.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-3">
                    Loan history ({history.length})
                  </h2>
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-secondary/30 border-b border-border hidden sm:grid grid-cols-3 gap-4">
                      {['Item', 'Borrowed', 'Returned'].map(h => (
                        <span key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
                      ))}
                    </div>
                    {history.map((record, i) => (
                      <div
                        key={record.id}
                        className={[
                          'px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 flex flex-col gap-1',
                          i < history.length - 1 ? 'border-b border-border' : '',
                        ].join(' ')}
                      >
                        <span className="text-xs font-semibold text-foreground truncate">{record.itemTitle}</span>
                        <span className="text-xs text-muted-foreground">{formatShort(record.borrowedDate)}</span>
                        <span className="text-xs text-muted-foreground">{record.returnedDate ? formatShort(record.returnedDate) : '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Info note */}
      {!searched && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/30 border border-border">
          <span className="text-muted-foreground shrink-0 mt-0.5 text-sm">ℹ</span>
          <p className="text-[11px] text-muted-foreground">
            When returning an item, bring it to the <strong className="text-foreground">library counter</strong> along with your NIC. The librarian will mark it as returned in the system.
          </p>
        </div>
      )}
    </div>
  );
}