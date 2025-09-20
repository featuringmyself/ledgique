"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { IconArrowLeft, IconCalendar, IconUser, IconBriefcase, IconCurrencyDollar, IconEdit } from "@tabler/icons-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  client: {
    id: string;
    name: string;
    company?: string;
  };
}

export default function ProjectViewPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${params.id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Project not found');
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/client');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 mx-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                console.log('Back button clicked');
                router.push('/client');
              }} 
              className="p-2 hover:bg-gray-200 rounded "
            >
              <IconArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
          </div>
          <Link href={`/project/edit/${project.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <IconEdit size={16} />
              Edit
            </button>
          </Link>
        </div>

        {/* Project Card */}
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Project Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <IconBriefcase size={24} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <IconUser size={16} className="text-gray-400" />
                  <Link href={`/client/${project.client.id}`} className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                    {project.client.name}
                  </Link>
                  {project.client.company && (
                    <span className="text-gray-500">• 
                      <Link href={`/client/${project.client.id}`} className="text-gray-500 hover:text-gray-700 hover:underline cursor-pointer">
                        {project.client.company}
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-gray-700 bg-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Priority</label>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full text-gray-700 bg-gray-100">
                  {project.priority}
                </span>
              </div>
            </div>

            {project.budget && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Budget</label>
                <div className="flex items-center gap-2">
                  <IconCurrencyDollar size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">${project.budget.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {(project.startDate || project.endDate) && (
              <div className="grid grid-cols-2 gap-6">
                {project.startDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Start Date</label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                {project.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">End Date</label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {project.description && (
              <div className="pt-6 border-t">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Description</label>
                <p className="text-gray-900 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}