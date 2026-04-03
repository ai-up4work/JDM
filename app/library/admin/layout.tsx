// app/library/admin/layout.tsx
import { LibraryProvider } from '@/lib/library/context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      {children}
    </LibraryProvider>
  );
}