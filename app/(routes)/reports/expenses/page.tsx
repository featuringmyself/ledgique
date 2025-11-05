"use client";
import { useState, useEffect } from "react";
import { useCurrency } from '@/components/providers/CurrencyProvider';
import axios from "axios";
import {
  IconReceipt,
  IconDownload,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseReportData {
  summary: {
    totalExpenses: number;
    totalCount: number;
    averageExpense: number;
  };
  timeSeries: Array<{
    period: string;
    total: number;
    count: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  expensesByProject: Array<{
    projectId: string;
    name: string;
    total: number;
    count: number;
  }>;
  expensesByClient: Array<{
    clientId: string;
    name: string;
    total: number;
    count: number;
  }>;
  topExpenses: Array<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    project?: string;
    client?: string;
  }>;
}

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  formatValue: (value: number) => string;
  height?: number;
}

function BarChart({ data, formatValue, height = 280 }: BarChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartPaddingTop = 20;
  const chartPaddingBottom = 50;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => maxValue * r);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  const getColor = (index: number) => {
    // Very subtle muted slate-gray shades - barely different from each other
    const subtleShades = [
      'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
      'bg-slate-400 hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400',
      'bg-slate-500 hover:bg-slate-600 dark:bg-slate-400 dark:hover:bg-slate-300',
    ];
    return subtleShades[index % subtleShades.length];
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative min-w-[600px]">
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pb-12">
          {ticks.reverse().map((tick, i) => (
            <span key={i}>{formatValue(tick)}</span>
          ))}
        </div>

        <div className="ml-16 relative" style={{ height: `${height}px` }}>
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {ticks.map((tick, i) => {
              const y = chartPaddingTop + ((height - chartPaddingTop - chartPaddingBottom) * (1 - i / (ticks.length - 1)));
              return (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-gray-700"
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex items-end justify-between px-4 pb-12 gap-2">
            {data.map((item, index) => {
              const barHeight = getBarHeight(item.value);
              
              return (
                <div
                  key={`bar-${item.label}-${index}`}
                  className="flex flex-col items-center gap-2 relative group flex-1"
                >
                  <div className="relative group/bar w-full h-full flex items-end justify-center">
                    <div
                      className={`${getColor(index)} rounded-t transition-all duration-200 cursor-pointer w-full max-w-[80%]`}
                      style={{
                        height: `${(barHeight / 100) * (height - chartPaddingTop - chartPaddingBottom)}px`,
                        minHeight: barHeight > 0 ? '2px' : '0',
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/bar:block z-20 whitespace-nowrap">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                          {formatValue(item.value)}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-10 w-full text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ml-16 border-t-2 border-gray-300 dark:border-neutral-600 mt-2"></div>
      </div>
    </div>
  );
}

export default function ExpenseReportsPage() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ExpenseReportData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [groupBy, setGroupBy] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, groupBy]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/expenses', {
        params: { startDate, endDate, groupBy },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching expense report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatPeriod = (period: string) => {
    if (groupBy === 'month') {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (groupBy === 'day') {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (groupBy === 'week') {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return period;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Expense Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive expense tracking and analytics
            </p>
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <IconDownload className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 sm:p-6 rounded-3xl border border-red-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Total Expenses</h3>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900">
              {formatCurrency(reportData.summary.totalExpenses)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-3xl border border-purple-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Total Count</h3>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900">
              {reportData.summary.totalCount}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-6 rounded-3xl border border-orange-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Average Expense</h3>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900">
              {formatCurrency(reportData.summary.averageExpense)}
            </p>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
            Expense Trend
          </h3>
          <BarChart 
            data={reportData.timeSeries.map(item => ({
              label: formatPeriod(item.period),
              value: item.total,
            }))}
            formatValue={formatCurrency}
            height={280}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
              Expenses by Category
            </h3>
            <BarChart 
              data={reportData.categoryBreakdown.map(item => ({
                label: item.category.replace(/_/g, ' ').slice(0, 10),
                value: item.total,
              }))}
              formatValue={formatCurrency}
              height={220}
            />
            <div className="mt-4 space-y-2">
              {reportData.categoryBreakdown.map((item, idx) => (
                <div key={`category-${item.category}-${idx}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.percentage.toFixed(1)}% ({item.count} expenses)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Expenses */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
              Top Expenses
            </h3>
            <div className="space-y-3">
              {reportData.topExpenses.map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {expense.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.category.replace(/_/g, ' ')}
                        {expense.project && ` • ${expense.project}`}
                        {expense.client && ` • ${expense.client}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses by Project and Client */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
              Expenses by Project
            </h3>
            <div className="space-y-3">
              {reportData.expensesByProject.slice(0, 10).map((item) => (
                <div key={item.projectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} expenses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
              Expenses by Client
            </h3>
            <div className="space-y-3">
              {reportData.expensesByClient.slice(0, 10).map((item) => (
                <div key={item.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} expenses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

