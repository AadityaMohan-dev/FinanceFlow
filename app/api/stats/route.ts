import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, eachMonthOfInterval, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'

    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'yearly':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'monthly':
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
    }

    // Get expenses for the period
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    // Calculate stats
    // FIX: Added ': number' to the sum parameter
    const totalSum = expenses.reduce((sum: number, exp) => sum + exp.amount, 0)
    
    const avgExpense = expenses.length > 0 ? totalSum / expenses.length : 0
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0
    const transactionCount = expenses.length

    // Category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const categoriesWithTotals = await Promise.all(
      categoryBreakdown.map(async (cb) => {
        const category = await prisma.category.findUnique({
          where: { id: cb.categoryId },
        })
        return {
          ...category,
          total: cb._sum.amount || 0,
        }
      })
    )

    // Monthly trend (last 6 months)
    const last6Months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    })

    const monthlyTrend = await Promise.all(
      last6Months.map(async (month) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        const result = await prisma.expense.aggregate({
          where: {
            userId: user.id,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        })

        return {
          month: format(month, 'MMM'),
          total: result._sum.amount || 0,
        }
      })
    )

    return NextResponse.json({
      totalSum,
      avgExpense,
      maxExpense,
      transactionCount,
      categoryBreakdown: categoriesWithTotals.filter(c => c.total > 0),
      monthlyTrend,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}