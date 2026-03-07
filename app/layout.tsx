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
  title: "LAAM - South Asia's Fashion Discovery Platform",
  description:
    "Shop premium fashion from Pakistani and South Asian designers on LAAM. Discover curated collections of women's, men's, and kids fashion.",
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
      <body className="font-sans antialiased bg-background text-foreground">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen">
            {children}
          </main>
        </div>
        <Footer />
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}