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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

// ============================
// TYPES (match Prisma API responses)
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
  date: string // ISO string
  description?: string | null
  category?: Category
}

// ============================
// HELPERS
// ============================
const currency = (n: number) => `₹${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

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
// QUICK ADD FORM (POST -> /api/expenses)
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
        body: JSON.stringify({
          title: t,
          amount: a,
          categoryId,
          date, // yyyy-MM-dd (API converts to Date)
        }),
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
    } catch {
      setError('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
        <h2 className="text-lg font-semibold text-zinc-100">Quick Add Expense</h2>
        <p className="text-xs text-zinc-500">Saved to database</p>
      </div>

      <form onSubmit={submit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Expense title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              disabled={categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || categories.length === 0}
              className="w-full px-4 py-2.5 disabled:opacity-60 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium"
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {categories.length === 0 && (
          <div className="mt-3 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            No categories found. Create default categories in DB (seed) or add custom categories.
          </div>
        )}
      </form>
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

  // Fetch categories + expenses from Prisma via API
  useEffect(() => {
    const load = async () => {
      setLoading(true)
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
      }
    }

    load()
  }, [viewMode, search])

  const categoriesById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of categories) map.set(c.id, c)
    return map
  }, [categories])

  // API already filters by period/search; we just sort
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

  // ============================
  // STATS
  // ============================
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
      .map((c) => ({
        ...c,
        total: map.get(c.id) ?? 0,
      }))
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

  // ============================
  // CHARTS
  // ============================
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
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#0a0a0a',
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
          ticks: { color: '#71717a', callback: (v: any) => `₹${Number(v).toLocaleString()}` },
          grid: { color: 'rgba(63,63,70,0.4)' },
        },
        x: { ticks: { color: '#71717a' }, grid: { display: false } },
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
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: '#a1a1aa', usePointStyle: true, padding: 16 },
        },
      },
    }),
    []
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
               
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex bg-zinc-800/50 border border-zinc-700 p-1 rounded-xl">
                {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-zinc-700">
                <div className="hidden md:block text-right">
                  <p className="font-medium text-zinc-200">{user?.firstName}</p>
                  <p className="text-xs text-zinc-500">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Expenses', value: currency(totalSum), icon: '💸', sub: viewMode },
            { label: 'Transactions', value: String(transactionCount), icon: '🧾', sub: 'entries' },
            { label: 'Average', value: currency(avgExpense), icon: '📈', sub: 'per transaction' },
            { label: 'Highest', value: currency(maxExpense), icon: '🏆', sub: 'single expense' },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">
                    {loading ? '—' : s.value}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
                </div>
                <div className="bg-zinc-800/70 border border-zinc-700 p-3 rounded-xl">
                  <span className="text-2xl">{s.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview' as const, label: 'Overview', icon: '📊' },
            { id: 'transactions' as const, label: 'Transactions', icon: '📝' },
            { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <QuickAddExpense
              categories={categories}
              onCreated={(created) => setExpenses((prev) => [created, ...prev])}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                    📈
                  </span>
                  6-Month Trend
                </h3>
                <div className="h-64">
                  <Line data={lineChartData} options={lineOptions} />
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                    🎯
                  </span>
                  Category Breakdown
                </h3>
                <div className="h-64">
                  {categoryBreakdown.length > 0 ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                      <span className="text-4xl mb-2">📭</span>
                      <p>No data available</p>
                      <p className="text-xs mt-1">Add expenses to see breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                    📋
                  </span>
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map((e) => {
                  const c = e.category ?? categoriesById.get(e.categoryId)
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border"
                          style={{
                            backgroundColor: `${c?.color ?? '#666'}15`,
                            borderColor: `${c?.color ?? '#666'}30`,
                          }}
                        >
                          {c?.icon ?? '📦'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100">{e.title}</p>
                          <p className="text-sm text-zinc-500">{c?.name ?? 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-100">{currency(e.amount)}</p>
                        <p className="text-sm text-zinc-500">{format(new Date(e.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  )
                })}

                {!loading && filteredExpenses.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    <span className="text-5xl block mb-3">📭</span>
                    <p className="font-medium">No transactions yet</p>
                    <p className="text-sm mt-1">Add your first expense to get started</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12 text-zinc-500">
                    <p className="font-medium">Loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
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
                  {!loading && filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-zinc-500">
                        <span className="text-5xl block mb-3">📭</span>
                        <p className="font-medium">No transactions found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new expense</p>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-zinc-500">
                        <p className="font-medium">Loading...</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => {
                      const c = e.category ?? categoriesById.get(e.categoryId)
                      return (
                        <tr key={e.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{c?.icon ?? '📦'}</span>
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
                              className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredExpenses.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-zinc-800/30 border-t border-zinc-800">
                <span className="text-zinc-500 text-sm">Showing {filteredExpenses.length} transactions</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-400">Total:</span>
                  <span className="text-xl font-bold text-emerald-400">{currency(totalSum)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">6-Month Expense Trend</h3>
              <div className="h-80">
                <Line data={lineChartData} options={lineOptions} />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Spending by Category</h3>

              {categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {categoryBreakdown
                    .slice()
                    .sort((a, b) => b.total - a.total)
                    .map((c) => {
                      const pct = totalSum > 0 ? (c.total / totalSum) * 100 : 0
                      return (
                        <div key={c.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span>{c.icon}</span>
                              <span className="font-medium text-zinc-300">{c.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-zinc-100">{currency(c.total)}</span>
                              <span className="text-zinc-500 text-sm ml-2">({pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <span className="text-4xl block mb-2">📊</span>
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}