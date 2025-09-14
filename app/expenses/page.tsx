'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconCurrencyDollar, IconReceipt } from '@tabler/icons-react';
import Link from 'next/link';

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/expenses/add">
          <button className="p-2 hover:bg-gray-100 rounded">
            <IconPlus size={20} />
          </button>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses"
            className="pl-10 w-64 border-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-3 font-normal">Expense</th>
              <th className="pb-3 font-normal">Amount</th>
              <th className="pb-3 font-normal">Category</th>
              <th className="pb-3 font-normal">Project</th>
              <th className="pb-3 font-normal">Date</th>
              <th className="pb-3 font-normal">Receipt</th>
              <th className="pb-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <IconCurrencyDollar size={16} className="text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{expense.title}</span>
                      {expense.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{expense.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <IconCurrencyDollar size={16} className="text-gray-400" />
                    {expense.amount.toLocaleString()}
                  </div>
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {expense.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {expense.project?.name || '-'}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCalendar size={16} className="text-gray-400" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4">
                  {expense.receiptUrl ? (
                    <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                      <IconReceipt size={16} />
                      View
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}