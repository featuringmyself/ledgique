"use client";
import axios from "axios";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Dynamically import Recharts components to avoid SSR issues
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [projectCount, setProjectCount] = useState("-")
  const [clientCount, setClientCount] = useState("-")
  const [pendingAmount, setPendingAmount] = useState("-")
  const [revenue, setRevenue] = useState("-")
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [projectStatusData, setProjectStatusData] = useState<any[]>([])
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([])
  const [clientSourcesData, setClientSourcesData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Total Revenue</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">₹{revenue}</p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>+11.01%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-3xl border border-purple-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Active Projects</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">{projectCount}</p>
              <div className="flex items-center text-red-500 text-sm font-medium">
                <span>-0.03%</span>
                <IconTrendingDown size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Active Clients</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">{clientCount}</p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>+15.03%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-3xl border border-purple-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Pending Payments</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">₹{pendingAmount}</p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>+6.08%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Chart and Clients */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-8">
                <button className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-2">Monthly Growth</button>
                <button className="text-gray-400 font-medium">Clients vs Projects</button>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData.map(item => ({ 
                  month: item.month, 
                  currentWeek: item.clients, 
                  previousWeek: item.projects 
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="currentWeekGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f2937" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1f2937" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="previousWeekGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.7} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: unknown) => [value as string, '']}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="currentWeek"
                    stroke="#1f2937"
                    strokeWidth={4}
                    fill="url(#currentWeekGradient)"
                    dot={{ fill: '#1f2937', strokeWidth: 3, stroke: 'white', r: 5 }}
                    activeDot={{
                      r: 8,
                      stroke: '#1f2937',
                      strokeWidth: 3,
                      fill: 'white'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previousWeek"
                    stroke="#9ca3af"
                    strokeWidth={3}
                    strokeDasharray="10 5"
                    fill="url(#previousWeekGradient)"
                    dot={{ fill: '#9ca3af', strokeWidth: 2, stroke: 'white', r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: '#9ca3af',
                      strokeWidth: 2,
                      fill: 'white'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
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


          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Payment Methods</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodsData.map(item => ({
                  name: item.method.replace('_', ' '),
                  value: item.count,
                  color: ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'][paymentMethodsData.indexOf(item) % 6]
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'][index % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Project Status</h3>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: unknown) => [value as string, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
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

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Payment Methods</h3>
            <div className="h-48">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodsData.map(item => ({
                  name: item.method.replace('_', ' '),
                  value: parseFloat(item.percentage)
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="marketingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#marketingGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4 max-h-48 overflow-y-auto">
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

