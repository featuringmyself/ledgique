"use client";
import { useState, useEffect } from "react";
import capitalize from "capitalize";
import axios from "axios";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCreditCard,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

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
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

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
        ] = await Promise.all([
          axios.get("/api/payments/revenue"),
          axios.get("/api/payments/pending/count"),
          axios.get("/api/payments/overdue"),
          axios.get("/api/payments/monthlyRevenue"),
          axios.get("/api/payments/list", { params: { take: 5 } }),
          axios.get("/api/payments/methods"),
        ]);

        setTotalRevenue(revenueRes.data);
        setPendingAmount(pendingRes.data.totalPendingAmount);
        setOverDueAmount(overDueRes.data);
        setMonthlyRevenue(monthlyRevenue.data);
        setRecentPayments(recentPayments.data);
        setPaymentMethods(methodsRes.data);
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
      case "COMPLETED":
        return <IconCheck className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <IconClock className="h-4 w-4 text-yellow-600" />;
      case "FAILED":
        return <IconX className="h-4 w-4 text-red-600" />;
      default:
        return <IconClock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "FAILED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <IconCreditCard className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              Total Revenue
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-gray-900">
                ₹{totalRevenue}
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
                ₹{pendingAmount}
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
                ₹{monthlyRevenue}
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
                ₹{overDueAmount}
              </p>
              <div className="flex items-center text-red-500 text-sm font-medium">
                <span>+15.3%</span>
                <IconTrendingUp size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

     

        {/* Recent Payments Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Payments
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
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
                {recentPayments.map((payment, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-4 px-2">
                      <div className="font-medium text-gray-900">
                        {payment.client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.client.email[0]}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-gray-900">
                      {payment.project.name}
                    </td>
                    <td className="py-4 px-2 font-semibold text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {capitalize.words(payment.method.replace("_", " "))}
                    </td>
                    <td className="py-4 px-2">
                      <span className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-gray-600">{new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>                    <td className="py-4 px-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
