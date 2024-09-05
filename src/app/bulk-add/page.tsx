'use client'

import React, { useState } from 'react';
import Papa from 'papaparse';
import { EXPENSE_CATEGORIES } from '@/commons';

const BulkAddExpenses: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
  };

  const handleUpload = () => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setExpenses(result.data.map((item: any) => ({ ...item, date, category: '' })));
        },
        header: true,
      });
    } else if (csvText) {
      Papa.parse(csvText, {
        complete: (result) => {
          setExpenses(result.data.map((item: any) => ({ ...item, date, category: '' })));
        },
        header: true,
      });
    }
  };

  const handleCategoryChange = (index: number, category: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].category = category;
    setExpenses(updatedExpenses);
  };

  const handleSubmit = async () => {
    // Implement the API call to save expenses
    console.log('Submitting expenses:', expenses);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Bulk Add Expenses</h2>
      <div className="mb-4">
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
        <p className="text-sm text-gray-600 mb-2">Or paste CSV content below:</p>
        <textarea
          value={csvText}
          onChange={handleTextAreaChange}
          className="w-full h-32 p-2 border rounded"
          placeholder="Paste CSV content here..."
        />
      </div>
      <input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
        className="mb-4 mr-4"
      />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
      
      {expenses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Extracted Expenses</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.description}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.date}</td>
                  <td>
                    <select 
                      value={expense.category || ''}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                    >
                      <option value="">Select category</option>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      {/* Add more categories as needed */}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
            Save Expenses
          </button>
        </div>
      )}
    </div>
  );
};

export default function BulkAddPage() {
  return <BulkAddExpenses />;
}