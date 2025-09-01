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



  // Data for Total Clients chart - More dynamic with ups and downs
  const clientsData = [
    { month: 'Jan', currentWeek: 12000000, previousWeek: 10000000 },
    { month: 'Feb', currentWeek: 18000000, previousWeek: 14000000 },
    { month: 'Mar', currentWeek: 14000000, previousWeek: 16000000 },
    { month: 'Apr', currentWeek: 25000000, previousWeek: 18000000 },
    { month: 'May', currentWeek: 22000000, previousWeek: 20000000 },
    { month: 'Jun', currentWeek: 30000000, previousWeek: 24000000 },
    { month: 'Jul', currentWeek: 28000000, previousWeek: 26000000 },
  ];

  // Data for Support Tickets - More varied data
  const supportData = [
    { name: 'Billing', value: 45, color: '#8b5cf6' },
    { name: 'Technical', value: 78, color: '#10b981' },
    { name: 'Review', value: 62, color: '#f59e0b' },
    { name: 'Follow-up', value: 89, color: '#3b82f6' },
    { name: 'F-R', value: 34, color: '#ef4444' },
    { name: 'Other', value: 56, color: '#06b6d4' },
  ];

  // Data for Marketing & SEO - More dynamic values
  const marketingData = [
    { name: 'SEO', value: 65, color: '#8b5cf6' },
    { name: 'Social', value: 89, color: '#10b981' },
    { name: 'Email', value: 45, color: '#f59e0b' },
    { name: 'PPC', value: 92, color: '#3b82f6' },
    { name: 'Content', value: 73, color: '#ef4444' },
    { name: 'Organic', value: 98, color: '#06b6d4' },
  ];

  // Data for Client Location Pie Chart
  const locationData = [
    { name: 'United States', value: 38.6, color: '#1f2937' },
    { name: 'Canada', value: 22.5, color: '#6366f1' },
    { name: 'Mexico', value: 30.8, color: '#10b981' },
    { name: 'Other', value: 8.1, color: '#f59e0b' },
  ];
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/projects/active/count');
        setProjectCount(response.data);
        console.log(response.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }

    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clients/active/count');
        setClientCount(response.data);
        console.log(response.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
    fetchClients();
  }, []);
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Total Revenue</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">721K</p>
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
              <p className="text-4xl font-bold text-gray-900">239K</p>
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
                <button className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-2">Total Clients</button>
                <button className="text-gray-400 font-medium">Total Projects</button>
                <button className="text-gray-400 font-medium">Operating Status</button>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-900 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 font-medium">Current Week</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 font-medium">Previous Week</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: unknown) => [`${((value as number) / 1000000).toFixed(1)}M`, '']}
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
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Google</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-20 h-full bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">YouTube</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-16 h-full bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Instagram</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-20 h-full bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Pinterest</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-12 h-full bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Facebook</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-16 h-full bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Twitter</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-14 h-full bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Tumblr</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-10 h-full bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">


          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Support Tickets</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    {supportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Client by Location</h3>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
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
                    formatter={(value: unknown) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {locationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-semibold mb-6">Marketing & SEO</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

