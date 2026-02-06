// app/layout.tsx
import { type Metadata, type Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'FinanceFlow - Smart Expense Tracker & Budget Manager',
    template: '%s | FinanceFlow',
  },
  description:
    'Take control of your finances with FinanceFlow. Track expenses, set budgets, analyze spending patterns, and achieve your financial goals with our powerful yet simple expense management platform.',
  keywords: [
    'expense tracker',
    'budget manager',
    'personal finance',
    'money management',
    'spending tracker',
    'financial planning',
    'budget planner',
    'expense management',
    'finance app',
    'money tracker',
  ],
  authors: [{ name: 'FinanceFlow' }],
  creator: 'FinanceFlow',
  publisher: 'FinanceFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://financeflow.app',
    siteName: 'FinanceFlow',
    title: 'FinanceFlow - Smart Expense Tracker & Budget Manager',
    description:
      'Track expenses, set budgets, and achieve your financial goals with our powerful yet simple expense management platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow - Smart Expense Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinanceFlow - Smart Expense Tracker & Budget Manager',
    description:
      'Track expenses, set budgets, and achieve your financial goals with FinanceFlow.',
    images: ['/og-image.png'],
    creator: '@financeflow',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'finance',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}