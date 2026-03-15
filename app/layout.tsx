import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "JDM - South Asia's Fashion Discovery Platform",
  description:
    "Shop premium fashion from Pakistani and South Asian designers on JDM. Discover curated collections of women's, men's, and kids fashion.",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)'  },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">

        <Header />

        <div className="flex">

          {/* ── Desktop Sidebar ──
              fixed + top-16 + bottom-0 = always fills from below the header
              all the way to the bottom of the screen, no gap ever.
              overflow-y-auto lets sidebar content scroll independently.
          ── */}
          <aside className="hidden lg:flex lg:flex-col fixed top-16 left-0 bottom-0 w-60 border-r border-border bg-background overflow-y-auto overflow-x-hidden z-30">
            <Sidebar />
          </aside>

          {/* ── Mobile Sidebar Drawer ── */}
          <div
            className="lg:hidden fixed inset-0 z-40 pointer-events-none"
            id="mobile-sidebar-root"
          >
            <div
              className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300"
              id="sidebar-backdrop"
            />
            <div
              className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-background shadow-2xl -translate-x-full transition-transform duration-300 ease-in-out overflow-y-auto"
              id="sidebar-drawer"
            >
              <Sidebar />
            </div>
          </div>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 w-full lg:ml-60">
            {children}
          </main>

        </div>

        {/* <Footer /> */}
        <Toaster position="bottom-right" />
        <Analytics />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var btn      = document.getElementById('mobile-menu-btn');
                var root     = document.getElementById('mobile-sidebar-root');
                var backdrop = document.getElementById('sidebar-backdrop');
                var drawer   = document.getElementById('sidebar-drawer');
                if (!btn || !root || !backdrop || !drawer) return;

                function openDrawer() {
                  root.classList.remove('pointer-events-none');
                  backdrop.classList.remove('opacity-0');
                  backdrop.classList.add('opacity-100', 'pointer-events-auto');
                  drawer.classList.remove('-translate-x-full');
                  drawer.classList.add('translate-x-0');
                  document.body.classList.add('overflow-hidden');
                }

                function closeDrawer() {
                  root.classList.add('pointer-events-none');
                  backdrop.classList.add('opacity-0');
                  backdrop.classList.remove('opacity-100', 'pointer-events-auto');
                  drawer.classList.add('-translate-x-full');
                  drawer.classList.remove('translate-x-0');
                  document.body.classList.remove('overflow-hidden');
                }

                btn.addEventListener('click', function () {
                  drawer.classList.contains('-translate-x-full') ? openDrawer() : closeDrawer();
                });

                backdrop.addEventListener('click', closeDrawer);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}