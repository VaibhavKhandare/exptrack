// app/api/expenses/route.ts
import { NextResponse } from 'next/server';
import {getExpenses,addExpense} from '@/lib/mongodb';
import { EXPENSE_CATEGORIES } from '@/commons';

type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!EXPENSE_CATEGORIES.includes(data.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    
    const newExpense = {
      description: data.description,
      amount: Number(data.amount),
      category: data.category as ExpenseCategory,
      saving: Number(data.saving),
      date: data.date || new Date().toISOString(), // Use provided date or current date
    }
    
    const insertedId = await addExpense(newExpense)
    return NextResponse.json({ success: true, id: insertedId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0)

    const expenses = await getExpenses(startDate, endDate)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}