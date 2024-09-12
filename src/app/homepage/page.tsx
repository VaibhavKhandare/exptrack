'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import CountUp from 'react-countup';


// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { EXPENSE_CATEGORIES } from '../../commons';
import HorizontalBarChart from "../../components/HorizontalBar";

interface Expense {
  category: typeof EXPENSE_CATEGORIES[number];
  amount: number;
  saving: number;
}

interface CategoryTotal {
  [category: string]: number;
}

const HomePage: React.FC = () => {
  // const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal>({});

  const today = format(new Date(), 'MMMM dd, yyyy');
  const username = "Vaibhav"; // Replace with actual username logic

  const fetchExpenses = async () => {
    const date = new Date();
    const response = await fetch(`/api/expenses?year=${date.getFullYear()}&month=${date.getMonth() + 1}`);
    const data = await response.json();

    // console.log('data', data)
    // setExpenses(data);

    const total = data.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    const saving = data.reduce((sum: number, expense: Expense) => sum + expense.saving || 0, 0);
    setTotalAmount(total);
    setTotalSaved(saving);

    // Calculate totals for each category
    const totals = data.reduce((acc: CategoryTotal, expense: Expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    setCategoryTotals(totals);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(50deg,#fff,#0ff)] p-8 text-gray-500 font-bold mb-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <span className="text-xl text-gray-700">Hi, {username}</span>
              <Avatar>
                <AvatarImage src="/avatar.png" alt={username} />
                <AvatarFallback>{username[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <h1 className="text-3xl">
          Total Spends: 
        </h1>
        <h1 className="text-4xl">
          <CountUp end={totalAmount} duration={1} prefix=" ₹" decimals={2} />
        </h1>
        
        <div className="w-full">
          <HorizontalBarChart categoryTotals={categoryTotals} totalAmount={totalAmount} />
        </div>

        <h1 className="text-4xl mt-10">
          Saved: <CountUp end={totalSaved} duration={1} prefix=" ₹" decimals={2} />
        </h1>

      
        <footer className="fixed bottom-20 left-0 right-0">
          <h3 className="text-2xl font-bold text-center">{today}</h3>
        </footer>

      </div>
    </div>
  );
};

export default HomePage;
