'use client'

import { useState, useEffect, useCallback } from 'react'

interface Stats {
  totalSum: number
  avgExpense: number
  maxExpense: number
  transactionCount: number
  categoryBreakdown: Array<{
    id: string
    name: string
    icon: string
    color: string
    total: number
  }>
  monthlyTrend: Array<{
    month: string
    total: number
  }>
}

export function useStats(period: 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/stats?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}