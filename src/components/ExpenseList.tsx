// app/expense-tracker/ExpenseList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExpenseDocument } from '@/lib/mongodb'

export default function ExpenseList({ initialExpenses }: { initialExpenses: ExpenseDocument[] }) {
  const [expenses, setExpenses] = useState(initialExpenses)

  useEffect(() => {
    setExpenses(initialExpenses)
  }, [initialExpenses])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalSavings = expenses.reduce((sum, expense) => sum + expense.saving, 0)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Saving</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense._id}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>${expense.amount.toFixed(2)}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>${expense.saving.toFixed(2)}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 font-bold">
        <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
        <p>Total Savings: ${totalSavings.toFixed(2)}</p>
        <p>Net Savings: ${(totalSavings - totalExpenses).toFixed(2)}</p>
      </div>
    </div>
  )
}
