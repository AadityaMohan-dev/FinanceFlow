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
    // FIX: Added explicit types for sum and exp
    const totalSum = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0)
    
    const avgExpense = expenses.length > 0 ? totalSum / expenses.length : 0
    
    // FIX: Added explicit type for map
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map((e: { amount: number }) => e.amount)) : 0
    
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
      // FIX: Added explicit type for cb (Prisma GroupBy result)
      categoryBreakdown.map(async (cb: { categoryId: string; _sum: { amount: number | null } }) => {
        const category = await prisma.category.findUnique({
          where: { id: cb.categoryId },
        })
        
        // Handle case where category might be null (though referential integrity usually prevents this)
        if (!category) {
            return {
                id: cb.categoryId,
                name: 'Unknown',
                icon: '?',
                color: '#cccccc',
                total: cb._sum.amount || 0
            }
        }

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