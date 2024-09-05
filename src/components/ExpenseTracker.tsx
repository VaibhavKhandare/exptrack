// app/expense-tracker/ExpenseForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

import { useMediaQuery } from 'react-responsive';
import { EXPENSE_CATEGORIES } from '@/commons'

const ExpenseTracker: React.FC = () => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<typeof EXPENSE_CATEGORIES[number]>(EXPENSE_CATEGORIES[0])
  const [saving, setSaving] = useState('')
  const [showAmountControls, setShowAmountControls] = useState(false)
  const [showSavingControls, setShowSavingControls] = useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if ( amount && category) {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description, 
          amount: parseFloat(amount), 
          category, 
          saving: saving ? parseFloat(saving) : 0 
        }),
      })

      if (response.ok) {
        setDescription('')
        setAmount('')
        setCategory(EXPENSE_CATEGORIES[0])
        setSaving('')
        setShowAmountControls(false)
        setShowSavingControls(false)
        router.refresh()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpense(e as unknown as React.FormEvent);
    }
  }

  const quickAddAmount = (value: number) => {
    setAmount(value.toString());
  }

  const quickAddSaving = (value: number) => {
    setSaving(value.toString());
  }

  const commonValues = [10, 20, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];

  const handleCategorySelect = (selectedCategory: typeof EXPENSE_CATEGORIES[number]) => {
    setCategory(selectedCategory);
    if (description && amount) {
      addExpense({ preventDefault: () => {} } as React.FormEvent);
    }
  }

  const categoryGroups = [
    { name: 'Travel', categories: ['Necessary Travel', 'Friends Travel', 'Other Travel'] },
    { name: 'Food', categories: ['Basic Food', 'Zomato Food', 'Hotel Food', 'Dessert'] },
    { name: 'Expenses', categories: ['Rent', 'House', 'TFG', 'Invest'] },
    { name: 'Other', categories: ['Other'] }
  ];

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Expense Tracker</h1>
      <form onSubmit={addExpense} className="space-y-4">
        <div>
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full ${isMobile ? 'mb-4' : ''} border-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'space-y-2'}`}>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowAmountControls(true)}
            onBlur={() => setTimeout(() => setShowAmountControls(false), 200)}
            className="w-full border-none focus:ring-2 focus:ring-blue-500"
          />
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAmountControls ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-2">
              {commonValues.map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => quickAddAmount(value)}
                  className="px-2 py-1 text-sm"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'space-y-2'}`}>
          <Input
            type="number"
            placeholder="Saving"
            value={saving}
            onChange={(e) => setSaving(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSavingControls(true)}
            onBlur={() => setTimeout(() => setShowSavingControls(false), 200)}
            className="w-full border-none focus:ring-2 focus:ring-blue-500"
          />
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSavingControls ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={saving}
              onChange={(e) => setSaving(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-2">
              {commonValues.map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => quickAddSaving(value)}
                  className="px-2 py-1 text-sm"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {categoryGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="flex flex-wrap gap-2">
                {group.categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat as typeof EXPENSE_CATEGORIES[number])}
                    className={`px-3 py-2 text-sm flex items-center ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {getCategoryIcon(cat as typeof EXPENSE_CATEGORIES[number])}
                    <span className="ml-2">{cat}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button type="submit" className={`bg-blue-500 hover:bg-blue-600 transition-colors duration-200`}>
          Add Expense
        </Button>
      </form>
    </Card>
  );
};

const getCategoryIcon = (category: typeof EXPENSE_CATEGORIES[number]) => {
  switch (category) {
    case 'Necessary Travel':
      return '🚗';
    case 'Friends Travel':
      return '🚆';
    case 'Other Travel':
      return '✈️';
    case 'Basic Food':
      return '🍽️';
    case 'Zomato Food':
      return '🍔';
    case 'Hotel Food':
      return '🏨';
    case 'Dessert':
      return '🍰';
    case 'Rent':
      return '🏠';
    case 'House':
      return '';
    case 'TFG':
      return '💼';
    case 'Invest':
      return '📈';
    case 'Savings':
      return '💰';
    case 'Other':
      return '🔹';
    default:
      return '❓';
  }
};


export default function ExpenseForm() {
  return <ExpenseTracker/>;
}