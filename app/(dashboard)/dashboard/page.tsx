'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subMonths } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Trophy,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  Calendar,
  Tag,
  Wallet,
  Loader2,
  PackageOpen,
  PieChart,
  Target,
  Clock,
  Edit2,
  X,
  AlertCircle,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

// --- Types ---
type Category = { id: string; name: string; icon: string; color: string }
type Expense = { id: string; title: string; amount: number; categoryId: string; date: string; category?: Category }
type Budget = { id: string; amount: number; period: 'weekly' | 'monthly' | 'yearly' }

// --- Helpers ---
const currency = (n: number) => `₹${n.toLocaleString('en-IN')}`

function getPeriodRange(viewMode: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date()
  if (viewMode === 'weekly') return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
  if (viewMode === 'monthly') return { start: startOfMonth(now), end: endOfMonth(now) }
  return { start: startOfYear(now), end: endOfYear(now) }
}

// --- Reusable Expense Form Component ---
function ExpenseForm({ 
  categories, 
  onAdd 
}: { 
  categories: Category[], 
  onAdd: (e: React.FormEvent<HTMLFormElement>) => void 
}) {
  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Quick Add</h3>
          <p className="text-xs text-zinc-500">Record a new expense</p>
        </div>
      </div>

      <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <input name="title" required placeholder="Description" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all placeholder:text-zinc-600 text-white" />
        </div>
        <div className="lg:col-span-2">
          <input name="amount" type="number" step="0.01" required placeholder="Amount" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all placeholder:text-zinc-600 text-white" />
        </div>
        <div className="lg:col-span-3">
          <select name="categoryId" required className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-zinc-300 appearance-none cursor-pointer">
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-zinc-300 cursor-pointer" />
        </div>
        <div className="lg:col-span-1">
          <button type="submit" className="w-full h-full min-h-[46px] bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-lg shadow-white/10">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useUser()
  
  // --- State ---
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview')
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Record<string, Budget>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const budgetInputRef = useRef<HTMLInputElement>(null)

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, expRes] = await Promise.all([
        fetch('/api/categories', { cache: 'no-store' }),
        fetch('/api/expenses', { cache: 'no-store' }),
      ])

      const cats = await catRes.json()
      const exps = await expRes.json()

      setCategories(Array.isArray(cats) ? cats : [])
      setAllExpenses(Array.isArray(exps) ? exps : [])

      const budgetPromises = ['weekly', 'monthly', 'yearly'].map(period =>
        fetch(`/api/budget?period=${period}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
      )
      const results = await Promise.all(budgetPromises)
      
      const newBudgets: Record<string, Budget> = {}
      results.forEach((b, index) => {
        if (b) {
          newBudgets[['weekly', 'monthly', 'yearly'][index]] = b
        }
      })
      setBudgets(newBudgets)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Computed Data ---
  const currentBudget = budgets[viewMode] || { amount: 0 }

  const filteredExpenses = useMemo(() => {
    const { start, end } = getPeriodRange(viewMode)
    return allExpenses
      .filter(e => {
        const date = new Date(e.date)
        return isWithinInterval(date, { start, end })
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
  }, [allExpenses, viewMode, search])

  const totalSpent = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const transactionCount = filteredExpenses.length
  const avgExpense = transactionCount ? totalSpent / transactionCount : 0
  const maxExpense = transactionCount ? Math.max(...filteredExpenses.map(e => e.amount), 0) : 0
  
  const budgetUsed = currentBudget.amount ? (totalSpent / currentBudget.amount) * 100 : 0
  const isOverBudget = totalSpent > currentBudget.amount

  const categoriesById = useMemo(() => {
    return Object.fromEntries(categories.map(c => [c.id, c]))
  }, [categories])

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filteredExpenses.forEach(e => map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount))
    return categories
      .map(c => ({ ...c, total: map.get(c.id) || 0 }))
      .filter(x => x.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [filteredExpenses, categories])

  const chartTrend = useMemo(() => {
    const sums = new Map<string, number>()
    allExpenses.forEach(e => {
        const d = new Date(e.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        sums.set(key, (sums.get(key) || 0) + e.amount)
    })

    const now = new Date()
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({ 
        label: format(d, 'MMM'), 
        total: sums.get(key) || 0 
      })
    }
    return result
  }, [allExpenses])

  const lineChartData = {
    labels: chartTrend.map(m => m.label),
    datasets: [{
      label: 'Spending',
      data: chartTrend.map(m => m.total),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointRadius: 4,
    }]
  }

  const doughnutData = {
    labels: categoryBreakdown.map(c => c.name),
    datasets: [{
      data: categoryBreakdown.map(c => c.total),
      backgroundColor: categoryBreakdown.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }

  // --- Actions ---
  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget // Capture form reference immediately
    const formData = new FormData(form)
    
    const payload = {
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      categoryId: formData.get('categoryId') as string,
      date: formData.get('date') as string || format(new Date(), 'yyyy-MM-dd'),
    }

    if (!payload.title || !payload.amount || !payload.categoryId) return

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const newExpense = await res.json()
        setAllExpenses(prev => [newExpense, ...prev])
        form.reset() // Use captured reference to reset
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(budgetInputRef.current?.value || '0')
    if (amount <= 0) return

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, period: viewMode }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBudgets(prev => ({ ...prev, [viewMode]: updated }))
        setBudgetModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to update budget', error)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAllExpenses(prev => prev.filter(e => e.id !== id))
    }
  }

  return (
    <>
      {/* --- Budget Modal --- */}
      {budgetModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Set {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Budget
              </h2>
              <button onClick={() => setBudgetModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit}>
              <div className="relative mb-8">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-zinc-500 font-medium">₹</span>
                <input
                  ref={budgetInputRef}
                  type="number"
                  defaultValue={currentBudget.amount || ''}
                  className="w-full pl-12 pr-6 py-5 text-3xl font-bold bg-zinc-800 border border-zinc-700 rounded-2xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white"
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-800 text-zinc-300 rounded-2xl font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
        
        {/* --- Header --- */}
        <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            
            {/* Desktop Layout: Single Row */}
            <div className="hidden md:flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
              </Link>

              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 p-1 rounded-xl">
                {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-zinc-700 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => fetchData()} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-6 w-px bg-zinc-800" />
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </div>
            </div>

            {/* Mobile Layout: Two Rows (Clean & Accessible) */}
            <div className="md:hidden flex flex-col gap-4 py-1">
              {/* Row 1: Logo & Profile */}
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">FinanceFlow</span>
                </Link>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              </div>

              {/* Row 2: Controls (Full width) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex bg-zinc-800/50 border border-zinc-700 p-1 rounded-lg">
                  {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all text-center ${
                        viewMode === mode
                          ? 'bg-zinc-700 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
                <button onClick={() => fetchData()} className="p-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* --- MOBILE ONLY: ADD EXPENSE FIRST --- */}
          <div className="block lg:hidden mb-6 sm:mb-8">
            <ExpenseForm categories={categories} onAdd={handleAddExpense} />
          </div>

          {/* --- Stats Grid --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* 1. Budget Card */}
            <div className="group relative bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
              <button
                onClick={() => setBudgetModalOpen(true)}
                className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-zinc-400"
                title="Edit Budget"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{viewMode} Budget</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{currency(currentBudget.amount || 0)}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                   <Target className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-500">Spent: <span className="text-zinc-300">{currency(totalSpent)}</span></span>
                  <span className={isOverBudget ? "text-red-400" : "text-emerald-400"}>
                    {currentBudget.amount > 0 ? budgetUsed.toFixed(0) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget ? "bg-red-500" : budgetUsed > 85 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 2. Total Spent */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Spent</p>
                  <p className="mt-2 text-3xl font-bold text-white">{currency(totalSpent)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{transactionCount} transactions</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                   <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* 3. Average */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Average</p>
                  <p className="mt-2 text-3xl font-bold text-white">{currency(avgExpense)}</p>
                  <p className="mt-1 text-xs text-zinc-500">per transaction</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                   <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* 4. Highest */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Highest</p>
                  <p className="mt-2 text-3xl font-bold text-white">{currency(maxExpense)}</p>
                  <p className="mt-1 text-xs text-zinc-500">single expense</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                   <Trophy className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* --- Navigation Tabs --- */}
          <div className="flex gap-1 mb-8 p-1 bg-zinc-900/50 rounded-xl w-fit border border-zinc-800">
             {(['overview', 'transactions', 'analytics'] as const).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        activeTab === tab ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                 >
                    {tab}
                 </button>
             ))}
          </div>

          {/* --- VIEW: OVERVIEW --- */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* DESKTOP ONLY: Quick Add Form */}
              <div className="hidden lg:block">
                <ExpenseForm categories={categories} onAdd={handleAddExpense} />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                 {/* Line Chart */}
                 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-emerald-400" />
                       Spending Trend
                    </h3>
                    <div className="h-64 w-full">
                       <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                 </div>

                 {/* Doughnut Chart */}
                 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-purple-400" />
                       Category Breakdown
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                       {categoryBreakdown.length > 0 ? (
                           <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true, color: '#a1a1aa' } } } }} />
                       ) : (
                           <div className="flex flex-col items-center text-zinc-500">
                               <PackageOpen className="w-12 h-12 mb-2 opacity-50" />
                               <p className="text-sm">No data to display</p>
                           </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Recent Transactions List */}
              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-8">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <Clock className="w-5 h-5 text-blue-400" />
                       Recent Transactions
                    </h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                       View All <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="space-y-3">
                    {filteredExpenses.slice(0, 5).map(e => {
                        const cat = categoriesById[e.categoryId]
                        return (
                            <div key={e.id} className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl">
                                      {cat?.icon || '📦'}
                                   </div>
                                   <div>
                                      <p className="font-semibold text-zinc-200">{e.title}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                         <span className="text-xs text-zinc-500">{format(new Date(e.date), 'MMM dd, yyyy')}</span>
                                         <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">{cat?.name}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="font-bold text-white">{currency(e.amount)}</p>
                                   <button onClick={() => deleteExpense(e.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline mt-1">Delete</button>
                                </div>
                            </div>
                        )
                    })}
                    {filteredExpenses.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                           <p>No transactions found for this period.</p>
                        </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* --- VIEW: TRANSACTIONS --- */}
          {activeTab === 'transactions' && (
             <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search transactions..." 
                        className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-sm text-white" 
                      />
                   </div>
                </div>
                <div className="space-y-2">
                    {filteredExpenses.map(e => {
                        const cat = categoriesById[e.categoryId]
                        return (
                            <div key={e.id} className="flex items-center justify-between p-4 bg-zinc-950/30 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center text-xl">
                                      {cat?.icon || '📦'}
                                   </div>
                                   <div>
                                      <p className="font-medium text-zinc-200">{e.title}</p>
                                      <p className="text-xs text-zinc-500">{format(new Date(e.date), 'dd MMM yyyy')}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="text-sm font-bold text-white">{currency(e.amount)}</span>
                                   <button onClick={() => deleteExpense(e.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                            </div>
                        )
                    })}
                    {filteredExpenses.length === 0 && <p className="text-center py-10 text-zinc-500">No transactions found.</p>}
                </div>
             </div>
          )}

           {/* --- VIEW: ANALYTICS --- */}
           {activeTab === 'analytics' && (
              <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 h-96">
                     <h3 className="font-bold text-white mb-4">Detailed Breakdown</h3>
                     <div className="h-full w-full pb-8">
                        <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                     </div>
                  </div>
              </div>
           )}

        </main>
      </div>
    </>
  )
}