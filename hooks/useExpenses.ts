'use client'

import { useState, useEffect, useCallback } from 'react'

interface Expense {
  id: string
  title: string
  amount: number
  description?: string
  date: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface UseExpensesOptions {
  period?: 'weekly' | 'monthly' | 'yearly'
  search?: string
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { period = 'monthly', search = '' } = options

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('period', period)
      if (search) params.append('search', search)

      const response = await fetch(`/api/expenses?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [period, search])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (data: {
    title: string
    amount: number
    categoryId: string
    date?: string
    description?: string
  }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to add expense')
      }

      const newExpense = await response.json()
      setExpenses(prev => [newExpense, ...prev])
      return newExpense
    } catch (err) {
      throw err
    }
  }

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update expense')
      }

      const updatedExpense = await response.json()
      setExpenses(prev =>
        prev.map(exp => (exp.id === id ? updatedExpense : exp))
      )
      return updatedExpense
    } catch (err) {
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    expenses,
    isLoading,
    error,
    refetch: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  }
}