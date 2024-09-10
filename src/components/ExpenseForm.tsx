'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ExpenseForm() {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const router = useRouter()

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description && amount) {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount: parseFloat(amount) }),
      })

      if (response.ok) {
        setDescription('')
        setAmount('')
        router.refresh()
      }
    }
  }

  return (
    <form onSubmit={addExpense} className="space-y-4 mb-4">
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button type="submit">Add Expense</Button>
    </form>
  )
}