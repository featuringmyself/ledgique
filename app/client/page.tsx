"use client";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IconPlus, IconSearch, IconCalendar, IconDots, IconMail, IconPhone, IconBuilding, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Project {
  id?: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email: string[];
  phone: string[];
  company?: string;
  address?: string;
  clientSource: { name: string } | null;
  status: string;
  createdAt: string;
  projects: Project[];
  _count: {
    projects: number;
    payments: number;
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

interface DropdownPosition {
  top: number;
  left: number;
}

// Extend Window interface to include dropdownPosition
declare global {
  interface Window {
    dropdownPosition?: DropdownPosition;
  }
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/clients?page=${pagination.currentPage}&limit=${pagination.limit}`);
        const { clients: fetchedClients, pagination: paginationInfo } = response.data;
        
        // Ensure projects have id for navigation
        const clientsWithProjectIds = fetchedClients.map((client: Client) => ({
          ...client,
          projects: client.projects.map((project, index: number) => ({
            id: (project as { id?: string; name: string }).id || `temp-${client.id}-${index}`,
            name: project.name
          }))
        }));
        
        setClients(clientsWithProjectIds);
        setPagination(paginationInfo);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await axios.delete(`/api/clients/${clientId}`);
      setClients(clients.filter(c => c.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
    setOpenDropdown(null);
  };

  const handleView = (client: Client) => {
    setViewClient(client);
    setOpenDropdown(null);
  };

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
    <div className="w-full min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Clients</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage your client relationships and information</p>
        </div>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Link href="/client/add" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Add Client
          </button>
        </Link>
        <div className="relative w-full sm:w-auto sm:ml-auto">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-10 w-full sm:w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Clients</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{pagination.totalCount}</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
            <h3 className="text-xs sm:text-sm font-medium text-green-600 mb-1">Active Clients</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{clients.filter(c => c.status === 'ACTIVE').length}</p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
            <h3 className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Total Projects</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">{clients.reduce((sum, c) => sum + c._count.projects, 0)}</p>
          </div>
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100">
            <h3 className="text-xs sm:text-sm font-medium text-orange-600 mb-1">Total Payments</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900">{clients.reduce((sum, c) => sum + c._count.payments, 0)}</p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Projects</th>
                  <th className="p-4 font-medium">Source</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-2 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{client.name}</div>
                          {client.company && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <IconBuilding size={14} />
                              <span className="truncate">{client.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {client.email[0] && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <IconMail size={14} />
                            <span className="truncate">{client.email[0]}</span>
                          </div>
                        )}
                        {client.phone[0] && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <IconPhone size={14} />
                            <span className="truncate">{client.phone[0]}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{client._count.projects} projects</div>
                        {client.projects[0] && (
                          <div className="text-gray-500 text-sm truncate">Latest: {client.projects[0].name}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {client.clientSource?.name || 'Direct'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        client.status === 'ACTIVE' ? 'text-green-700 bg-green-100' :
                        client.status === 'INACTIVE' ? 'text-gray-700 bg-gray-100' :
                        'text-red-700 bg-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          client.status === 'ACTIVE' ? 'bg-green-500' :
                          client.status === 'INACTIVE' ? 'bg-gray-500' :
                          'bg-red-500'
                        }`}></div>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IconCalendar size={16} className="text-gray-400" />
                        {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="relative dropdown-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setOpenDropdown(openDropdown === client.id ? null : client.id);
                            if (openDropdown !== client.id) {
                              window.dropdownPosition = {
                                top: rect.bottom + 4,
                                left: rect.right - 128
                              };
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          data-client-id={client.id}
                        >
                          <IconDots size={16} className="text-gray-400" />
                        </button>
                        {openDropdown === client.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="fixed bg-white border rounded-lg shadow-xl z-50 w-32"
                            style={{
                              top: `${window.dropdownPosition?.top || 0}px`,
                              left: `${window.dropdownPosition?.left || 0}px`
                            }}
                          >
                            <button 
                              onClick={() => handleView(client)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <IconEye size={14} /> View
                            </button>
                            <Link href={`/client/edit/${client.id}`}>
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <IconEdit size={14} /> Edit
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(client.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <IconTrash size={14} /> Delete
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
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    {client.company && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <IconBuilding size={14} />
                        <span className="truncate">{client.company}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative dropdown-container">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === client.id ? null : client.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    data-client-id={client.id}
                  >
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                  {openDropdown === client.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 bg-white border rounded-lg shadow-xl z-50 w-32"
                    >
                      <button 
                        onClick={() => handleView(client)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <IconEye size={14} /> View
                      </button>
                      <Link href={`/client/edit/${client.id}`}>
                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                          <IconEdit size={14} /> Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <IconTrash size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Contact</div>
                  <div className="space-y-1">
                    {client.email[0] && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <IconMail size={12} />
                        <span className="truncate">{client.email[0]}</span>
                      </div>
                    )}
                    {client.phone[0] && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <IconPhone size={12} />
                        <span className="truncate">{client.phone[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Projects</div>
                  <div className="font-medium text-gray-900">{client._count.projects} projects</div>
                  {client.projects[0] && (
                    <div className="text-gray-500 text-xs truncate">Latest: {client.projects[0].name}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  client.status === 'ACTIVE' ? 'text-green-700 bg-green-100' :
                  client.status === 'INACTIVE' ? 'text-gray-700 bg-gray-100' :
                  'text-red-700 bg-red-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    client.status === 'ACTIVE' ? 'bg-green-500' :
                    client.status === 'INACTIVE' ? 'bg-gray-500' :
                    'bg-red-500'
                  }`}></div>
                  {client.status}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <IconCalendar size={12} />
                  {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {clients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found</p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select 
                value={pagination.limit} 
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} clients
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

        {/* View Modal */}
        {viewClient && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Client Details</h2>
                <button 
                  onClick={() => setViewClient(null)} 
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                  <p className="text-base text-gray-900">{viewClient.name}</p>
                </div>
                {viewClient.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Company</label>
                    <p className="text-base text-gray-900">{viewClient.company}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                  <p className="text-base text-gray-900 break-all">{viewClient.email.join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Phone</label>
                  <p className="text-base text-gray-900">{viewClient.phone.join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                  <p className="text-base text-gray-900">{viewClient.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Projects ({viewClient._count.projects})</label>
                  {viewClient._count.projects === 0 ? (
                    <p className="text-base text-gray-900">No projects</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {viewClient.projects.map((project, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded gap-2">
                          <span className="text-gray-900 text-sm font-medium">{project.name}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => window.open(`/project/${project.id}`, '_blank')}
                              className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => window.open(`/project/edit/${project.id}`, '_blank')}
                              className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Created</label>
                  <p className="text-base text-gray-900">{new Date(viewClient.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}