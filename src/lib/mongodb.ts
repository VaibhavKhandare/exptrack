// lib/mongodb.ts
import { EXPENSE_CATEGORIES } from '@/commons'
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  _id?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  saving: number;
  date: Date;
}

export interface ExpenseDocument extends Omit<Expense, 'date'> {
  date: string;
}

export async function getExpenses(startDate?: Date, endDate?: Date): Promise<ExpenseDocument[]> {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  
  let query = {};
  if (startDate || endDate) {
    query = {
      date: {
        ...(startDate && { $gte: startDate }),
        ...(endDate && { $lte: endDate })
      }
    };
  }

  const expenses = await db.collection<Expense>("expenses")
    .find(query)
    .sort({ date: -1 })
    .toArray();

  return expenses.map(expense => ({
    ...expense,
    date: expense.date.toISOString(),
  }));
}

export async function addExpense(expense: Omit<Expense, '_id' | 'date'>): Promise<string> {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  const result = await db.collection<Expense>("expenses").insertOne({
    ...expense,
    date: new Date(),
  });
  return result.insertedId.toString();
}