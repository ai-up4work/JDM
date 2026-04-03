'use client';
// components/booking/StepBar.tsx

import { usePathname } from 'next/navigation';

const STEPS = [
  { n: 1, label: 'Operator' },
  { n: 2, label: 'Bus' },
  { n: 3, label: 'Seats' },
  { n: 4, label: 'Confirm' },
];

function currentStep(pathname: string): number {
  if (pathname.includes('/confirm')) return 4;
  const segments = pathname.replace('/booking', '').split('/').filter(Boolean);
  if (segments.length === 0) return 1;
  if (segments.length === 1) return 2;
  if (segments.length === 2) return 3;
  return 1;
}

export default function StepBar({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  const active = currentStep(pathname);

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-0 py-1">
        {STEPS.map((step, i) => {
          const done = step.n < active;
          const isActive = step.n === active;

          return (
            <div key={step.n} className="flex flex-col items-center">
              {/* Step row: dot + label */}
              <div className="flex items-center gap-2.5 w-full">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300
                    ${done
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground/50'}`}
                >
                  {done ? '✓' : step.n}
                </span>
                <span
                  className={`text-[11px] font-medium transition-colors whitespace-nowrap
                    ${isActive ? 'text-foreground font-semibold' : done ? 'text-emerald-600' : 'text-muted-foreground/50'}`}
                >
                  {step.label}
                </span>
              </div>
              {/* Vertical connector */}
              {i < STEPS.length - 1 && (
                <div className={`w-px h-6 ml-3 my-0.5 transition-colors ${done ? 'bg-emerald-400' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Original horizontal layout (kept for reuse elsewhere)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = step.n < active;
        const isActive = step.n === active;

        return (
          <div key={step.n} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300
                  ${done
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-foreground text-background'
                    : 'border border-border text-muted-foreground/50'}`}
              >
                {done ? '✓' : step.n}
              </span>
              <span
                className={`text-[11px] font-medium hidden sm:block transition-colors
                  ${isActive ? 'text-foreground' : done ? 'text-emerald-600' : 'text-muted-foreground/50'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 sm:w-8 h-px mx-1.5 transition-colors ${done ? 'bg-emerald-400' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}