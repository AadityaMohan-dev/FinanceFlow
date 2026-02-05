import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()
  
  // Redirect to dashboard if already signed in
  if (userId) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns with beautiful charts and reports.'
    },
    {
      icon: '🎯',
      title: 'Budget Goals',
      description: 'Set and track budget goals for different categories to stay on top of your finances.'
    },
    {
      icon: '📱',
      title: 'Multi-Device Sync',
      description: 'Access your financial data from anywhere, on any device, anytime.'
    },
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and protected with industry-leading security standards.'
    },
    {
      icon: '📈',
      title: 'Expense Tracking',
      description: 'Track every expense with categories, tags, and custom notes for better organization.'
    },
    {
      icon: '🔔',
      title: 'Smart Alerts',
      description: "Get notified when you're approaching budget limits or unusual spending detected."
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: '👩‍🎨',
      content: 'FinanceFlow has completely transformed how I manage my freelance income. The analytics are incredible!'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: '👨‍💻',
      content: "Finally, an expense tracker that's both powerful and easy to use. Highly recommended!"
    },
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      avatar: '👩‍💼',
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

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="bg-zinc-900/80 backdrop-blur-xl fixed w-full z-50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <span className="text-xl">💰</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors">
                Reviews
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"></div>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(39 39 42) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          ></div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>New: AI-powered spending insights</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-tight mb-6">
                Take Control of Your
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Track expenses, set budgets, and achieve your financial goals with our 
                powerful yet simple expense management platform.
              </p>

              {/* Single CTA Button - Clean Design */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-1"
                >
                  Get Started — It&apos;s Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                >
                  Learn More
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['😊', '😄', '🥰', '😎'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-lg border-2 border-zinc-900">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500">From 10,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl transform rotate-3 blur-2xl"></div>
              <div className="relative bg-zinc-900 rounded-3xl shadow-2xl p-6 border border-zinc-800">
                {/* Mini Dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-100">Monthly Overview</h3>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                      +12% savings
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
                      <p className="text-sm opacity-80">Total Spent</p>
                      <p className="text-2xl font-bold">₹45,230</p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <p className="text-sm text-zinc-400">Budget Left</p>
                      <p className="text-2xl font-bold text-zinc-100">₹24,770</p>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 h-32 flex items-end justify-around gap-2">
                    {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg w-8 transition-all hover:opacity-80"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-2">
                    {[
                      { icon: '🛒', name: 'Grocery', amount: '-₹2,340', negative: true },
                      { icon: '⛽', name: 'Fuel', amount: '-₹1,200', negative: true },
                      { icon: '💰', name: 'Salary', amount: '+₹75,000', negative: false }
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{t.icon}</span>
                          <span className="text-zinc-300">{t.name}</span>
                        </div>
                        <span className={`font-semibold ${t.negative ? 'text-zinc-400' : 'text-emerald-400'}`}>
                          {t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg p-3 animate-bounce">
                <span className="text-2xl">📈</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-xl">✓</span>
                  <span className="text-sm font-medium text-zinc-300">Expense Added!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Powerful features designed to help you track, analyze, and optimize your spending habits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', description: 'Sign up for free in under 2 minutes. No credit card required.', icon: '👤' },
              { step: '02', title: 'Add Expenses', description: 'Log your expenses with categories, dates, and notes.', icon: '📝' },
              { step: '03', title: 'Track & Grow', description: 'View insights, set budgets, and achieve your financial goals.', icon: '🚀' }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  {item.icon}
                </div>
                <span className="absolute top-0 right-1/4 text-6xl font-bold text-zinc-800/50">{item.step}</span>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2 relative">{item.title}</h3>
                <p className="text-zinc-400 relative">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              See what our users have to say about their experience with FinanceFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{testimonial.name}</p>
                    <p className="text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-zinc-900 rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' 
                    : 'border border-zinc-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-zinc-100">{plan.price}</span>
                  <span className="text-zinc-500">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-400">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block text-center py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                      : 'border border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-900/50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Join thousands of users who are already saving more and spending smarter.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all"
          >
            Get Started for Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-zinc-500 mt-4">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
                  <span className="text-xl">💰</span>
                </div>
                <span className="text-xl font-bold text-zinc-100">FinanceFlow</span>
              </div>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                Take control of your finances with our powerful expense tracking and analytics platform. 
                Start your journey to financial freedom today.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: '𝕏', label: 'Twitter' },
                  { icon: 'in', label: 'LinkedIn' },
                  { icon: '📘', label: 'Facebook' },
                  { icon: '📸', label: 'Instagram' }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                    aria-label={social.label}
                  >
                    <span className="text-sm">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-zinc-100">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'Integrations'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-zinc-100">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">
              © 2024 FinanceFlow. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item, i) => (
                <a key={i} href="#" className="text-zinc-500 hover:text-emerald-400 text-sm transition-colors">
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