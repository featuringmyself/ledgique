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

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
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

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-gray-600">Create, send, and track your invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Invoiced</h3>
          <p className="text-2xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-600 mb-1">Paid Amount</h3>
          <p className="text-2xl font-bold text-green-900">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-sm font-medium text-yellow-600 mb-1">Pending Amount</h3>
          <p className="text-2xl font-bold text-yellow-900">₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-600 mb-1">Overdue</h3>
          <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/invoice/create">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Create Invoice
          </button>
        </Link>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg"
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
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg border">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-10 w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
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
            {filteredInvoices.map((invoice) => (
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
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}