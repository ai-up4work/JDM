// lib/library/subjects.ts  →  Subject metadata (colors, labels, accent classes)

import { Subject } from './context';

export interface SubjectMeta {
  label: string;
  accent: string;       // Tailwind bg for badges / active tabs
  accentText: string;   // Tailwind text for on-accent labels
  accentBorder: string; // Tailwind border for cards
  accentLight: string;  // Tailwind bg for light tint
  icon: string;         // emoji-free: short Unicode symbol
}

export const SUBJECT_META: Record<Subject, SubjectMeta> = {
  physics: {
    label: 'Physics',
    accent: 'bg-blue-600',
    accentText: 'text-blue-700',
    accentBorder: 'border-blue-200',
    accentLight: 'bg-blue-50',
    icon: 'Phy',
  },
  chemistry: {
    label: 'Chemistry',
    accent: 'bg-emerald-600',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-200',
    accentLight: 'bg-emerald-50',
    icon: 'Che',
  },
  biology: {
    label: 'Biology',
    accent: 'bg-green-700',
    accentText: 'text-green-700',
    accentBorder: 'border-green-200',
    accentLight: 'bg-green-50',
    icon: 'Bio',
  },
  mathematics: {
    label: 'Mathematics',
    accent: 'bg-amber-600',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-200',
    accentLight: 'bg-amber-50',
    icon: 'Mat',
  },
};

export const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  journal: 'Journal',
  workbook: 'Workbook',
  reference: 'Reference',
};