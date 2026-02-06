// app/page.tsx
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  BarChart3, 
  Target, 
  Smartphone, 
  Shield, 
  TrendingUp, 
  Bell,
  ArrowRight,
  ChevronDown,
  Star,
  Check,
  DollarSign,
  ShoppingCart,
  Fuel,
  Wallet,
  User,
  FileEdit,
  Rocket,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Sparkles
} from 'lucide-react'
import MobileNav from '@/components/MobileNav'

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns with beautiful charts and reports.'
    },
    {
      icon: Target,
      title: 'Budget Goals',
      description: 'Set and track budget goals for different categories to stay on top of your finances.'
    },
    {
      icon: Smartphone,
      title: 'Multi-Device Sync',
      description: 'Access your financial data from anywhere, on any device, anytime.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and protected with industry-leading security standards.'
    },
    {
      icon: TrendingUp,
      title: 'Expense Tracking',
      description: 'Track every expense with categories, tags, and custom notes for better organization.'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: "Get notified when you're approaching budget limits or unusual spending detected."
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      initials: 'SJ',
      content: 'FinanceFlow has completely transformed how I manage my freelance income. The analytics are incredible!'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      initials: 'MC',
      content: "Finally, an expense tracker that's both powerful and easy to use. Highly recommended!"
    },
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      initials: 'ER',
      content: 'The category breakdown helps me understand exactly where my money is going. Game changer!'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: ['Up to 50 transactions/month', 'Basic analytics', '3 categories', 'Email support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹299',
      period: 'per month',
      features: ['Unlimited transactions', 'Advanced analytics', 'Unlimited categories', 'Priority support', 'Export to CSV/PDF', 'Budget alerts'],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₹999',
      period: 'per month',
      features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated manager', 'SLA guarantee'],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '₹100Cr+', label: 'Tracked' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '99.9%', label: 'Uptime' }
  ]

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#testimonials', label: 'Reviews' }
  ]

  const howItWorks = [
    { 
      step: '01', 
      title: 'Create Account', 
      description: 'Sign up for free in under 2 minutes. No credit card required.', 
      icon: User 
    },
    { 
      step: '02', 
      title: 'Add Expenses', 
      description: 'Log your expenses with categories, dates, and notes.', 
      icon: FileEdit 
    },
    { 
      step: '03', 
      title: 'Track & Grow', 
      description: 'View insights, set budgets, and achieve your financial goals.', 
      icon: Rocket 
    }
  ]

  const transactions = [
    { icon: ShoppingCart, name: 'Grocery', amount: '-₹2,340', negative: true },
    { icon: Fuel, name: 'Fuel', amount: '-₹1,200', negative: true },
    { icon: Wallet, name: 'Salary', amount: '+₹75,000', negative: false }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 antialiased">
      {/* Navbar */}
      <nav className="bg-zinc-900/80 backdrop-blur-xl fixed w-full z-50 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link
                href="/sign-in"
                className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 lg:px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Navigation */}
            <MobileNav navLinks={navLinks} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-28 md:pt-32 lg:pt-40 md:pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"></div>
          <div 
            className="absolute inset-0 opacity-20 sm:opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(39 39 42) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          ></div>
          <div className="absolute top-1/4 -left-32 sm:-left-20 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-32 sm:-right-20 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5" />
                <span>New: AI-powered spending insights</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-zinc-100 leading-[1.1] sm:leading-tight mb-4 sm:mb-6">
                Take Control of Your
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  Financial Future
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Track expenses, set budgets, and achieve your financial goals with our 
                powerful yet simple expense management platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300 group"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-1 transition-transform" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'].map((bg, i) => (
                    <div key={i} className={`w-9 h-9 sm:w-10 sm:h-10 ${bg} rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold border-2 border-zinc-900 hover:scale-110 transition-transform cursor-pointer`}>
                      {['SJ', 'MC', 'ER', 'AK'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500">From 10,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl sm:rounded-3xl transform rotate-2 sm:rotate-3 blur-xl sm:blur-2xl scale-95"></div>
              <div className="relative bg-zinc-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border border-zinc-800/50">
                {/* Mini Dashboard */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">Monthly Overview</h3>
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-400 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" />
                      +12% savings
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-3 sm:p-4 text-white">
                      <p className="text-xs sm:text-sm opacity-80">Total Spent</p>
                      <p className="text-lg sm:text-2xl font-bold">₹45,230</p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-zinc-400">Budget Left</p>
                      <p className="text-lg sm:text-2xl font-bold text-zinc-100">₹24,770</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 sm:p-4 h-24 sm:h-32 flex items-end justify-around gap-1 sm:gap-2">
                    {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t w-6 sm:w-8 transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-1 sm:space-y-2">
                    {transactions.map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 rounded-lg px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${t.negative ? 'bg-zinc-800' : 'bg-emerald-500/20'}`}>
                            <t.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${t.negative ? 'text-zinc-400' : 'text-emerald-400'}`} />
                          </div>
                          <span className="text-zinc-300 text-sm sm:text-base">{t.name}</span>
                        </div>
                        <span className={`font-semibold text-sm sm:text-base ${t.negative ? 'text-zinc-400' : 'text-emerald-400'}`}>
                          {t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg p-3 items-center gap-2 animate-bounce">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg p-3 sm:p-4 items-center gap-2">
                <div className="p-1 bg-emerald-500/20 rounded-full">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-zinc-300">Expense Added!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-12 bg-zinc-900/50 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                  {stat.value}
                </p>
                <p className="text-zinc-500 mt-1 text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-zinc-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Powerful features designed to help you track, analyze, and optimize your spending habits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all duration-300 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 lg:py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-emerald-500/40 transition-all duration-300">
                  <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <span className="absolute top-0 right-1/4 sm:right-1/3 lg:right-1/4 text-5xl sm:text-6xl font-bold text-zinc-800/50 select-none">{item.step}</span>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2 relative">{item.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400 relative max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-teal-950/50 relative overflow-hidden scroll-mt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-emerald-400" />
              Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              See what our users have to say about their experience with FinanceFlow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-zinc-300 mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold text-white group-hover:scale-110 transition-transform">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-zinc-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
              <DollarSign className="w-4 h-4" />
              Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02] lg:scale-105' 
                    : 'border border-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-zinc-100">{plan.price}</span>
                  <span className="text-zinc-500 text-sm sm:text-base">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm sm:text-base">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base group ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                      : 'border border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-zinc-900/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">
            <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4 leading-tight">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving more and spending smarter.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 group"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs sm:text-sm text-zinc-500 mt-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-zinc-100">FinanceFlow</span>
              </div>
              <p className="text-zinc-400 max-w-md leading-relaxed text-sm sm:text-base">
                Take control of your finances with our powerful expense tracking and analytics platform. 
                Start your journey to financial freedom today.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-4 text-zinc-100">Product</h3>
              <ul className="space-y-2 sm:space-y-3">
                {['Features', 'Pricing', 'Security', 'Integrations'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm sm:text-base inline-flex items-center gap-1 group">
                      {item}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-4 text-zinc-100">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm sm:text-base inline-flex items-center gap-1 group">
                      {item}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-xs sm:text-sm order-2 sm:order-1 flex items-center gap-1">
              © 2024 FinanceFlow. Made with
              <span className="text-red-500">❤</span>
              All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 order-1 sm:order-2">
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item, i) => (
                <a key={i} href="#" className="text-zinc-500 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}