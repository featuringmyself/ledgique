"use client";
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconWallet, IconClock, IconCheck, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

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
  const { currency } = useCurrency();
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

  const fetchRetainers = useCallback(async () => {
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
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchRetainers();
  }, [fetchRetainers]);

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
    <div className="p-4 sm:p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Retainers</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage client retainers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
          <h3 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Value</h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-900">{currency}{totalRetainerValue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
          <h3 className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Active Retainers</h3>
          <p className="text-lg sm:text-2xl font-bold text-purple-900">{activeCount}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/retainers/add">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              <IconPlus size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Retainer</span>
              <span className="sm:hidden">Add</span>
            </button>
          </Link>
          <select 
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEPLETED">Depleted</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconFilter size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconSortDescending size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="relative flex-1 sm:ml-auto sm:max-w-xs">
          <IconSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search retainers..."
            className="pl-10 w-full border-gray-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="bg-white rounded-lg border">
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
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
                      {currency}{retainer.totalAmount.toLocaleString()}
                    </div>
                    {retainer.hourlyRate && (
                      <div className="text-sm text-gray-500">
                        {currency}{retainer.hourlyRate}/hr
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
          </div>
        </div>

        {/* Tablet Table View */}
        <div className="hidden md:block lg:hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-3 font-medium">Retainer</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Start Date</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {retainers.map((retainer) => (
                  <tr key={retainer.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                          <IconWallet size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{retainer.title}</div>
                          {retainer.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">{retainer.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{retainer.client.name}</div>
                        {retainer.client.company && (
                          <div className="text-xs text-gray-500">{retainer.client.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900 text-sm">
                        {currency}{retainer.totalAmount.toLocaleString()}
                      </div>
                      {retainer.hourlyRate && (
                        <div className="text-xs text-gray-500">
                          {currency}{retainer.hourlyRate}/hr
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(retainer.status)}`}>
                        {getStatusIcon(retainer.status)}
                        {retainer.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <IconCalendar size={14} className="text-gray-400" />
                        {new Date(retainer.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <IconDots size={14} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {retainers.map((retainer) => (
            <div key={retainer.id} className="border-b border-gray-100 p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <IconWallet size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{retainer.title}</div>
                    {retainer.description && (
                      <div className="text-sm text-gray-500 mt-1">{retainer.description}</div>
                    )}
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <IconDots size={16} className="text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">Client</div>
                  <div className="font-medium text-gray-900">{retainer.client.name}</div>
                  {retainer.client.company && (
                    <div className="text-gray-500">{retainer.client.company}</div>
                  )}
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">Amount</div>
                  <div className="font-medium text-gray-900">{currency}{retainer.totalAmount.toLocaleString()}</div>
                  {retainer.hourlyRate && (
                    <div className="text-gray-500">{currency}{retainer.hourlyRate}/hr</div>
                  )}
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">Project</div>
                  <div className="text-gray-900">{retainer.project?.name || '-'}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">Status</div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(retainer.status)}`}>
                    {getStatusIcon(retainer.status)}
                    {retainer.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-900">
                  <IconCalendar size={16} className="text-gray-400" />
                  <span className="text-gray-500 text-xs font-medium mr-2">Start:</span>
                  {new Date(retainer.startDate).toLocaleDateString()}
                </div>
                {retainer.endDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <IconCalendar size={16} className="text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium mr-2">Ends:</span>
                    {new Date(retainer.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
        
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}