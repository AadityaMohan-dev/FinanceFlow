// app/sign-in/[[...sign-in]]/page.tsx
import { type Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In • FinanceFlow',
  description: 'Welcome back. Your money is waiting.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Left Side - Welcome Back Hero */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16 lg:px-20 lg:py-24 bg-gradient-to-br from-emerald-900/20 via-black to-black relative overflow-hidden">
        {/* Animated glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/50 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 12h3v8h14v-8h3L12 2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">FinanceFlow</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Welcome back
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Good to see you again
            </span>
          </h1>

          <p className="text-xl text-zinc-400 mb-10">
            Your dashboard is ready. Let’s make today another winning day with money.
          </p>

          {/* Quick trust */}
          <div className="space-y-6">
            <div className="flex items-center gap-8 text-zinc-500 text-sm">
              <div className="flex -space-x-2">
                {['R', 'A', 'J', 'K', 'N'].map((l, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold border-2 border-black"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p>
                <span className="text-zinc-300 font-medium">50,000+</span> active users right now
              </p>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Last backup: 3 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20 bg-black">
        <div className="w-full max-w-md">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">You’re 10 seconds away</span>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Sign in to FinanceFlow</h2>
            <p className="text-zinc-400">
              New here?{' '}
              <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                Create free account →
              </Link>
            </p>
          </div>

          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 hover:border-emerald-500/50 transition-all rounded-xl h-12 font-medium text-sm',
                dividerLine: 'bg-zinc-800',
                dividerText: 'text-zinc-500 text-xs',
                formFieldLabel: 'text-zinc-300 text-sm font-medium mb-2',
                formFieldInput:
                  'bg-zinc-900/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl h-12 px-4 transition-all',
                formButtonPrimary:
                  'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl h-12 shadow-lg hover:shadow-emerald-500/40 transition-all mt-4',
                footerActionText: 'text-zinc-500 text-sm text-center mt-6',
                footerActionLink: 'text-emerald-400 hover:text-emerald-300 font-medium',
              },
              layout: {
                socialButtonsPlacement: 'top',
              },
            }}
          />

          <p className="mt-8 text-center text-xs text-zinc-500">
            Secured by Clerk • Bank-grade encryption • Never store passwords
          </p>
        </div>
      </div>
    </div>
  )
}