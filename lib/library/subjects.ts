export interface SubjectMeta {
  label: string;
  accent: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  icon: string;
}

// Default known subjects
export const SUBJECT_META: Record<string, SubjectMeta> = {
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

// Fallback for unknown subjects (e.g. new ones added via Supabase)
export const FALLBACK_META: SubjectMeta = {
  label: 'General',
  accent: 'bg-slate-500',
  accentText: 'text-slate-700',
  accentBorder: 'border-slate-200',
  accentLight: 'bg-slate-50',
  icon: 'Gen',
};

export function getSubjectMeta(subject: string): SubjectMeta {
  return SUBJECT_META[subject] ?? { ...FALLBACK_META, label: subject, icon: subject.slice(0, 3) };
}

export const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  journal: 'Journal',
  workbook: 'Workbook',
  reference: 'Reference',
};