import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BudgetPeriod } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') || 'monthly'
    const period = periodParam.toUpperCase() as BudgetPeriod

    const budget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        period,
      },
    })

    if (!budget) {
      return NextResponse.json({ amount: 0, period: periodParam.toLowerCase() }, { status: 200 })
    }

    return NextResponse.json({
      ...budget,
      period: budget.period.toLowerCase(),
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, period: periodParam } = body

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const period = (periodParam || 'monthly').toUpperCase() as BudgetPeriod

    // Use upsert to handle both create and update in one operation
    const budget = await prisma.budget.upsert({
      where: {
        userId_period: {
          userId: user.id,
          period,
        },
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
        period,
        // startDate and categoryId are NOT included here
      },
    })

    return NextResponse.json({
      ...budget,
      period: budget.period.toLowerCase(),
    })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}