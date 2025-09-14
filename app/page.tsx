"use client";
import axios from "axios";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Chart.js imports
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), { ssr: false });

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
  const [loading, setLoading] = useState(true)
  const [projectCount, setProjectCount] = useState("-")
  const [clientCount, setClientCount] = useState("-")
  const [pendingAmount, setPendingAmount] = useState("-")
  const [revenue, setRevenue] = useState("-")
  const [revenueChange, setRevenueChange] = useState("+0.00%")
  const [projectChange, setProjectChange] = useState("+0.00%")
  const [clientChange, setClientChange] = useState("+0.00%")
  const [pendingChange, setPendingChange] = useState("+0.00%")

  const getChangeStyle = (change: string) => {
    const isZero = change.includes('0.00%')
    const isPositive = change.startsWith('+')
    return {
      color: isZero ? 'text-gray-500' : (isPositive ? 'text-green-600' : 'text-red-500'),
      isPositive,
      isZero
    }
  }
  const [monthlyData, setMonthlyData] = useState<{month: string; clients: number; projects: number}[]>([])
  const [projectStatusData, setProjectStatusData] = useState<{name: string; value: number; color: string}[]>([])
  const [paymentMethodsData, setPaymentMethodsData] = useState<{method: string; count: number; percentage: string}[]>([])
  const [clientSourcesData, setClientSourcesData] = useState<{name: string; percentage: number}[]>([])
  const [recentActivity, setRecentActivity] = useState<{type: string; title: string; date: string; amount?: string}[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          projectsRes, 
          clientsRes, 
          revenueRes, 
          pendingRes,
          monthlyRes,
          projectStatusRes,
          paymentMethodsRes,
          clientSourcesRes,
          recentActivityRes
        ] = await Promise.all([
          axios.get('/api/projects/active/count'),
          axios.get('/api/clients/active/count'),
          axios.get('/api/payments/revenue'),
          axios.get('/api/payments/pending/count'),
          axios.get('/api/dashboard/monthly-stats'),
          axios.get('/api/dashboard/project-status'),
          axios.get('/api/payments/methods'),
          axios.get('/api/dashboard/client-sources'),
          axios.get('/api/dashboard/recent-activity')
        ]);
        
        setProjectCount(projectsRes.data);
        setClientCount(clientsRes.data);
        setRevenue(revenueRes.data);
        setPendingAmount(pendingRes.data.totalPendingAmount);
        setMonthlyData(monthlyRes.data);
        setProjectStatusData(projectStatusRes.data);
        setPaymentMethodsData(paymentMethodsRes.data);
        setClientSourcesData(clientSourcesRes.data);
        setRecentActivity(recentActivityRes.data);
        
        // Fetch percentage changes with fallbacks
        try {
          const revenueChangeRes = await axios.get('/api/payments/revenue/change');
          setRevenueChange(revenueChangeRes.data);
        } catch { setRevenueChange('0.00%'); }
        
        try {
          const projectChangeRes = await axios.get('/api/projects/change');
          setProjectChange(projectChangeRes.data);
        } catch { setProjectChange('0.00%'); }
        
        try {
          const clientChangeRes = await axios.get('/api/clients/change');
          setClientChange(clientChangeRes.data);
        } catch { setClientChange('0.00%'); }
        
        try {
          const pendingChangeRes = await axios.get('/api/payments/pending/change');
          setPendingChange(pendingChangeRes.data);
        } catch { setPendingChange('0.00%'); }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const fmt = Intl.NumberFormat('en', { notation: 'compact' });
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: "Total Revenue", value: `₹${revenue === '-' ? revenue : fmt.format(Number(revenue))}`, change: revenueChange, bg: "bg-[#E3F5FF]", border: "border-blue-100/50" },
            { title: "Active Projects", value: projectCount, change: projectChange, bg: "bg-[#E5ECF6]", border: "border-purple-100/50" },
            { title: "Active Clients", value: clientCount, change: clientChange, bg: "bg-[#E3F5FF]", border: "border-blue-100/50" },
            { title: "Pending Payments", value: `₹${typeof pendingAmount === 'string' && pendingAmount !== '-' ? fmt.format(Number(pendingAmount)) : pendingAmount}`, change: pendingChange, bg: "bg-[#E5ECF6]", border: "border-purple-100/50" }
          ].map((card, index) => (
            <div key={index} className={`${card.bg} p-6 rounded-xl border ${card.border}`}>
              <h3 className="text-gray-600 font-semibold text-sm mb-3">{card.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-gray-900">{card.value}</p>
                <div className={`flex items-center ${getChangeStyle(card.change).color} text-sm font-medium`}>
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
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#F7F9FB] p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-8">
                <button className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-2">Monthly Growth</button>
              </div>
              <div className="flex items-center space-x-6">
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
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Clients from</h3>
            <div className="space-y-5">
              {clientSourcesData.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">{source.name}</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-800 rounded-full" 
                      style={{ width: `${Math.min(source.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-4 gap-6">


          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Payment Methods</h3>
            <div className="h-48">
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
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Project Status</h3>
            <div className="h-48 mb-4">
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
            </div>

            <div className="space-y-3">
              {projectStatusData.map((item, index) => (
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
              ))}
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Payment Percentages</h3>
            <div className="h-48">
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
            </div>
          </div>

          <div className="bg-[#F7F9FB] p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
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
              ))}
              {recentActivity.length === 0 && (
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

