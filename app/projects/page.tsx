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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Top Actions */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects/add">
          <button className="p-2 hover:bg-gray-100 rounded">
            <IconPlus size={20} />
          </button>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects"
            className="pl-10 w-64 border-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-3 font-normal">Project</th>
              <th className="pb-3 font-normal">Client</th>
              <th className="pb-3 font-normal">Budget</th>
              <th className="pb-3 font-normal">Priority</th>
              <th className="pb-3 font-normal">Status</th>
              <th className="pb-3 font-normal">Date</th>
              <th className="pb-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {project.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      {project.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{project.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div>
                    <span className="text-sm text-gray-900">{project.client?.name || 'No Client'}</span>
                    {project.client?.company && (
                      <p className="text-xs text-gray-500">{project.client.company}</p>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  {project.budget ? (
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <IconCurrencyDollar size={16} className="text-gray-400" />
                      {new Intl.NumberFormat('en-US').format(project.budget)}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    project.priority === 'URGENT' ? 'text-red-600 bg-red-50' :
                    project.priority === 'HIGH' ? 'text-orange-600 bg-orange-50' :
                    project.priority === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50' :
                    'text-green-600 bg-green-50'
                  }`}>
                    {project.priority}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                    project.status === 'COMPLETED' ? 'text-green-600' :
                    project.status === 'IN_PROGRESS' ? 'text-blue-600' :
                    project.status === 'ON_HOLD' ? 'text-yellow-600' :
                    project.status === 'CANCELLED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'COMPLETED' ? 'bg-green-500' :
                      project.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      project.status === 'ON_HOLD' ? 'bg-yellow-500' :
                      project.status === 'CANCELLED' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}></div>
                    {project.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCalendar size={16} className="text-gray-400" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4">
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
  );
}