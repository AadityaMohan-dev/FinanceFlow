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
  RefreshCw,
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
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 sm:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Quick Add</h3>
          <p className="text-xs text-zinc-500">Record a new expense</p>
        </div>
      </div>

      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
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
          <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-zinc-300 cursor-pointer min-w-0" />
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
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview')
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Record<string, Budget>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const budgetInputRef = useRef<HTMLInputElement>(null)

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
        fetch(`/api/budget?period=${period}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
      )
      const results = await Promise.all(budgetPromises)
      const newBudgets: Record<string, Budget> = {}
      results.forEach((b, index) => { if (b) newBudgets[['weekly', 'monthly', 'yearly'][index]] = b })
      setBudgets(newBudgets)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const currentBudget = budgets[viewMode] || { amount: 0 }
  const filteredExpenses = useMemo(() => {
    const { start, end } = getPeriodRange(viewMode)
    return allExpenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
  }, [allExpenses, viewMode, search])

  const totalSpent = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const transactionCount = filteredExpenses.length
  const avgExpense = transactionCount ? totalSpent / transactionCount : 0
  const maxExpense = transactionCount ? Math.max(...filteredExpenses.map(e => e.amount), 0) : 0
  const budgetUsed = currentBudget.amount ? (totalSpent / currentBudget.amount) * 100 : 0
  const isOverBudget = totalSpent > currentBudget.amount
  const categoriesById = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])

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
      result.push({ label: format(d, 'MMM'), total: sums.get(key) || 0 })
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
    }]
  }

  const doughnutData = {
    labels: categoryBreakdown.map(c => c.name),
    datasets: [{
      data: categoryBreakdown.map(c => c.total),
      backgroundColor: categoryBreakdown.map(c => c.color),
      borderWidth: 0,
    }]
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      categoryId: formData.get('categoryId') as string,
      date: formData.get('date') as string || format(new Date(), 'yyyy-MM-dd'),
    }
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const newExpense = await res.json()
        setAllExpenses(prev => [newExpense, ...prev])
        form.reset()
      }
    } catch (err) { console.error(err) }
  }

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(budgetInputRef.current?.value || '0')
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
    } catch (error) { console.error(error) }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) setAllExpenses(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      {budgetModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Set Budget</h2>
              <button onClick={() => setBudgetModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"><X className="w-6 h-6 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleBudgetSubmit}>
              <div className="relative mb-8">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-zinc-500 font-medium">₹</span>
                <input ref={budgetInputRef} type="number" defaultValue={currentBudget.amount || ''} className="w-full pl-12 pr-6 py-5 text-3xl font-bold bg-zinc-800 border border-zinc-700 rounded-2xl focus:border-emerald-500 outline-none text-white" placeholder="0" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setBudgetModalOpen(false)} className="flex-1 py-4 bg-zinc-800 text-zinc-300 rounded-2xl font-semibold hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold transition-all">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
              <h1 className="text-lg font-bold hidden sm:block">FinanceFlow</h1>
            </div>
            <div className="flex bg-zinc-800/50 p-1 rounded-lg">
                {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === mode ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="lg:hidden mb-6"><ExpenseForm categories={categories} onAdd={handleAddExpense} /></div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div onClick={() => setBudgetModalOpen(true)} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 cursor-pointer">
              <p className="text-zinc-500 text-xs font-bold uppercase">{viewMode} Budget</p>
              <p className="text-2xl font-bold mt-2">{currency(currentBudget.amount || 0)}</p>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(budgetUsed, 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
               <p className="text-zinc-500 text-xs font-bold uppercase">Total Spent</p>
               <p className="text-2xl font-bold mt-2">{currency(totalSpent)}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hidden sm:block">
               <p className="text-zinc-500 text-xs font-bold uppercase">Average</p>
               <p className="text-2xl font-bold mt-2">{currency(avgExpense)}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hidden sm:block">
               <p className="text-zinc-500 text-xs font-bold uppercase">Highest</p>
               <p className="text-2xl font-bold mt-2">{currency(maxExpense)}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
             {(['overview', 'transactions', 'analytics'] as const).map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl text-sm capitalize whitespace-nowrap ${activeTab === tab ? "bg-emerald-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"}`}>
                    {tab}
                 </button>
             ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="hidden lg:block"><ExpenseForm categories={categories} onAdd={handleAddExpense} /></div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                 {/* Line Chart Fix */}
                 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4 sm:p-6 overflow-hidden">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400"/> Spending Trend</h3>
                    <div className="relative h-[250px] sm:h-[300px] w-full">
                       <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                 </div>

                 {/* Doughnut Chart Fix */}
                 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4 sm:p-6 overflow-hidden">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-purple-400"/> Breakdown</h3>
                    <div className="relative h-[250px] sm:h-[300px] w-full flex items-center justify-center">
                       {categoryBreakdown.length > 0 ? (
                           <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#a1a1aa', font: { size: 10 } } } } }} />
                       ) : <p className="text-zinc-500">No data</p>}
                    </div>
                 </div>
              </div>

              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
                 <h3 className="font-bold mb-4">Recent Transactions</h3>
                 <div className="space-y-3">
                    {filteredExpenses.slice(0, 5).map(e => (
                        <div key={e.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">{categoriesById[e.categoryId]?.icon || '📦'}</div>
                              <div>
                                 <p className="text-sm font-semibold">{e.title}</p>
                                 <p className="text-[10px] text-zinc-500">{format(new Date(e.date), 'dd MMM')}</p>
                              </div>
                           </div>
                           <p className="font-bold text-sm">{currency(e.amount)}</p>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
             <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full mb-4 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl outline-none text-sm" />
                <div className="space-y-2">
                    {filteredExpenses.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-4 bg-zinc-950/30 rounded-xl">
                            <div className="flex items-center gap-3">
                               <span className="text-xl">{categoriesById[e.categoryId]?.icon}</span>
                               <div>
                                  <p className="text-sm font-medium">{e.title}</p>
                                  <p className="text-[10px] text-zinc-500">{e.date}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-bold">{currency(e.amount)}</span>
                               <button onClick={() => deleteExpense(e.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
                  <h3 className="font-bold mb-6">Annual Insights</h3>
                  <div className="relative h-[350px] w-full">
                      <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
              </div>
          )}
        </main>
      </div>
    </>
  )
}