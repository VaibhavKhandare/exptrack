'use client'

import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const ExpenseAnalysis: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<{ [key: string]: number }>({});
  const [categoryTotals, setCategoryTotals] = useState<{ [key: string]: number }>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    const response = await fetch(`/api/expenses?year=${selectedYear}&month=${selectedMonth}`);
    const data = await response.json();
    setExpenses(data);
    calculateMonthlyTotals(data);
    calculateCategoryTotals(data);
  };

  const calculateMonthlyTotals = (expenseData: Expense[]) => {
    const totals = expenseData.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    setMonthlyTotals(totals);
  };

  const calculateCategoryTotals = (expenseData: Expense[]) => {
    const totals = expenseData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    setCategoryTotals(totals);
  };

  const barChartData = {
    labels: Object.keys(monthlyTotals).sort(),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.keys(monthlyTotals).sort().map(month => monthlyTotals[month]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Expense Analysis',
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Expense Categories',
      },
    },
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Expense Analysis</h2>
      <div className="mb-4 flex items-center">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="mr-2 p-2 border rounded"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="mr-2 p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <button
          onClick={fetchExpenses}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch Expenses
        </button>
      </div>
      <div className="mb-8">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
      <div>
        <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
      </div>
    </div>
  );
};

export default ExpenseAnalysis;