'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
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
  BarChart3,
  FileText,
  LineChart,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  Calendar,
  Tag,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PackageOpen,
  PieChart,
  Target,
  Clock,
  Filter,
  Download,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

// ============================
// TYPES
// ============================
type Category = {
  id: string
  name: string
  icon: string
  color: string
  isDefault?: boolean
  userId?: string | null
}

type Expense = {
  id: string
  title: string
  amount: number
  categoryId: string
  date: string
  description?: string | null
  category?: Category
}

// ============================
// HELPERS
// ============================
const currency = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleString(undefined, { month: 'short' })
}

function lastNMonthsKeys(n: number) {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  return keys
}

// ============================
// SKELETON LOADERS
// ============================
function StatCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-800 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-zinc-800 rounded mb-3"></div>
          <div className="h-8 w-32 bg-zinc-800 rounded mb-2"></div>
          <div className="h-3 w-20 bg-zinc-800 rounded"></div>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800 rounded-xl"></div>
      </div>
    </div>
  )
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl animate-pulse">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-700 rounded-xl"></div>
        <div>
          <div className="h-4 w-24 sm:w-32 bg-zinc-700 rounded mb-2"></div>
          <div className="h-3 w-16 sm:w-20 bg-zinc-700 rounded"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 w-16 sm:w-20 bg-zinc-700 rounded mb-2"></div>
        <div className="h-3 w-14 sm:w-16 bg-zinc-700 rounded"></div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-64 bg-zinc-800/30 rounded-xl animate-pulse flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
    </div>
  )
}

// ============================
// STAT CARD COMPONENT
// ============================
function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
  loading,
  color = 'emerald',
}: {
  label: string
  value: string
  icon: React.ElementType
  subtext: string
  trend?: { value: number; positive: boolean }
  loading?: boolean
  color?: 'emerald' | 'purple' | 'blue' | 'amber'
}) {
  if (loading) return <StatCardSkeleton />

  const colorClasses = {
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400',
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium truncate">{label}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 mt-1 truncate">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  trend.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend.positive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            <p className="text-xs text-zinc-500 truncate">{subtext}</p>
          </div>
        </div>
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  )
}

// ============================
// QUICK ADD FORM
// ============================
function QuickAddExpense({
  categories,
  onCreated,
}: {
  categories: Category[]
  onCreated: (created: Expense) => void
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0].id)
  }, [categoryId, categories])

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')

    const t = title.trim()
    const a = parseFloat(amount)

    if (!t) return setError('Title is required')
    if (!Number.isFinite(a) || a <= 0) return setError('Enter a valid amount > 0')
    if (!categoryId) return setError('Select a category')

    setSubmitting(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, amount: a, categoryId, date }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? 'Failed to add expense')
        return
      }

      const created = (await res.json()) as Expense
      onCreated(created)

      setTitle('')
      setAmount('')
      setCategoryId(categories[0]?.id ?? '')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setIsExpanded(false)
    } catch {
      setError('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-100">Quick Add Expense</h2>
              <p className="text-xs text-zinc-500 hidden sm:block">Add a new expense to your tracker</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      <form onSubmit={submit} className={`p-4 sm:p-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-500"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                disabled={categories.length === 0}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || categories.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            {error}
          </div>
        )}

        {categories.length === 0 && (
          <div className="mt-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            No categories found. Create categories to start adding expenses.
          </div>
        )}
      </form>
    </div>
  )
}

// ============================
// EMPTY STATE COMPONENT
// ============================
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============================
// TRANSACTION ROW (Mobile-friendly)
// ============================
function TransactionCard({
  expense,
  category,
  onDelete,
}: {
  expense: Expense
  category?: Category
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl border flex-shrink-0"
          style={{
            backgroundColor: `${category?.color ?? '#666'}15`,
            borderColor: `${category?.color ?? '#666'}30`,
          }}
        >
          {category?.icon ?? '📦'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-100 text-sm sm:text-base truncate">{expense.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs px-2 py-0.5 rounded-full border truncate max-w-[100px] sm:max-w-none"
              style={{
                backgroundColor: `${category?.color ?? '#666'}10`,
                borderColor: `${category?.color ?? '#666'}25`,
                color: category?.color ?? '#a1a1aa',
              }}
            >
              {category?.name ?? 'Uncategorized'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-zinc-100 text-sm sm:text-base">{currency(expense.amount)}</p>
          <p className="text-xs text-zinc-500 hidden sm:block">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-zinc-500 sm:hidden">{format(new Date(expense.date), 'MMM dd')}</p>
        </div>
        <button
          onClick={() => onDelete(expense.id)}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================
// MAIN DASHBOARD
// ============================
export default function DashboardPage() {
  const { user } = useUser()

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview')
  const [search, setSearch] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const catRes = await fetch('/api/categories', { cache: 'no-store' })
      const cats = (await catRes.json()) as Category[]
      setCategories(Array.isArray(cats) ? cats : [])

      const qs = new URLSearchParams({
        period: viewMode,
        search: search.trim(),
      })

      const expRes = await fetch(`/api/expenses?${qs.toString()}`, { cache: 'no-store' })
      const exps = (await expRes.json()) as Expense[]
      setExpenses(Array.isArray(exps) ? exps : [])
    } catch {
      setCategories([])
      setExpenses([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [viewMode, search])

  const categoriesById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of categories) map.set(c.id, c)
    return map
  }, [categories])

  const filteredExpenses = useMemo(() => {
    return expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [expenses])

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    }
  }

  // Stats
  const totalSum = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses])
  const transactionCount = filteredExpenses.length
  const avgExpense = transactionCount ? totalSum / transactionCount : 0
  const maxExpense = transactionCount ? Math.max(...filteredExpenses.map((e) => e.amount)) : 0

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filteredExpenses) {
      map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
    }
    return categories
      .map((c) => ({ ...c, total: map.get(c.id) ?? 0 }))
      .filter((x) => x.total > 0)
  }, [filteredExpenses, categories])

  const months = useMemo(() => lastNMonthsKeys(6), [])
  const monthlyTrend = useMemo(() => {
    const sums = new Map<string, number>()
    for (const e of filteredExpenses) {
      const key = monthKey(new Date(e.date))
      sums.set(key, (sums.get(key) ?? 0) + e.amount)
    }
    return months.map((k) => ({ key: k, label: monthLabel(k), total: sums.get(k) ?? 0 }))
  }, [filteredExpenses, months])

  // Charts
  const lineChartData = useMemo(
    () => ({
      labels: monthlyTrend.map((m) => m.label),
      datasets: [
        {
          label: 'Expenses',
          data: monthlyTrend.map((m) => m.total),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#18181b',
          pointBorderWidth: 2,
        },
      ],
    }),
    [monthlyTrend]
  )

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: '#71717a', 
            callback: (v: number | string) => `₹${Number(v).toLocaleString('en-IN')}`,
            font: { size: 11 }
          },
          grid: { color: 'rgba(63,63,70,0.4)' },
        },
        x: { 
          ticks: { color: '#71717a', font: { size: 11 } }, 
          grid: { display: false } 
        },
      },
    }),
    []
  )

  const doughnutData = useMemo(
    () => ({
      labels: categoryBreakdown.map((c) => c.name),
      datasets: [
        {
          data: categoryBreakdown.map((c) => c.total),
          backgroundColor: categoryBreakdown.map((c) => c.color),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }),
    [categoryBreakdown]
  )

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { 
            color: '#a1a1aa', 
            usePointStyle: true, 
            padding: 16,
            font: { size: 12 }
          },
        },
      },
    }),
    []
  )

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'transactions' as const, label: 'Transactions', icon: FileText },
    { id: 'analytics' as const, label: 'Analytics', icon: LineChart },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-zinc-800/50 border border-zinc-700 p-1 rounded-xl">
                {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                    <span className="sm:hidden">{mode.charAt(0).toUpperCase()}</span>
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 text-zinc-400 hover:text-emerald-400 bg-zinc-800/50 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* User */}
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-zinc-700">
                <div className="hidden md:block text-right">
                  <p className="font-medium text-zinc-200 text-sm">{user?.firstName ?? 'User'}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[150px]">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            label="Total Expenses"
            value={currency(totalSum)}
            icon={Wallet}
            subtext={viewMode}
            trend={{ value: 12, positive: false }}
            loading={loading}
            color="emerald"
          />
          <StatCard
            label="Transactions"
            value={String(transactionCount)}
            icon={Receipt}
            subtext="entries"
            loading={loading}
            color="purple"
          />
          <StatCard
            label="Average"
            value={currency(avgExpense)}
            icon={TrendingUp}
            subtext="per transaction"
            loading={loading}
            color="blue"
          />
          <StatCard
            label="Highest"
            value={currency(maxExpense)}
            icon={Trophy}
            subtext="single expense"
            loading={loading}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <QuickAddExpense
              categories={categories}
              onCreated={(created) => setExpenses((prev) => [created, ...prev])}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Trend Chart */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="hidden sm:inline">6-Month Trend</span>
                    <span className="sm:hidden">Trend</span>
                  </h3>
                  <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-56 sm:h-64">
                  {loading ? <ChartSkeleton /> : <Line data={lineChartData} options={lineOptions} />}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="hidden sm:inline">Category Breakdown</span>
                    <span className="sm:hidden">Categories</span>
                  </h3>
                </div>
                <div className="h-56 sm:h-64">
                  {loading ? (
                    <ChartSkeleton />
                  ) : categoryBreakdown.length > 0 ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <EmptyState
                      icon={PieChart}
                      title="No data yet"
                      description="Add expenses to see your category breakdown"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1 group"
                >
                  View All
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {loading ? (
                  <>
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                  </>
                ) : filteredExpenses.length > 0 ? (
                  filteredExpenses.slice(0, 5).map((e) => (
                    <TransactionCard
                      key={e.id}
                      expense={e}
                      category={e.category ?? categoriesById.get(e.categoryId)}
                      onDelete={deleteExpense}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={PackageOpen}
                    title="No transactions yet"
                    description="Add your first expense to get started tracking"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Search & Filters */}
            <div className="p-4 sm:p-5 border-b border-zinc-800">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden p-4 space-y-3">
              {loading ? (
                <>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((e) => (
                  <TransactionCard
                    key={e.id}
                    expense={e}
                    category={e.category ?? categoriesById.get(e.categoryId)}
                    onDelete={deleteExpense}
                  />
                ))
              ) : (
                <EmptyState
                  icon={PackageOpen}
                  title="No transactions found"
                  description="Try adjusting your search or add a new expense"
                />
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-zinc-400 text-sm">Item</th>
                    <th className="text-left p-4 font-semibold text-zinc-400 text-sm">Category</th>
                    <th className="text-left p-4 font-semibold text-zinc-400 text-sm">Date</th>
                    <th className="text-right p-4 font-semibold text-zinc-400 text-sm">Amount</th>
                    <th className="text-center p-4 font-semibold text-zinc-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8">
                        <div className="flex items-center justify-center gap-3 text-zinc-500">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading transactions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon={PackageOpen}
                          title="No transactions found"
                          description="Try adjusting your search or add a new expense"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => {
                      const c = e.category ?? categoriesById.get(e.categoryId)
                      return (
                        <tr key={e.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg border"
                                style={{
                                  backgroundColor: `${c?.color ?? '#666'}15`,
                                  borderColor: `${c?.color ?? '#666'}30`,
                                }}
                              >
                                {c?.icon ?? '📦'}
                              </div>
                              <span className="font-medium text-zinc-200">{e.title}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${c?.color ?? '#666'}15`,
                                borderColor: `${c?.color ?? '#666'}30`,
                                color: c?.color ?? '#a1a1aa',
                              }}
                            >
                              {c?.name ?? 'Uncategorized'}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400">{format(new Date(e.date), 'MMM dd, yyyy')}</td>
                          <td className="p-4 text-right font-bold text-zinc-100">{currency(e.amount)}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => deleteExpense(e.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filteredExpenses.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-5 bg-zinc-800/30 border-t border-zinc-800">
                <span className="text-zinc-500 text-sm">
                  Showing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-400 text-sm">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-400">{currency(totalSum)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Expense Trend Chart */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  6-Month Expense Trend
                </h3>
              </div>
              <div className="h-64 sm:h-80">
                {loading ? <ChartSkeleton /> : <Line data={lineChartData} options={lineOptions} />}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  Spending by Category
                </h3>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-2">
                        <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                        <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {categoryBreakdown
                    .slice()
                    .sort((a, b) => b.total - a.total)
                    .map((c) => {
                      const pct = totalSum > 0 ? (c.total / totalSum) * 100 : 0
                      return (
                        <div key={c.id} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-lg sm:text-xl">{c.icon}</span>
                              <span className="font-medium text-zinc-300 text-sm sm:text-base">{c.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-zinc-100 text-sm sm:text-base">{currency(c.total)}</span>
                              <span className="text-zinc-500 text-xs sm:text-sm ml-2">({pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                              style={{ width: `${pct}%`, backgroundColor: c.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="No data available"
                  description="Add expenses to see your spending breakdown by category"
                />
              )}
            </div>

            {/* Monthly Summary Grid */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                Monthly Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {monthlyTrend.map((m) => (
                  <div
                    key={m.key}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 text-center hover:border-emerald-500/30 transition-all"
                  >
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium">{m.label}</p>
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-zinc-100 mt-1">
                      {loading ? '—' : currency(m.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}