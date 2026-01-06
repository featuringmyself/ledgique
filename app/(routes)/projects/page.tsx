"use client";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconCurrencyDollar, IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useCurrency } from '@/components/providers/CurrencyProvider';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  client: {
    name: string;
    company: string;
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

export default function ProjectsPage() {
  const { currency } = useCurrency();
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects?page=${pagination.currentPage}&limit=${pagination.limit}`);
        const { projects: fetchedProjects, pagination: paginationInfo } = response.data;
        setProjects(fetchedProjects);
        setPagination(paginationInfo);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [pagination.currentPage, pagination.limit]);


  const totalProjects = pagination.totalCount;
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
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
    <div className="p-4 sm:p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Projects</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and track your project progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
          <h3 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Projects</h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-900">{totalProjects}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
          <h3 className="text-xs sm:text-sm font-medium text-green-600 mb-1">Active Projects</h3>
          <p className="text-lg sm:text-2xl font-bold text-green-900">{activeProjects}</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
          <h3 className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Completed</h3>
          <p className="text-lg sm:text-2xl font-bold text-purple-900">{completedProjects}</p>
        </div>
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100">
          <h3 className="text-xs sm:text-sm font-medium text-orange-600 mb-1">Total Budget</h3>
          <p className="text-lg sm:text-2xl font-bold text-orange-900">{currency}{totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/projects/add">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              <IconPlus size={18} />
              <span className="hidden sm:inline">Add Project</span>
              <span className="sm:hidden">Add</span>
            </button>
          </Link>
          <select 
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select 
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconFilter size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg border">
            <IconSortDescending size={18} />
          </button>
        </div>
        <div className="relative w-full sm:w-auto sm:ml-auto">
          <IconSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10 w-full sm:w-64 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Budget</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/project/${project.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {project.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{project.client?.name || 'No Client'}</div>
                      {project.client?.company && (
                        <div className="text-sm text-gray-500">{project.client.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {project.budget ? (
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <IconCurrencyDollar size={16} className="text-gray-400" />
                        {currency}{new Intl.NumberFormat('en-IN').format(project.budget)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      project.priority === 'URGENT' ? 'text-red-700 bg-red-100' :
                      project.priority === 'HIGH' ? 'text-orange-700 bg-orange-100' :
                      project.priority === 'MEDIUM' ? 'text-yellow-700 bg-yellow-100' :
                      'text-green-700 bg-green-100'
                    }`}>
                      {project.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      project.status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                      project.status === 'IN_PROGRESS' ? 'text-blue-700 bg-blue-100' :
                      project.status === 'ON_HOLD' ? 'text-yellow-700 bg-yellow-100' :
                      project.status === 'CANCELLED' ? 'text-red-700 bg-red-100' :
                      'text-gray-700 bg-gray-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'COMPLETED' ? 'bg-green-500' :
                        project.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        project.status === 'ON_HOLD' ? 'bg-yellow-500' :
                        project.status === 'CANCELLED' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}></div>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar size={16} className="text-gray-400" />
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar size={16} className="text-gray-400" />
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                    </div>
                    {project.endDate && new Date(project.endDate) < new Date() && project.status !== 'COMPLETED' && (
                      <div className="text-xs text-red-600 font-medium">Overdue</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <IconDots size={16} className="text-gray-400" />
                      </button>
                      {openDropdown === project.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                          <Link href={`/project/${project.id}`}>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                              <IconEye size={14} /> View
                            </button>
                          </Link>
                          <Link href={`/project/edit/${project.id}`}>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                              <IconEdit size={14} /> Edit
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(project.id)}
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
        
        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between mb-3">
              <Link href={`/project/${project.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {project.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-500 line-clamp-2">{project.description}</div>
                  )}
                </div>
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <IconDots size={16} className="text-gray-400" />
                </button>
                {openDropdown === project.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                    <Link href={`/project/${project.id}`}>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <IconEye size={14} /> View
                      </button>
                    </Link>
                    <Link href={`/project/edit/${project.id}`}>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <IconEdit size={14} /> Edit
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)}
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
                <div className="text-gray-500 mb-1">Client</div>
                <div className="font-medium text-gray-900">{project.client?.name || 'No Client'}</div>
                {project.client?.company && (
                  <div className="text-xs text-gray-500">{project.client.company}</div>
                )}
              </div>
              <div>
                <div className="text-gray-500 mb-1">Budget</div>
                {project.budget ? (
                  <div className="flex items-center gap-1 font-medium text-gray-900">
                    <IconCurrencyDollar size={14} className="text-gray-400" />
                    {currency}{new Intl.NumberFormat('en-IN').format(project.budget)}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
              <div>
                <div className="text-gray-500 mb-1">Priority</div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  project.priority === 'URGENT' ? 'text-red-700 bg-red-100' :
                  project.priority === 'HIGH' ? 'text-orange-700 bg-orange-100' :
                  project.priority === 'MEDIUM' ? 'text-yellow-700 bg-yellow-100' :
                  'text-green-700 bg-green-100'
                }`}>
                  {project.priority}
                </span>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Status</div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  project.status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                  project.status === 'IN_PROGRESS' ? 'text-blue-700 bg-blue-100' :
                  project.status === 'ON_HOLD' ? 'text-yellow-700 bg-yellow-100' :
                  project.status === 'CANCELLED' ? 'text-red-700 bg-red-100' :
                  'text-gray-700 bg-gray-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    project.status === 'COMPLETED' ? 'bg-green-500' :
                    project.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                    project.status === 'ON_HOLD' ? 'bg-yellow-500' :
                    project.status === 'CANCELLED' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Start Date</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <IconCalendar size={14} className="text-gray-400" />
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Due Date</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <IconCalendar size={14} className="text-gray-400" />
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                </div>
                {project.endDate && new Date(project.endDate) < new Date() && project.status !== 'COMPLETED' && (
                  <div className="text-xs text-red-600 font-medium">Overdue</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 sm:mt-6">
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
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} projects
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
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
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}