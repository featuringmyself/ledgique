'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  receiptUrl?: string;
  project?: { name: string };
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => router.push('/expenses/add')}>
          Add Expense
        </Button>
      </div>



      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-gray-500">{expense.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">${expense.amount}</td>
                  <td className="px-6 py-4">{expense.category.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {expense.receiptUrl && (
                      <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}