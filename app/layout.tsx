import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { MobileBottomNav } from '@/components/MobileBottomNav'
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
      { url: '/brand/favicon.ico', media: '(prefers-color-scheme: light)' },
      { url: '/brand/favicon.ico',  media: '(prefers-color-scheme: dark)'  },
      { url: '/brand/favicon.ico', type: 'image/svg+xml' },
    ],
    apple: '/brand/favicon.ico',
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

          {/* ── Desktop Sidebar (lg+) ── */}
          <aside className="hidden lg:flex lg:flex-col fixed top-16 left-0 bottom-0 w-64 border-r border-border bg-background overflow-y-auto overflow-x-hidden z-30">
            <Sidebar />
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 w-full lg:ml-60 pb-16 lg:pb-0">
            {children}
          </main>

        </div>

        {/* ── Mobile / Tablet Bottom Nav — rendered at root so it's never hidden ── */}
        <MobileBottomNav />

        {/* <Footer /> */}
        <Toaster position="bottom-right" />
        <Analytics />

      </body>
    </html>
  )
}