"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconFileInvoice, IconEye, IconDownload, IconSend, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  client: { name: string; company?: string };
  project?: { name: string };
  items: { description: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchInvoices();
  }, [pagination.currentPage, pagination.limit]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/invoices?page=${pagination.currentPage}&limit=${pagination.limit}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (invoiceId: string, amount: number) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAID',
          paymentData: {
            amount,
            method: 'BANK_TRANSFER',
            date: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        fetchInvoices(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-700 bg-green-100';
      case 'SENT': return 'text-blue-700 bg-blue-100';
      case 'DRAFT': return 'text-gray-700 bg-gray-100';
      case 'OVERDUE': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length;

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-sm sm:text-base text-gray-600">Create, send, and track your invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
          <h3 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Invoiced</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
          <h3 className="text-xs sm:text-sm font-medium text-green-600 mb-1">Paid Amount</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
          <h3 className="text-xs sm:text-sm font-medium text-yellow-600 mb-1">Pending Amount</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-900">₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-100">
          <h3 className="text-xs sm:text-sm font-medium text-red-600 mb-1">Overdue</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-900">{overdueCount}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/invoice/create">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              <IconPlus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden">Create</span>
            </button>
          </Link>
          <select 
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconFilter size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconSortDescending size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-10 w-full sm:w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Issue Date</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <IconFileInvoice size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{invoice.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.client.name}</div>
                      {invoice.client.company && (
                        <div className="text-sm text-gray-500">{invoice.client.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900">
                    {invoice.project?.name || '-'}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      ₹{invoice.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar size={16} className="text-gray-400" />
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar size={16} className="text-gray-400" />
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                    {new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' && (
                      <div className="text-xs text-red-600 font-medium">Overdue</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View">
                        <IconEye size={16} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                        <IconDownload size={16} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Send">
                        <IconSend size={16} className="text-gray-400" />
                      </button>
                      {invoice.status !== 'PAID' && (
                        <button 
                          className="p-1 hover:bg-green-100 rounded text-green-600" 
                          title="Mark as Paid"
                          onClick={() => markAsPaid(invoice.id, invoice.totalAmount)}
                        >
                          <IconCheck size={16} />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <IconDots size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="border-b border-gray-100 p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <IconFileInvoice size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{invoice.title}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <div className="text-gray-500">Client</div>
                  <div className="font-medium text-gray-900">{invoice.client.name}</div>
                  {invoice.client.company && (
                    <div className="text-xs text-gray-500">{invoice.client.company}</div>
                  )}
                </div>
                <div>
                  <div className="text-gray-500">Amount</div>
                  <div className="font-medium text-gray-900">₹{invoice.totalAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Project</div>
                  <div className="font-medium text-gray-900">{invoice.project?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Due Date</div>
                  <div className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                  {new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' && (
                    <div className="text-xs text-red-600 font-medium">Overdue</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconCalendar size={16} className="text-gray-400" />
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded" title="View">
                    <IconEye size={16} className="text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                    <IconDownload size={16} className="text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded" title="Send">
                    <IconSend size={16} className="text-gray-400" />
                  </button>
                  {invoice.status !== 'PAID' && (
                    <button 
                      className="p-1 hover:bg-green-100 rounded text-green-600" 
                      title="Mark as Paid"
                      onClick={() => markAsPaid(invoice.id, invoice.totalAmount)}
                    >
                      <IconCheck size={16} />
                    </button>
                  )}
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} invoices
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-2 sm:px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
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
                  className={`px-2 sm:px-3 py-1 text-sm border rounded ${
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
            className="px-2 sm:px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}