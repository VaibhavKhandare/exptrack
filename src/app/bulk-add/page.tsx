'use client'

import React, { useState } from 'react';
import Papa from 'papaparse';
import { EXPENSE_CATEGORIES, midVibrate, smallVibrate } from '@/commons';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { SelectTrigger } from '@radix-ui/react-select';
import { toast } from 'sonner';


const BulkAddExpenses: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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


  const handleTableCellChange = (index: number, value: string, type: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][type] = value;
    setExpenses(updatedExpenses);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    expenses.forEach(e => {
      e.date = new Date(e.date).toISOString();
      e.category = e.category || EXPENSE_CATEGORIES[12];
    });

    try {
      const response = await axios.patch('/api/expenses', { expenses });
      console.log('Expenses saved successfully:', response.data);
      setExpenses([]);
      setCsvText('');
      setFile(null);
      toast("✅ Expense Added");
      smallVibrate(navigator);
    } catch (err) {
      midVibrate(navigator);
      toast("❌ Expense Not Added")
      setError('Failed to save expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Bulk Add Expenses</h2>
      <div className="mb-4">
        <Input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
        <p className="text-sm text-gray-600 mb-2">Or paste CSV content below:</p>
        <Textarea
          value={csvText}
          onChange={handleTextAreaChange}
          className="w-full h-32"
          placeholder="Paste CSV content here..."
        />
      </div>
      <Input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
        className="mb-4 mr-4"
      />
      <Button onClick={handleUpload} variant="default">Upload</Button>
      {expenses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Extracted Expenses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      id="description"
                      value={expense.description}
                      onChange={(e) => handleTableCellChange(index, e.target.value, 'description')}
                      className="col-span-3"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      id="amount"
                      value={expense.amount}
                      onChange={(e) => handleTableCellChange(index, e.target.value, 'amount')}
                      className="col-span-3"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      id="date"
                      value={expense.date}
                      onChange={(e) => handleTableCellChange(index, e.target.value, 'date')}
                      className="col-span-3"
                      type='date'
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.category || EXPENSE_CATEGORIES[12]}
                      onValueChange={(value) => handleTableCellChange(index, value, 'category')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button 
            onClick={handleSubmit} 
            className="mt-4"
            variant="default"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Expenses'}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default function BulkAddPage() {
  return <BulkAddExpenses />;
}