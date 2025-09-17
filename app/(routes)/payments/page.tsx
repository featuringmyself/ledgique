"use client";
import { useState, useEffect } from "react";
import capitalize from "capitalize";
import axios from "axios";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCreditCard,
  IconFilter,
  IconSortDescending,
  IconSearch,
  IconCalendar,
  IconDots,
  IconCurrencyDollar,
  IconCheck,
  IconClock,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";


interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  project: {
    name: string;
    id: string;
  };
  client: {
      id: string;
      name: string;
      email: string[];
      phone: string[];
  };
}

interface PaymentMethod {
  method: string;
  count: number;
  percentage: string;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState("-");
  const [pendingAmount, setPendingAmount] = useState("-");
  const [overDueAmount, setOverDueAmount] = useState("-");
  const [monthlyRevenue, setMonthlyRevenue] = useState("-");
  const [, setRecentPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          revenueRes,
          pendingRes,
          overDueRes,
          monthlyRevenue,
          recentPayments,
          methodsRes,
          allPaymentsRes
        ] = await Promise.all([
          axios.get("/api/payments/revenue"),
          axios.get("/api/payments/pending/count"),
          axios.get("/api/payments/overdue"),
          axios.get("/api/payments/monthlyRevenue"),
          axios.get("/api/payments/list", { params: { take: 5 } }),
          axios.get("/api/payments/methods"),
          axios.get("/api/payments")
        ]);

        setTotalRevenue(revenueRes.data);
        setPendingAmount(pendingRes.data.totalPendingAmount);
        setOverDueAmount(overDueRes.data);
        setMonthlyRevenue(monthlyRevenue.data);
        setRecentPayments(recentPayments.data);
        setPaymentMethods(methodsRes.data);
        setAllPayments(allPaymentsRes.data);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);





  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <IconCheck size={16} />;
      case 'PENDING': return <IconClock size={16} />;
      case 'FAILED': return <IconX size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD': return <IconCreditCard size={16} />;
      default: return <IconCurrencyDollar size={16} />;
    }
  };

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }


  const fmt = Intl.NumberFormat('en', { notation: 'compact' });
  return (
    <div className="flex w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage all payment transactions
            </p>
          </div>
          <Link href="/payments/add">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <IconCreditCard className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              Total Revenue
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(totalRevenue))}
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>+12.5%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-3xl border border-purple-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              Pending Payments
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(pendingAmount))}
              </p>
              <div className="flex items-center text-red-500 text-sm font-medium">
                <span>-2.1%</span>
                <IconTrendingDown size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              This Month
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(monthlyRevenue))}
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>+8.2%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Overdue</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(overDueAmount))}
              </p>
              <div className="flex items-center text-red-500 text-sm font-medium">
                <span>+15.3%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

     

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 mb-6">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
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
              placeholder="Search payments..."
              className="pl-10 w-64 border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* All Payments Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              All Payments ({filteredPayments.length})
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Project
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Method
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <IconCurrencyDollar size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment?.client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment?.client?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-gray-900">
                      {payment.project.name}
                    </td>
                    <td className="py-4 px-2 font-semibold text-gray-900">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getMethodIcon(payment.method)}
                        {capitalize.words(payment.method.replace("_", " "))}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        payment.status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                        payment.status === 'PENDING' ? 'text-yellow-700 bg-yellow-100' :
                        payment.status === 'FAILED' ? 'text-red-700 bg-red-100' :
                        'text-gray-700 bg-gray-100'
                      }`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IconCalendar size={16} className="text-gray-400" />
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <IconDots size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No payments found</p>
              </div>
            )}
          </div>
        </div>

           {/* Payment Stats */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">{capitalize.words(method.method.replace("_", " "))}</p>
                <p className="text-2xl font-bold text-gray-900">{method.percentage}%</p>
                <p className="text-xs text-gray-500">{method.count} payments</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods & Quick Actions */}
        {/* <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Methods
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <IconCreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Bank Transfer
                    </div>
                    <div className="text-sm text-gray-500">Most used</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">65%</div>
                  <div className="text-sm text-gray-500">of payments</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <IconCreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">UPI</div>
                    <div className="text-sm text-gray-500">Quick payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">25%</div>
                  <div className="text-sm text-gray-500">of payments</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <IconCreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Credit Card</div>
                    <div className="text-sm text-gray-500">Online payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">10%</div>
                  <div className="text-sm text-gray-500">of payments</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white">
                <IconCreditCard className="h-4 w-4 mr-2" />
                Record New Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <IconClock className="h-4 w-4 mr-2" />
                Send Payment Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <IconCheck className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <IconX className="h-4 w-4 mr-2" />
                Cancel Payment
              </Button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
