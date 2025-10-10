'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`/api/expenses?page=${pagination.currentPage}&limit=${pagination.limit}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, exp) => sum + Number(exp.amount), 0);
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);
  const topCategory = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600">Track and manage your business expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-600 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h3 className="text-sm font-medium text-orange-600 mb-1">This Month</h3>
          <p className="text-2xl font-bold text-orange-900">₹{thisMonthExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Total Records</h3>
          <p className="text-2xl font-bold text-purple-900">{expenses.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Top Category</h3>
          <p className="text-lg font-bold text-blue-900">{topCategory ? topCategory[0].replace('_', ' ') : 'N/A'}</p>
          <p className="text-sm text-blue-700">{topCategory ? `₹${topCategory[1].toLocaleString()}` : ''}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/expenses/add">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Add Expense
          </button>
        </Link>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="OFFICE_SUPPLIES">Office Supplies</option>
          <option value="TRAVEL">Travel</option>
          <option value="MEALS">Meals</option>
          <option value="SOFTWARE">Software</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="MARKETING">Marketing</option>
          <option value="UTILITIES">Utilities</option>
          <option value="RENT">Rent</option>
          <option value="OTHER">Other</option>
        </select>
        <button className="p-2 hover:bg-gray-100 rounded-lg border">
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg border">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            className="pl-10 w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Expense</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Project</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Receipt</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <IconCurrencyDollar size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{expense.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 font-medium text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {expense.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {expense.project?.name || '-'}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCalendar size={16} className="text-gray-400" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
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
                <td className="p-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {expenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No expenses found</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 pr-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select 
              value={pagination.limit} 
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} expenses
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    pageNum === pagination.currentPage 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}