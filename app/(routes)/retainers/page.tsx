"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconWallet, IconClock, IconCheck, IconX } from '@tabler/icons-react';
import Link from 'next/link';

interface Retainer {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  hourlyRate?: number;
  status: string;
  startDate: string;
  endDate?: string;
  client: { name: string; company?: string };
  project?: { name: string };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function RetainersPage() {
  const [retainers, setRetainers] = useState<Retainer[]>([]);
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
    fetchRetainers();
  }, [pagination.currentPage, pagination.limit]);

  const fetchRetainers = async () => {
    try {
      const response = await fetch(`/api/retainers?page=${pagination.currentPage}&limit=${pagination.limit}`);
      if (response.ok) {
        const data = await response.json();
        setRetainers(data.retainers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch retainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-700 bg-green-100';
      case 'DEPLETED': return 'text-red-700 bg-red-100';
      case 'EXPIRED': return 'text-gray-700 bg-gray-100';
      case 'CANCELLED': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <IconCheck size={16} />;
      case 'DEPLETED': return <IconX size={16} />;
      case 'EXPIRED': return <IconClock size={16} />;
      case 'CANCELLED': return <IconX size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  const totalRetainerValue = retainers.reduce((sum, ret) => sum + ret.totalAmount, 0);
  const activeCount = retainers.filter(ret => ret.status === 'ACTIVE').length;

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Retainers</h1>
        <p className="text-gray-600">Manage client retainers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Value</h3>
          <p className="text-2xl font-bold text-blue-900">₹{totalRetainerValue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Active Retainers</h3>
          <p className="text-2xl font-bold text-purple-900">{activeCount}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/retainers/add">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Add Retainer
          </button>
        </Link>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DEPLETED">Depleted</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
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
            placeholder="Search retainers..."
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
              <th className="p-4 font-medium">Retainer</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Project</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Start Date</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {retainers.map((retainer) => (
              <tr key={retainer.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                      <IconWallet size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{retainer.title}</div>
                      {retainer.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{retainer.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900">{retainer.client.name}</div>
                    {retainer.client.company && (
                      <div className="text-sm text-gray-500">{retainer.client.company}</div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  {retainer.project?.name || '-'}
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">
                    ₹{retainer.totalAmount.toLocaleString()}
                  </div>
                  {retainer.hourlyRate && (
                    <div className="text-sm text-gray-500">
                      ₹{retainer.hourlyRate}/hr
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(retainer.status)}`}>
                    {getStatusIcon(retainer.status)}
                    {retainer.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <IconCalendar size={16} className="text-gray-400" />
                    {new Date(retainer.startDate).toLocaleDateString()}
                  </div>
                  {retainer.endDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Ends: {new Date(retainer.endDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {retainers.length === 0 && (
          <div className="text-center py-12">
            <IconWallet size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No retainers found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first retainer</p>
            <Link href="/retainers/add">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add Retainer
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 pr-20">
        <div className="flex items-center gap-4">
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
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} retainers
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
  );
}