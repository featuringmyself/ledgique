"use client";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconMail, IconPhone, IconBuilding, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
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

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clients');
        // Ensure projects have id for navigation
        const clientsWithProjectIds = response.data.map((client: Client) => ({
          ...client,
          projects: client.projects.map((project, index: number) => ({
            id: (project as { id?: string; name: string }).id || `temp-${client.id}-${index}`,
            name: project.name
          }))
        }));
        setClients(clientsWithProjectIds);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

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

  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !statusFilter || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name": aVal = a.name; bVal = b.name; break;
        case "company": aVal = a.company || ""; bVal = b.company || ""; break;
        case "created": aVal = a.createdAt; bVal = b.createdAt; break;
        case "projects": aVal = a._count.projects; bVal = b._count.projects; break;
        default: aVal = a.name; bVal = b.name;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
        <p className="text-gray-600">Manage your client relationships and information</p>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/client/add">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Add Client
          </button>
        </Link>
        <div className="relative dropdown-container">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'filter' ? null : 'filter');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg border"
          >
            <IconFilter size={20} />
          </button>
          {openDropdown === 'filter' && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-12 left-0 w-48 bg-white border rounded-lg shadow-lg z-10 p-3"
            >
              <label className="block text-sm font-medium mb-2">Filter by Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
        </div>
        <div className="relative dropdown-container">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg border"
          >
            <IconSortDescending size={20} />
          </button>
          {openDropdown === 'sort' && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-12 left-0 w-48 bg-white border rounded-lg shadow-lg z-10 p-3 space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="created">Created Date</option>
                  <option value="projects">Project Count</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="w-full p-2 border rounded"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-10 w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Clients</h3>
          <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-600 mb-1">Active Clients</h3>
          <p className="text-2xl font-bold text-green-900">{clients.filter(c => c.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Total Projects</h3>
          <p className="text-2xl font-bold text-purple-900">{clients.reduce((sum, c) => sum + c._count.projects, 0)}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h3 className="text-sm font-medium text-orange-600 mb-1">Total Payments</h3>
          <p className="text-2xl font-bold text-orange-900">{clients.reduce((sum, c) => sum + c._count.payments, 0)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Projects</th>
              <th className="p-4 font-medium">Source</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClients.map((client) => (
              <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{client.name}</div>
                      {client.company && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <IconBuilding size={14} />
                          {client.company}
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
                        {client.email[0]}
                      </div>
                    )}
                    {client.phone[0] && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <IconPhone size={14} />
                        {client.phone[0]}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{client._count.projects} projects</div>
                    {client.projects[0] && (
                      <div className="text-gray-500">Latest: {client.projects[0].name}</div>
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
                <td className="p-4">
                  <div className="relative dropdown-container">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === client.id ? null : client.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <IconDots size={16} className="text-gray-400" />
                    </button>
                    {openDropdown === client.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10"
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
        
        {filteredAndSortedClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewClient && (
        <div className="fixed inset-0 backdrop-blur-sm border-2 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Client Details</h2>
              <button onClick={() => setViewClient(null)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{viewClient.name}</p>
              </div>
              {viewClient.company && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{viewClient.company}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{viewClient.email.join(', ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{viewClient.phone.join(', ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900">{viewClient.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Projects ({viewClient._count.projects})</label>
                {viewClient._count.projects === 0 ? (
                  <p className="text-gray-900">No projects</p>
                ) : (
                  <div className="space-y-2 mt-1">
                    {viewClient.projects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-gray-900 text-sm">{project.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => window.open(`/project/${project.id}`, '_blank')}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => window.open(`/project/edit/${project.id}`, '_blank')}
                            className="text-green-600 hover:bg-green-50 p-1 rounded text-xs"
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
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{new Date(viewClient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}