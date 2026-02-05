import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'

// Define the type for the context
type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getOrCreateUser()
    const { id } = await params // ✅ Await params here

    const expense = await prisma.expense.findFirst({
      where: {
        id: id, // Use the destructured id
        userId: user.id,
      },
      include: {
        category: true,
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

// PUT update expense
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getOrCreateUser()
    const { id } = await params // ✅ Await params here
    const body = await request.json()

    const { title, amount, categoryId, date, description } = body

    // Verify ownership
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    const expense = await prisma.expense.update({
      where: { id: id },
      data: {
        title,
        amount: parseFloat(amount),
        categoryId,
        date: date ? new Date(date) : undefined,
        description,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getOrCreateUser()
    const { id } = await params // ✅ Await params here

    // Verify ownership
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    await prisma.expense.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}