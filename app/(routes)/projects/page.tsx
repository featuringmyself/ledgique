"use client";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots, IconCurrencyDollar } from "@tabler/icons-react";
import { useEffect, useState } from "react";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Projects</h1>
        <p className="text-gray-600">Manage and track your project progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Projects</h3>
          <p className="text-2xl font-bold text-blue-900">{totalProjects}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-600 mb-1">Active Projects</h3>
          <p className="text-2xl font-bold text-green-900">{activeProjects}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Completed</h3>
          <p className="text-2xl font-bold text-purple-900">{completedProjects}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h3 className="text-sm font-medium text-orange-600 mb-1">Total Budget</h3>
          <p className="text-2xl font-bold text-orange-900">₹{totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects/add">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <IconPlus size={20} />
            Add Project
          </button>
        </Link>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg"
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
          className="px-3 py-2 border border-gray-300 rounded-lg"
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
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg border">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
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
            {filteredProjects.map((project) => (
              <tr key={project.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
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
                  </div>
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
                      ₹{new Intl.NumberFormat('en-IN').format(project.budget)}
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
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <IconDots size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}