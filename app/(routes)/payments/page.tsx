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
  IconX,
  IconEye,
  IconEdit,
  IconTrash,
  IconDownload,
  IconMail,
  IconCopy
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  const [revenueChange, setRevenueChange] = useState("+0.0%");
  const [monthlyChange, setMonthlyChange] = useState("+0.0%");
  const [pendingChange, setPendingChange] = useState("+0.0%");
  const [overdueChange, setOverdueChange] = useState("+0.0%");
  const [, setRecentPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: 0,
    status: '',
    method: '',
    date: '',
    notes: ''
  });

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
          allPaymentsRes,
          revenueChangeRes,
          monthlyChangeRes,
          pendingChangeRes,
          overdueChangeRes
        ] = await Promise.all([
          axios.get("/api/payments/revenue"),
          axios.get("/api/payments/pending/count"),
          axios.get("/api/payments/overdue"),
          axios.get("/api/payments/monthlyRevenue"),
          axios.get("/api/payments/list", { params: { take: 5 } }),
          axios.get("/api/payments/methods"),
          axios.get(`/api/payments?page=${pagination.currentPage}&limit=${pagination.limit}`),
          axios.get("/api/payments/revenue/change"),
          axios.get("/api/payments/monthlyRevenue/change"),
          axios.get("/api/payments/pending/change"),
          axios.get("/api/payments/overdue/change")
        ]);

        setTotalRevenue(revenueRes.data);
        setPendingAmount(pendingRes.data.totalPendingAmount);
        setOverDueAmount(overDueRes.data);
        setMonthlyRevenue(monthlyRevenue.data);
        setRecentPayments(recentPayments.data);
        setPaymentMethods(methodsRes.data);
        setAllPayments(allPaymentsRes.data.payments);
        setPagination(allPaymentsRes.data.pagination);
        setRevenueChange(revenueChangeRes.data);
        setMonthlyChange(monthlyChangeRes.data);
        setPendingChange(pendingChangeRes.data);
        setOverdueChange(overdueChangeRes.data);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.limit]);





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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
    setActiveDropdown(null);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditForm({
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      date: new Date(payment.date).toISOString().split('T')[0],
      notes: ''
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/payments/${selectedPayment.id}`);
      setAllPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      setShowDeleteModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await axios.patch(`/api/payments/${paymentId}`, { status: newStatus });
      setAllPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    
    setIsUpdating(true);
    try {
      await axios.patch(`/api/payments/${selectedPayment.id}`, editForm);
      setAllPayments(prev => prev.map(p => 
        p.id === selectedPayment.id ? { 
          ...p, 
          amount: editForm.amount,
          status: editForm.status,
          method: editForm.method,
          date: editForm.date
        } : p
      ));
      closeModals();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      const response = await axios.get(`/api/payments/${payment.id}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${payment.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
    setActiveDropdown(null);
  };

  const handleSendEmail = async (payment: Payment) => {
    try {
      await axios.post(`/api/payments/${payment.id}/send-email`);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
    setActiveDropdown(null);
  };

  const handleCopyPaymentId = (paymentId: string) => {
    navigator.clipboard.writeText(paymentId);
    alert('Payment ID copied to clipboard!');
    setActiveDropdown(null);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedPayment(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Payments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage all payment transactions
            </p>
          </div>
          <Link href="/payments/add">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto">
              <IconCreditCard className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-3xl border border-blue-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              Total Revenue
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(totalRevenue))}
              </p>
              <div className={`flex items-center text-sm font-medium ${
                revenueChange.startsWith('+') ? 'text-green-600' : 'text-red-500'
              }`}>
                <span>{revenueChange}</span>
                {revenueChange.startsWith('+') ? 
                  <IconTrendingUp size={16} className="ml-1" /> : 
                  <IconTrendingDown size={16} className="ml-1" />
                }
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-3xl border border-purple-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              Pending Payments
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(pendingAmount))}
              </p>
              <div className={`flex items-center text-sm font-medium ${
                pendingChange.startsWith('+') ? 'text-red-500' : 'text-green-600'
              }`}>
                <span>{pendingChange}</span>
                {pendingChange.startsWith('+') ? 
                  <IconTrendingUp size={16} className="ml-1" /> : 
                  <IconTrendingDown size={16} className="ml-1" />
                }
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-3xl border border-green-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">
              This Month
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(monthlyRevenue))}
              </p>
              <div className={`flex items-center text-sm font-medium ${
                monthlyChange.startsWith('+') ? 'text-green-600' : 'text-red-500'
              }`}>
                <span>{monthlyChange}</span>
                {monthlyChange.startsWith('+') ? 
                  <IconTrendingUp size={16} className="ml-1" /> : 
                  <IconTrendingDown size={16} className="ml-1" />
                }
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-6 rounded-3xl border border-orange-100/50">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Overdue</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ₹{fmt.format(Number(overDueAmount))}
              </p>
              <div className={`flex items-center text-sm font-medium ${
                overdueChange.startsWith('+') ? 'text-red-500' : 'text-green-600'
              }`}>
                <span>{overdueChange}</span>
                {overdueChange.startsWith('+') ? 
                  <IconTrendingUp size={16} className="ml-1" /> : 
                  <IconTrendingDown size={16} className="ml-1" />
                }
              </div>
            </div>
          </div>
        </div>

     

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg border">
                <IconFilter size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg border">
                <IconSortDescending size={20} />
              </button>
            </div>
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search payments..."
              className="pl-10 w-full border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* All Payments Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              All Payments ({pagination.totalCount})
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Export
              </Button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                {allPayments.map((payment) => (
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
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === payment.id ? null : payment.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <IconDots size={16} className="text-gray-400" />
                        </button>
                        {activeDropdown === payment.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                            <button 
                              onClick={() => handleViewPayment(payment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconEye size={16} className="text-gray-500" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleEditPayment(payment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconEdit size={16} className="text-gray-500" />
                              Edit Payment
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                              onClick={() => handleDownloadReceipt(payment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconDownload size={16} className="text-gray-500" />
                              Download Receipt
                            </button>
                            <button 
                              onClick={() => handleSendEmail(payment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconMail size={16} className="text-gray-500" />
                              Send Email
                            </button>
                            <button 
                              onClick={() => handleCopyPaymentId(payment.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconCopy size={16} className="text-gray-500" />
                              Copy Payment ID
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            {payment.status === 'PENDING' && (
                              <button 
                                onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                                disabled={isUpdating}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                              >
                                <IconCheck size={16} />
                                Mark as Completed
                              </button>
                            )}
                            {payment.status === 'COMPLETED' && (
                              <button 
                                onClick={() => handleStatusUpdate(payment.id, 'PENDING')}
                                disabled={isUpdating}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-yellow-600"
                              >
                                <IconClock size={16} />
                                Mark as Pending
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeletePayment(payment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <IconTrash size={16} />
                              Delete Payment
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {allPayments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
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
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === payment.id ? null : payment.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <IconDots size={16} className="text-gray-400" />
                    </button>
                    {activeDropdown === payment.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                        <button 
                          onClick={() => handleViewPayment(payment)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <IconEye size={16} className="text-gray-500" />
                          View Details
                        </button>
                        <button 
                          onClick={() => handleEditPayment(payment)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <IconEdit size={16} className="text-gray-500" />
                          Edit Payment
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={() => handleDownloadReceipt(payment)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <IconDownload size={16} className="text-gray-500" />
                          Download Receipt
                        </button>
                        <button 
                          onClick={() => handleSendEmail(payment)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <IconMail size={16} className="text-gray-500" />
                          Send Email
                        </button>
                        <button 
                          onClick={() => handleCopyPaymentId(payment.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <IconCopy size={16} className="text-gray-500" />
                          Copy Payment ID
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        {payment.status === 'PENDING' && (
                          <button 
                            onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                            disabled={isUpdating}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                          >
                            <IconCheck size={16} />
                            Mark as Completed
                          </button>
                        )}
                        {payment.status === 'COMPLETED' && (
                          <button 
                            onClick={() => handleStatusUpdate(payment.id, 'PENDING')}
                            disabled={isUpdating}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-yellow-600"
                          >
                            <IconClock size={16} />
                            Mark as Pending
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeletePayment(payment)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                        >
                          <IconTrash size={16} />
                          Delete Payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Project</span>
                    <span className="text-sm font-medium text-gray-900">{payment.project.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-lg font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Method</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getMethodIcon(payment.method)}
                      {capitalize.words(payment.method.replace("_", " "))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      payment.status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                      payment.status === 'PENDING' ? 'text-yellow-700 bg-yellow-100' :
                      payment.status === 'FAILED' ? 'text-red-700 bg-red-100' :
                      'text-gray-700 bg-gray-100'
                    }`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Date</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar size={16} className="text-gray-400" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          {allPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No payments found</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} payments
            </div>
          </div>
          
          <div className="flex items-center justify-center sm:justify-end gap-2">
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

           {/* Payment Stats */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Payment Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">{capitalize.words(method.method.replace("_", " "))}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{method.percentage}%</p>
                <p className="text-xs text-gray-500">{method.count} payments</p>
              </div>
            ))}
          </div>
        </div>

      {/* View Payment Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Details</h2>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <IconX size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment ID</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded break-all">{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <p className="text-gray-900">{selectedPayment.client.name}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.client.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <p className="text-gray-900">{selectedPayment.project.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    selectedPayment.status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                    selectedPayment.status === 'PENDING' ? 'text-yellow-700 bg-yellow-100' :
                    selectedPayment.status === 'FAILED' ? 'text-red-700 bg-red-100' :
                    'text-gray-700 bg-gray-100'
                  }`}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span>{capitalize.words(selectedPayment.method.replace("_", " "))}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <p className="text-gray-900">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button 
                onClick={() => handleDownloadReceipt(selectedPayment)}
                variant="outline" 
                className="flex-1"
              >
                <IconDownload size={16} className="mr-2" />
                Download Receipt
              </Button>
              <Button 
                onClick={() => handleSendEmail(selectedPayment)}
                variant="outline" 
                className="flex-1"
              >
                <IconMail size={16} className="mr-2" />
                Send Email
              </Button>
              <Button 
                onClick={() => {
                  closeModals();
                  handleEditPayment(selectedPayment);
                }}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                <IconEdit size={16} className="mr-2" />
                Edit Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && selectedPayment && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Payment</h2>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <IconX size={20} />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <Input 
                    type="number" 
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select 
                    value={editForm.method}
                    onChange={(e) => setEditForm(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input 
                    type="date" 
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about this payment..."
                />
              </div>
            </form>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button 
                onClick={closeModals}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePayment}
                disabled={isUpdating}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                {isUpdating ? 'Updating...' : 'Update Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPayment && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delete Payment</h2>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <IconX size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconTrash size={24} className="text-red-600" />
              </div>
              <p className="text-gray-600 text-center">
                Are you sure you want to delete this payment? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Payment ID:</strong> <span className="break-all">{selectedPayment.id}</span>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Client:</strong> {selectedPayment.client.name}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={closeModals}
                variant="outline" 
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
