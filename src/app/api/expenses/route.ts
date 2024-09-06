// app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/mongodb';
import { EXPENSE_CATEGORIES } from '@/commons';
import { ObjectId } from 'mongodb';

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

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const data = await request.json();

    if (!EXPENSE_CATEGORIES.includes(data.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const updatedExpense = {
      description: data.description,
      amount: Number(data.amount),
      category: data.category as ExpenseCategory,
      saving: Number(data.saving),
      date: new Date(data.date)
    };

    const result = await updateExpense(id, updatedExpense);
    if (result) {
      return NextResponse.json({ success: true, id });
    } else {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const result = await deleteExpense(id);
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { expenses } = await request.json();

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json({ error: 'Invalid expenses data' }, { status: 400 });
    }

    const validatedExpenses = expenses.map(expense => ({
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category as ExpenseCategory,
      saving: Number(expense.saving),
      date: expense.date ? new Date(expense.date) : new Date(),
      _id: new ObjectId()
    }));

    const result = await addExpense(validatedExpenses);
    
    return NextResponse.json({ success: true, insertedCount: result.insertedCount });
  } catch (error) {
    console.error('Failed to bulk add expenses:', error);
    return NextResponse.json({ error: 'Failed to bulk add expenses' }, { status: 500 });
  }
}