import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'

// GET all expenses
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST new expense
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()

    const { title, amount, categoryId, date, description } = body

    if (!title || !amount || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        categoryId,
        date: date ? new Date(date) : new Date(),
        description,
        userId: user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}