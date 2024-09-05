
// app/api/savings/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  const client = await clientPromise
  const db = client.db("expenseTracker")
  const savings = await db.collection("savings").find({}).sort({ date: -1 }).toArray()
  
  return NextResponse.json(savings)
}
