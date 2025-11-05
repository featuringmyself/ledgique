"use client";
import { useState, useEffect } from "react";
import { useCurrency } from '@/components/providers/CurrencyProvider';
import axios from "axios";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconUsers,
  IconBriefcase,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface GrowthReportData {
  currentPeriod: {
    revenue: number;
    clients: number;
    projects: number;
    expenses: number;
    profit: number;
  };
  previousPeriod: {
    revenue: number;
    clients: number;
    projects: number;
    expenses: number;
    profit: number;
  };
  growth: {
    revenue: number;
    clients: number;
    projects: number;
    profit: number;
  };
  monthlyTrends: Array<{
    period: string;
    revenue: number;
    clients: number;
    projects: number;
    expenses: number;
    profit: number;
  }>;
  period: string;
}

interface MonthlyTrendChartProps {
  data: Array<{
    period: string;
    revenue: number;
    profit: number;
  }>;
  formatCurrency: (amount: number) => string;
  formatPeriod: (period: string) => string;
}

function MonthlyTrendChart({ data, formatCurrency, formatPeriod }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  // Calculate max values for scaling
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)), 1);
  const maxValue = Math.max(maxRevenue, maxProfit);

  // Chart dimensions
  const chartHeight = 280;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 50;

  // Calculate bar height as percentage
  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  // Y-axis tick values
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => maxValue * r);

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative min-w-[600px]">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pb-12">
          {ticks.reverse().map((tick, i) => (
            <span key={i}>{formatCurrency(tick)}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-16 relative" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {ticks.map((tick, i) => {
              const y = chartPaddingTop + ((chartHeight - chartPaddingTop - chartPaddingBottom) * (1 - i / (ticks.length - 1)));
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

          {/* Bars container */}
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-12 gap-2">
            {data.map((item, index) => {
              const revenueHeight = getBarHeight(item.revenue);
              const profitHeight = getBarHeight(Math.abs(item.profit));
              const isProfitPositive = item.profit >= 0;
              
              return (
                <div
                  key={`period-${item.period}-${index}`}
                  className="flex flex-col items-center gap-2 relative group flex-1"
                >
                  {/* Bars wrapper */}
                  <div className="flex items-end justify-center gap-1.5 w-full h-full relative">
                    {/* Revenue bar */}
                    <div className="relative group/revenue">
                      <div
                        className="bg-blue-400 rounded-t hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 cursor-pointer"
                        style={{
                          width: '20px',
                          height: `${(revenueHeight / 100) * (chartHeight - chartPaddingTop - chartPaddingBottom)}px`,
                          minHeight: revenueHeight > 0 ? '2px' : '0',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/revenue:block z-20 whitespace-nowrap">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                            <div className="font-semibold">Revenue</div>
                            <div>{formatCurrency(item.revenue)}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>

                    {/* Profit bar */}
                    <div className="relative group/profit">
                      <div
                        className={`rounded-t transition-all duration-200 cursor-pointer ${
                          isProfitPositive 
                            ? 'bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600' 
                            : 'bg-rose-400 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600'
                        }`}
                        style={{
                          width: '20px',
                          height: `${(profitHeight / 100) * (chartHeight - chartPaddingTop - chartPaddingBottom)}px`,
                          minHeight: profitHeight > 0 ? '2px' : '0',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/profit:block z-20 whitespace-nowrap">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                            <div className="font-semibold">Profit</div>
                            <div className={isProfitPositive ? 'text-green-400' : 'text-red-400'}>
                              {formatCurrency(item.profit)}
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Period label */}
                  <div className="absolute -bottom-10 w-full text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatPeriod(item.period)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis line */}
        <div className="ml-16 border-t-2 border-gray-300 dark:border-neutral-600 mt-2"></div>
      </div>
    </div>
  );
}

export default function GrowthReportsPage() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<GrowthReportData | null>(null);
  const [period, setPeriod] = useState('year');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/growth', {
        params: { period },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching growth report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
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
              Growth Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your business growth and performance trends
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <IconDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-3xl border border-blue-100/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Revenue</h3>
              <IconTrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {formatCurrency(reportData.currentPeriod.revenue)}
            </p>
            <div className={`flex items-center text-sm font-medium ${getGrowthColor(reportData.growth.revenue)}`}>
              {reportData.growth.revenue >= 0 ? (
                <IconTrendingUp size={16} className="mr-1" />
              ) : (
                <IconTrendingDown size={16} className="mr-1" />
              )}
              {formatGrowth(reportData.growth.revenue)} vs previous period
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-3xl border border-purple-100/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Clients</h3>
              <IconUsers className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {reportData.currentPeriod.clients}
            </p>
            <div className={`flex items-center text-sm font-medium ${getGrowthColor(reportData.growth.clients)}`}>
              {reportData.growth.clients >= 0 ? (
                <IconTrendingUp size={16} className="mr-1" />
              ) : (
                <IconTrendingDown size={16} className="mr-1" />
              )}
              {formatGrowth(reportData.growth.clients)} vs previous period
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-3xl border border-green-100/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Projects</h3>
              <IconBriefcase className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {reportData.currentPeriod.projects}
            </p>
            <div className={`flex items-center text-sm font-medium ${getGrowthColor(reportData.growth.projects)}`}>
              {reportData.growth.projects >= 0 ? (
                <IconTrendingUp size={16} className="mr-1" />
              ) : (
                <IconTrendingDown size={16} className="mr-1" />
              )}
              {formatGrowth(reportData.growth.projects)} vs previous period
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-6 rounded-3xl border border-orange-100/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Profit</h3>
              <IconChartBar className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {formatCurrency(reportData.currentPeriod.profit)}
            </p>
            <div className={`flex items-center text-sm font-medium ${getGrowthColor(reportData.growth.profit)}`}>
              {reportData.growth.profit >= 0 ? (
                <IconTrendingUp size={16} className="mr-1" />
              ) : (
                <IconTrendingDown size={16} className="mr-1" />
              )}
              {formatGrowth(reportData.growth.profit)} vs previous period
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Revenue & Profit Trends
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Profit</span>
              </div>
            </div>
          </div>
          
          <MonthlyTrendChart data={reportData.monthlyTrends} formatCurrency={formatCurrency} formatPeriod={formatPeriod} />
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
            Period Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Metric</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Current</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Previous</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Revenue</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(reportData.currentPeriod.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{formatCurrency(reportData.previousPeriod.revenue)}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${getGrowthColor(reportData.growth.revenue)}`}>
                    {formatGrowth(reportData.growth.revenue)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Clients</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{reportData.currentPeriod.clients}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{reportData.previousPeriod.clients}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${getGrowthColor(reportData.growth.clients)}`}>
                    {formatGrowth(reportData.growth.clients)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Projects</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{reportData.currentPeriod.projects}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{reportData.previousPeriod.projects}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${getGrowthColor(reportData.growth.projects)}`}>
                    {formatGrowth(reportData.growth.projects)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Profit</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(reportData.currentPeriod.profit)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{formatCurrency(reportData.previousPeriod.profit)}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${getGrowthColor(reportData.growth.profit)}`}>
                    {formatGrowth(reportData.growth.profit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

