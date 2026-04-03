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
  title: "EastMall - Digital marketplace and customizable E Commerce for small businesses in Sri Lanka",
  description:
    "EastMall is a digital marketplace and customizable e-commerce solution designed to empower small businesses in Sri Lanka. We provide a platform for local entrepreneurs to showcase their products and reach a wider audience, while offering customers a convenient and personalized shopping experience.",
  generator: 'up4work',
  icons: {
    icon: [
      { url: '/brand/favicon.ico', media: '(prefers-color-scheme: light)' },
      { url: '/brand/favicon.ico', media: '(prefers-color-scheme: dark)'  },
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
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden h-dvh flex flex-col">

        <Header />

        {/* ── Mobile layout ── */}
        <div className="lg:hidden flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          <MobileBottomNav />
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden lg:flex flex-1 min-h-0">
          <aside className="flex flex-col fixed top-16 left-0 bottom-0 w-64 border-r border-border bg-background overflow-y-auto overflow-x-hidden z-30">
            <Sidebar />
          </aside>
          <main className="flex-1 min-w-0 w-full lg:ml-60 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>

        {/* <Footer /> */}
        <Toaster position="bottom-right" />
        <Analytics />

      </body>
    </html>
  )
}