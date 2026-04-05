'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Palette, Package } from 'lucide-react';
import CustomCaseBuilder from '@/components/CustomCaseBuilder';
import PrePrintedCases from '@/components/PrePrintedCases';

type Tab = 'custom' | 'preprinted';

export default function CustomCasePage() {
  const [activeTab, setActiveTab] = useState<Tab>('custom');

  return (
    <div className="min-h-screen bg-background">

      

      {/* ── Main content — identical wrapper to original ── */}
      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-violet-500" />
              <span className="text-xs font-medium text-violet-500 uppercase tracking-widest">
                Custom printed · Island-wide delivery
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
              Phone cases
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              Design your own with a personal photo, or pick from our ready-to-ship collection.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`
                flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-semibold
                transition-all duration-200 flex-1 sm:flex-none
                ${activeTab === 'custom'
                  ? 'bg-foreground text-background border-foreground shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                  : 'bg-background text-foreground border-border hover:border-foreground/30 hover:bg-secondary/40'}
              `}
            >
              <Palette size={15} className="shrink-0" />
              <div className="text-left">
                <p className="leading-tight text-sm">Custom case</p>
                <p className={`text-[10px] font-normal mt-0.5 ${activeTab === 'custom' ? 'text-background/70' : 'text-muted-foreground'}`}>
                  Upload your photo
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preprinted')}
              className={`
                flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-semibold
                transition-all duration-200 flex-1 sm:flex-none relative
                ${activeTab === 'preprinted'
                  ? 'bg-foreground text-background border-foreground shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                  : 'bg-background text-foreground border-border hover:border-foreground/30 hover:bg-secondary/40'}
              `}
            >
              <Package size={15} className="shrink-0" />
              <div className="text-left">
                <p className="leading-tight text-sm">Ready-made</p>
                <p className={`text-[10px] font-normal mt-0.5 ${activeTab === 'preprinted' ? 'text-background/70' : 'text-muted-foreground'}`}>
                  From LKR 1,500
                </p>
              </div>
              <span className={`
                absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider
                ${activeTab === 'preprinted' ? 'bg-white text-foreground' : 'bg-violet-500 text-white'}
              `}>
                New
              </span>
            </button>
          </div>

          {/* Tab content — components render their own grid/layout inside */}
          {activeTab === 'custom' && <CustomCaseBuilder />}
          {activeTab === 'preprinted' && <PrePrintedCases />}

        </div>
      </div>

    </div>
  );
}