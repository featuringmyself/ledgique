"use client";
import axios from "axios";
import { IconTrendingUp, IconTrendingDown, IconRefresh } from "@tabler/icons-react";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { 
  getCachedDashboardData, 
  setCachedDashboardData, 
  hasDataChanged
} from '@/lib/dashboardCache';

// Chart.js imports - lazy loaded
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { 
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-pulse bg-gray-200 rounded w-full h-full"></div></div>
});
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { 
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center"><div className="animate-pulse bg-gray-200 rounded w-full h-full"></div></div>
});
const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), { 
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center"><div className="animate-pulse bg-gray-200 rounded w-full h-full"></div></div>
});

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  // Critical data states
  const [criticalDataLoading, setCriticalDataLoading] = useState(true)
  const [projectCount, setProjectCount] = useState("-")
  const [clientCount, setClientCount] = useState("-")
  const [pendingAmount, setPendingAmount] = useState("-")
  const [revenue, setRevenue] = useState("-")
  const [revenueChange, setRevenueChange] = useState("+0.00%")
  const [projectChange, setProjectChange] = useState("+0.00%")
  const [clientChange, setClientChange] = useState("+0.00%")
  const [pendingChange, setPendingChange] = useState("+0.00%")

  // Secondary data states
  const [chartsLoading, setChartsLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<{month: string; clients: number; projects: number}[]>([])
  const [projectStatusData, setProjectStatusData] = useState<{name: string; value: number; color: string}[]>([])
  const [paymentMethodsData, setPaymentMethodsData] = useState<{method: string; count: number; percentage: string}[]>([])
  const [clientSourcesData, setClientSourcesData] = useState<{name: string; percentage: number}[]>([])
  const [recentActivity, setRecentActivity] = useState<{type: string; title: string; date: string; amount?: string}[]>([])

  // Refresh states
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasCachedData, setHasCachedData] = useState(false)

  const getChangeStyle = (change: string) => {
    const isZero = change.includes('0.00%')
    const isPositive = change.startsWith('+')
    return {
      color: isZero ? 'text-gray-500' : (isPositive ? 'text-green-600' : 'text-red-500'),
      isPositive,
      isZero
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      // Always check for cached data first
      const cachedData = getCachedDashboardData();
      
      if (cachedData) {
        // Always load cached data immediately (regardless of expiry)
        setProjectCount(cachedData.criticalData.projectCount);
        setClientCount(cachedData.criticalData.clientCount);
        setPendingAmount(cachedData.criticalData.pendingAmount);
        setRevenue(cachedData.criticalData.revenue);
        setRevenueChange(cachedData.criticalData.revenueChange);
        setProjectChange(cachedData.criticalData.projectChange);
        setClientChange(cachedData.criticalData.clientChange);
        setPendingChange(cachedData.criticalData.pendingChange);
        
        setMonthlyData(cachedData.chartsData.monthlyData);
        setProjectStatusData(cachedData.chartsData.projectStatusData);
        setPaymentMethodsData(cachedData.chartsData.paymentMethodsData);
        setClientSourcesData(cachedData.chartsData.clientSourcesData);
        setRecentActivity(cachedData.chartsData.recentActivity);
        
        setCriticalDataLoading(false);
        setChartsLoading(false);
        setHasCachedData(true);
        
        // Always start background refresh (regardless of cache expiry)
        setIsRefreshing(true);
      }

      try {
        // Always fetch fresh data from API in background
        const criticalPromises = [
          axios.get('/api/projects/active/count'),
          axios.get('/api/clients/active/count'),
          axios.get('/api/payments/revenue'),
          axios.get('/api/payments/pending/count')
        ];

        const [projectsRes, clientsRes, revenueRes, pendingRes] = await Promise.all(criticalPromises);
        
        const freshCriticalData = {
          projectCount: projectsRes.data,
          clientCount: clientsRes.data,
          revenue: revenueRes.data,
          pendingAmount: pendingRes.data.totalPendingAmount,
          revenueChange: "+0.00%",
          projectChange: "+0.00%",
          clientChange: "+0.00%",
          pendingChange: "+0.00%"
        };

        // Fetch percentage changes
        const changePromises = [
          axios.get('/api/payments/revenue/change').then(res => res.data).catch(() => "+0.00%"),
          axios.get('/api/projects/change').then(res => res.data).catch(() => "+0.00%"),
          axios.get('/api/clients/change').then(res => res.data).catch(() => "+0.00%"),
          axios.get('/api/payments/pending/change').then(res => res.data).catch(() => "+0.00%")
        ];

        const [revenueChangeRes, projectChangeRes, clientChangeRes, pendingChangeRes] = await Promise.all(changePromises);
        
        freshCriticalData.revenueChange = revenueChangeRes;
        freshCriticalData.projectChange = projectChangeRes;
        freshCriticalData.clientChange = clientChangeRes;
        freshCriticalData.pendingChange = pendingChangeRes;

        // Fetch charts data
        const chartPromises = [
          axios.get('/api/dashboard/monthly-stats'),
          axios.get('/api/dashboard/project-status'),
          axios.get('/api/payments/methods'),
          axios.get('/api/dashboard/client-sources'),
          axios.get('/api/dashboard/recent-activity')
        ];

        const [monthlyRes, projectStatusRes, paymentMethodsRes, clientSourcesRes, recentActivityRes] = await Promise.all(chartPromises);
        
        const freshChartsData = {
          monthlyData: monthlyRes.data,
          projectStatusData: projectStatusRes.data,
          paymentMethodsData: paymentMethodsRes.data,
          clientSourcesData: clientSourcesRes.data,
          recentActivity: recentActivityRes.data
        };

        // Check if data has changed
        const freshData = {
          criticalData: freshCriticalData,
          chartsData: freshChartsData
        };

        if (!cachedData || hasDataChanged(cachedData, freshData)) {
          // Update state with fresh data
          setProjectCount(freshCriticalData.projectCount);
          setClientCount(freshCriticalData.clientCount);
          setPendingAmount(freshCriticalData.pendingAmount);
          setRevenue(freshCriticalData.revenue);
          setRevenueChange(freshCriticalData.revenueChange);
          setProjectChange(freshCriticalData.projectChange);
          setClientChange(freshCriticalData.clientChange);
          setPendingChange(freshCriticalData.pendingChange);
          
          setMonthlyData(freshChartsData.monthlyData);
          setProjectStatusData(freshChartsData.projectStatusData);
          setPaymentMethodsData(freshChartsData.paymentMethodsData);
          setClientSourcesData(freshChartsData.clientSourcesData);
          setRecentActivity(freshChartsData.recentActivity);
        }

        // Always cache the fresh data
        setCachedDashboardData(freshData);
        
        setCriticalDataLoading(false);
        setChartsLoading(false);
        setIsRefreshing(false);
        setHasCachedData(false);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setCriticalDataLoading(false);
        setChartsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadDashboardData();
  }, []);
  if (criticalDataLoading) {
    return (
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-6">
          {/* Top Stats Cards Skeleton */}
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-[#E3F5FF] p-6 rounded-xl border border-blue-100/50 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                <div className="flex items-end justify-between">
                  <div className="h-10 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section Skeleton */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-[#F7F9FB] p-8 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-8">
                <div className="h-6 bg-gray-300 rounded w-32"></div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>

            <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-24 mb-6"></div>
              <div className="space-y-5">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-32 mb-6"></div>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                {index === 1 && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                )}
                {index === 3 && (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const fmt = Intl.NumberFormat('en', { notation: 'compact' });
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
          {[
            { title: "Total Revenue", value: `₹${revenue === '-' ? revenue : fmt.format(Number(revenue))}`, change: revenueChange, bg: "bg-[#E3F5FF]", border: "border-blue-100/50" },
            { title: "Active Projects", value: projectCount, change: projectChange, bg: "bg-[#E5ECF6]", border: "border-purple-100/50" },
            { title: "Active Clients", value: clientCount, change: clientChange, bg: "bg-[#E3F5FF]", border: "border-blue-100/50" },
            { title: "Pending Payments", value: `₹${typeof pendingAmount === 'string' && pendingAmount !== '-' ? fmt.format(Number(pendingAmount)) : fmt.format(Number(pendingAmount))}`, change: pendingChange, bg: "bg-[#E5ECF6]", border: "border-purple-100/50" }
          ].map((card, index) => (
            <div key={index} className={`${card.bg} md:p-6 p-3 rounded-xl border ${card.border} relative`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-semibold md:text-sm text-xs">{card.title}</h3>
                {isRefreshing && hasCachedData && (
                  <IconRefresh size={14} className="text-gray-400 animate-spin" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <p className="md:text-4xl text-xl font-bold text-gray-900">{card.value}</p>
                <div className={`flex items-center ${getChangeStyle(card.change).color} md:text-sm text-xs font-medium`}>
                  <span>{card.change}</span>
                  {!getChangeStyle(card.change).isZero && (getChangeStyle(card.change).isPositive ? 
                    <IconTrendingUp size={16} className="ml-1" /> : 
                    <IconTrendingDown size={16} className="ml-1" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section - Chart and Clients */}
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
          <div className="col-span-2 bg-[#F7F9FB] md:p-8 p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-8">
                <button className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-2">Monthly Growth</button>
                {isRefreshing && hasCachedData && (
                  <IconRefresh size={16} className="text-gray-400 animate-spin" />
                )}
              </div>
              <div className="flex items-center md:space-x-6 space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-900 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 font-medium">Clients</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 font-medium">Projects</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
                </div>
              ) : (
                <Line
                  data={{
                    labels: monthlyData.map(item => item.month),
                    datasets: [
                      {
                        label: 'Clients',
                        data: monthlyData.map(item => item.clients),
                        borderColor: '#1f2937',
                        backgroundColor: 'rgba(31, 41, 55, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: '#1f2937',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 5,
                        tension: 0.4
                      },
                      {
                        label: 'Projects',
                        data: monthlyData.map(item => item.projects),
                        borderColor: '#9ca3af',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        borderWidth: 3,
                        borderDash: [10, 5],
                        pointBackgroundColor: '#9ca3af',
                        pointBorderColor: 'white',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#e5e7eb',
                        bodyColor: 'white',
                        borderWidth: 0,
                        cornerRadius: 12
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: '#f3f4f6' },
                        border: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 12 } }
                      },
                      y: {
                        grid: { color: '#f3f4f6' },
                        border: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 12 } }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">Clients from</h3>
              {isRefreshing && hasCachedData && (
                <IconRefresh size={14} className="text-gray-400 animate-spin" />
              )}
            </div>
            <div className="space-y-5">
              {chartsLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))
              ) : (
                clientSourcesData.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">{source.name}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-800 rounded-full" 
                        style={{ width: `${Math.min(source.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-4 grid-cols-1 gap-6">


          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">Payment Methods</h3>
              {isRefreshing && hasCachedData && (
                <IconRefresh size={14} className="text-gray-400 animate-spin" />
              )}
            </div>
            <div className="h-48">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
                </div>
              ) : (
                <Bar
                  data={{
                    labels: paymentMethodsData.map(item => item.method.replace('_', ' ')),
                    datasets: [{
                      data: paymentMethodsData.map(item => item.count),
                      backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'],
                      borderRadius: 6,
                      borderSkipped: false
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#e5e7eb',
                        bodyColor: 'white',
                        borderWidth: 0,
                        cornerRadius: 12
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 11 } }
                      },
                      y: {
                        grid: { color: '#f3f4f6' },
                        border: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 12 } }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">Project Status</h3>
              {isRefreshing && hasCachedData && (
                <IconRefresh size={14} className="text-gray-400 animate-spin" />
              )}
            </div>
            <div className="h-48 mb-4">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-200 rounded-full w-32 h-32"></div>
                </div>
              ) : (
                <Doughnut
                  data={{
                    labels: projectStatusData.map(item => item.name),
                    datasets: [{
                      data: projectStatusData.map(item => item.value),
                      backgroundColor: projectStatusData.map(item => item.color),
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#e5e7eb',
                        bodyColor: 'white',
                        borderWidth: 0,
                        cornerRadius: 8
                      }
                    }
                  }}
                />
              )}
            </div>

            <div className="space-y-3">
              {chartsLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-8 animate-pulse"></div>
                  </div>
                ))
              ) : (
                projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">Payment Percentages</h3>
              {isRefreshing && hasCachedData && (
                <IconRefresh size={14} className="text-gray-400 animate-spin" />
              )}
            </div>
            <div className="h-48">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
                </div>
              ) : (
                <Bar
                  data={{
                    labels: paymentMethodsData.map(item => item.method.replace('_', ' ')),
                    datasets: [{
                      data: paymentMethodsData.map(item => parseFloat(item.percentage)),
                      backgroundColor: '#10b981',
                      borderRadius: 6,
                      borderSkipped: false
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#e5e7eb',
                        bodyColor: 'white',
                        borderWidth: 0,
                        cornerRadius: 12,
                        callbacks: {
                          label: (context) => `${context.parsed.y}%`
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 11 } }
                      },
                      y: {
                        grid: { color: '#f3f4f6' },
                        border: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 12 } }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold">Recent Activity</h3>
              {isRefreshing && hasCachedData && (
                <IconRefresh size={14} className="text-gray-400 animate-spin" />
              )}
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {chartsLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'project' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.amount && (
                        <p className="text-xs text-green-600 font-medium">
                          ₹{activity.amount}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {!chartsLoading && recentActivity.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

