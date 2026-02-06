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

// --- Quick Add Expense Form (Layout Preserved) ---
function ExpenseForm({ 
  categories, 
  onAdd 
}: { 
  categories: Category[], 
  onAdd: (e: React.FormEvent<HTMLFormElement>) => void 
}) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-md rounded-[2rem] border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      {/* Subtle Glow background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-all duration-500" />
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plus className="w-6 h-6 text-black font-bold" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Quick Add</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Transaction Entry</p>
        </div>
      </div>

      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 relative z-10">
        <div className="lg:col-span-4">
          <input name="title" required placeholder="Description" className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm transition-all placeholder:text-zinc-700 text-white font-medium" />
        </div>
        <div className="lg:col-span-2">
          <input name="amount" type="number" step="0.01" required placeholder="Amount" className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm transition-all placeholder:text-zinc-700 text-white font-medium" />
        </div>
        <div className="lg:col-span-3">
          <select name="categoryId" required className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 outline-none text-sm transition-all text-zinc-400 appearance-none cursor-pointer font-medium">
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2 min-w-0">
          <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-emerald-500/50 outline-none text-sm transition-all text-zinc-400 cursor-pointer font-medium" />
        </div>
        <div className="lg:col-span-1">
          <button type="submit" className="w-full h-full min-h-[56px] bg-white text-black rounded-2xl font-black hover:bg-emerald-400 transition-all flex items-center justify-center shadow-xl shadow-white/5 active:scale-95">
            <Plus className="w-6 h-6" />
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
    } catch (err) { console.error(err) } finally { setLoading(false) }
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
  const remainingBudget = (currentBudget.amount || 0) - totalSpent
  const budgetUsed = currentBudget.amount ? (totalSpent / currentBudget.amount) * 100 : 0
  const isOverBudget = totalSpent > currentBudget.amount
  const transactionCount = filteredExpenses.length
  const avgExpense = transactionCount ? totalSpent / transactionCount : 0
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
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
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

  return (
    <>
      {budgetModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Set {viewMode} Budget</h2>
              <button onClick={() => setBudgetModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-2xl transition-colors"><X className="w-6 h-6 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleBudgetSubmit}>
              <div className="relative mb-8">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-zinc-600 font-black">₹</span>
                <input ref={budgetInputRef} type="number" defaultValue={currentBudget.amount || ''} autoFocus className="w-full pl-12 pr-6 py-6 text-4xl font-black bg-zinc-950 border border-zinc-800 rounded-3xl focus:border-emerald-500 outline-none text-white transition-all shadow-inner" placeholder="0" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setBudgetModalOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#09090b] text-zinc-100">
        <header className="bg-zinc-950/50 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-12"><DollarSign className="w-5 h-5 text-black font-black" /></div>
              <h1 className="text-lg font-black tracking-tighter hidden sm:block">FinanceFlow</h1>
            </div>
            <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
                {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${viewMode === mode ? 'bg-zinc-800 text-emerald-400 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {mode.toUpperCase()}
                  </button>
                ))}
            </div>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 rounded-xl border border-zinc-800" } }} />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="lg:hidden mb-8"><ExpenseForm categories={categories} onAdd={handleAddExpense} /></div>

          {/* Stats Section (Original Grid Layout Preserved) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            
            {/* INTEGRATED BUDGET CARD */}
            <div 
              onClick={() => setBudgetModalOpen(true)} 
              className="bg-zinc-900/40 p-7 rounded-[2.2rem] border border-zinc-800 cursor-pointer hover:border-zinc-700 group transition-all relative overflow-hidden shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{viewMode} Budget</p>
                  <p className="text-3xl font-black text-white">{currency(currentBudget.amount || 0)}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-2xl group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all border border-zinc-800">
                  <Edit2 className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                 <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                      {isOverBudget ? 'Exceeded' : 'Available'}
                    </p>
                    <p className={`text-xl font-black ${isOverBudget ? 'text-red-500' : 'text-emerald-400'}`}>
                      {currency(Math.abs(remainingBudget))}
                    </p>
                 </div>
                 <p className="text-xs font-black text-zinc-100">
                    {Math.round(budgetUsed)}%
                 </p>
              </div>

              <div className="h-2.5 w-full bg-zinc-800/50 rounded-full overflow-hidden p-0.5 border border-zinc-800/50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isOverBudget ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`} 
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-7 rounded-[2.2rem] border border-zinc-800 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] group-hover:bg-blue-500/10 transition-all" />
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Spent</p>
               <p className="text-3xl font-black text-white">{currency(totalSpent)}</p>
               <div className="flex items-center gap-2 mt-6 py-1.5 px-3 bg-zinc-800/40 rounded-xl border border-zinc-800 w-fit">
                  <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{transactionCount} Trans.</span>
               </div>
            </div>

            <div className="bg-zinc-900/40 p-7 rounded-[2.2rem] border border-zinc-800 shadow-xl hidden lg:block relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-[40px] group-hover:bg-purple-500/10 transition-all" />
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avg. Expense</p>
               <p className="text-3xl font-black text-white">{currency(avgExpense)}</p>
               <div className="flex items-center gap-2 mt-6 py-1.5 px-3 bg-zinc-800/40 rounded-xl border border-zinc-800 w-fit">
                  <Target className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Efficiency</span>
               </div>
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
             {(['overview', 'transactions', 'analytics'] as const).map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-zinc-900/50 text-zinc-500 border border-zinc-800 hover:text-white"}`}>
                    {tab}
                 </button>
             ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="hidden lg:block"><ExpenseForm categories={categories} onAdd={handleAddExpense} /></div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                 <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-zinc-500 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400"/> Spending Trend</h3>
                    <div className="relative h-[250px] sm:h-[300px] w-full">
                       <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
                    </div>
                 </div>

                 <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-zinc-500 flex items-center gap-2"><PieChart className="w-4 h-4 text-purple-400"/> Breakdown</h3>
                    <div className="relative h-[250px] sm:h-[300px] w-full flex items-center justify-center">
                       {categoryBreakdown.length > 0 ? (
                           <Doughnut data={{
                            labels: categoryBreakdown.map(c => c.name),
                            datasets: [{
                              data: categoryBreakdown.map(c => c.total),
                              backgroundColor: categoryBreakdown.map(c => c.color),
                              borderWidth: 0,
                              borderRadius: 4
                            }]
                          }} options={{ responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 20, color: '#71717a', font: { weight: 'bold', size: 10 } } } } }} />
                       ) : <div className="text-zinc-700 flex flex-col items-center gap-2 uppercase font-black text-[10px] tracking-widest"><PackageOpen className="w-12 h-12 opacity-10" /> Empty State</div>}
                    </div>
                 </div>
              </div>

              <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 shadow-xl">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Recent Transactions</h3>
                   <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-black text-emerald-500 hover:underline tracking-widest">VIEW ALL</button>
                 </div>
                 <div className="space-y-3">
                    {filteredExpenses.length > 0 ? filteredExpenses.slice(0, 5).map(e => (
                        <div key={e.id} className="group flex items-center justify-between p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-default">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:scale-105 transition-transform">{categoriesById[e.categoryId]?.icon || '📦'}</div>
                              <div>
                                 <p className="text-sm font-bold text-white">{e.title}</p>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{format(new Date(e.date), 'dd MMM, yyyy')}</p>
                              </div>
                           </div>
                           <p className="font-black text-sm text-white">{currency(e.amount)}</p>
                        </div>
                    )) : <p className="text-center py-12 text-zinc-700 font-black text-[10px] uppercase tracking-widest">No recent transactions</p>}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
             <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-6 sm:p-8 shadow-xl">
                <div className="relative mb-8">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..." className="w-full pl-14 pr-6 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl outline-none text-sm focus:border-emerald-500/50 transition-all text-white font-medium" />
                </div>
                <div className="space-y-3">
                    {filteredExpenses.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-5 bg-zinc-950/20 rounded-2xl border border-zinc-800/40 hover:border-zinc-600 transition-all group">
                            <div className="flex items-center gap-4">
                               <span className="text-2xl bg-zinc-900 w-14 h-14 flex items-center justify-center rounded-2xl border border-zinc-800">{categoriesById[e.categoryId]?.icon}</span>
                               <div>
                                  <p className="text-sm font-black text-white">{e.title}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{e.date}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <span className="text-sm font-black text-white">{currency(e.amount)}</span>
                               <button onClick={async () => { if(confirm('Delete?')) { await fetch(`/api/expenses/${e.id}`, { method: 'DELETE' }); setAllExpenses(allExpenses.filter(x => x.id !== e.id)) } }} className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <div className="text-center py-24">
                        <Receipt className="w-16 h-16 text-zinc-800 mx-auto mb-4 opacity-20" />
                        <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em]">History is empty</p>
                      </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
              <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 shadow-xl">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-8">Long-term Analytics</h3>
                  <div className="relative h-[400px] w-full">
                      <Line 
                        data={lineChartData} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.03)' }, border: { display: false }, ticks: { color: '#3f3f46', font: { weight: 'bold', size: 10 } } },
                            x: { grid: { display: false }, ticks: { color: '#3f3f46', font: { weight: 'bold', size: 10 } } }
                          }
                        }} 
                      />
                  </div>
              </div>
          )}
        </main>
      </div>
    </>
  )
}