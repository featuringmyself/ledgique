"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { IconArrowLeft, IconEdit, IconMail, IconPhone, IconBuilding, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string[];
  phone: string[];
  company?: string;
  address?: string;
  website?: string;
  notes?: string;
  clientSource: { name: string } | null;
  status: string;
  createdAt: string;
  projects: { id: string; name: string }[];
  _count: {
    projects: number;
    payments: number;
  };
}

export default function ClientViewPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/api/clients/${params.id}`);
        setClient(response.data);
      } catch (error) {
        console.error('Error fetching client:', error);
        alert('Client not found');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchClient();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="flex min-h-screen mx-auto items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded">
              <IconArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Client Details</h1>
          </div>
          <Link href={`/client/edit/${client.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <IconEdit size={16} />
              Edit
            </button>
          </Link>
        </div>

        {/* Client Card */}
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Client Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                {client.company && (
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <IconBuilding size={16} />
                    {client.company}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Email</label>
                <div className="flex items-center gap-2">
                  <IconMail size={16} className="text-gray-400" />
                  <span className="text-gray-900">{client.email.join(', ') || 'No email'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Phone</label>
                <div className="flex items-center gap-2">
                  <IconPhone size={16} className="text-gray-400" />
                  <span className="text-gray-900">{client.phone.join(', ') || 'No phone'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-gray-700 bg-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                  {client.status}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Source</label>
                <span className="text-gray-900">{client.clientSource?.name || 'Direct'}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Created</label>
              <div className="flex items-center gap-2">
                <IconCalendar size={16} className="text-gray-400" />
                <span className="text-gray-900">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {client.address && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Address</label>
                <p className="text-gray-900">{client.address}</p>
              </div>
            )}

            {client.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Notes</label>
                <p className="text-gray-900 leading-relaxed">{client.notes}</p>
              </div>
            )}

            {client._count.projects > 0 && (
              <div className="pt-6 border-t">
                <label className="text-sm font-medium text-gray-500 mb-3 block">Projects ({client._count.projects})</label>
                <div className="space-y-2">
                  {client.projects.map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-900">{project.name}</span>
                        <span className="text-gray-500 text-sm">View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}