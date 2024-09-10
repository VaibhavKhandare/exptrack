// lib/mongodb.ts
import { EXPENSE_CATEGORIES } from '@/commons'
import { MongoClient, ObjectId } from 'mongodb'

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
  _id?: ObjectId;
  description: string;
  amount: number;
  category: ExpenseCategory;
  saving: number;
  date: Date;
}

export interface ExpenseDocument extends Omit<Expense, 'date'> {
}

export async function getExpenses(startDate?: string, endDate?: string): Promise<ExpenseDocument[]> {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  
  let query = {};
  if (startDate || endDate) {
    query = {
      'date': {
        ...(startDate && { $gte: startDate }),
        ...(endDate && { $lte: endDate })
      }
    };
  }

  console.log('query', query)

  const expenses = await db.collection<Expense>("expenses")
    .find(query)
    .sort({ date: -1 })
    .toArray();

    // const expenses2 = await db.collection<Expense>("expenses")
    // .find({})
    // .sort({ date: -1 })
    // .toArray();

  // console.log('expenses', expenses.length, expenses2.length)

  return expenses.map(expense => {
    return {
    ...expense,
  }});
}

async function getExpensesCollection() {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  return db.collection<Expense>("expenses");
}

export async function addExpense(expense: Expense | Expense[]): Promise<{ insertedId?: ObjectId, insertedCount?: number }> {
  const collection = await getExpensesCollection();
  console.log('expense', expense)
  if (Array.isArray(expense)) {
    const result = await collection.insertMany(expense);
    return { insertedCount: result.insertedCount };
  } else {
    const result = await collection.insertOne(expense);
    return { insertedId: result.insertedId };
  }
}

export async function updateExpense(id: string, updateData: Partial<Expense>): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  
  const result = await db.collection<Expense>("expenses").updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db("expenseTracker");
  const result = await db.collection<Expense>("expenses").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}