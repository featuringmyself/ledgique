"use client";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  address: string;
  status: string;
  updatedAt: Date;
  projects: { name: string }[];
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clients');
        setClients(response.data);
        console.log(response.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
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
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconPlus size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconFilter size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <IconSortDescending size={20} />
        </button>
        <div className="ml-auto relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 w-64 border-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">

              <th className="pb-3 font-normal">User</th>
              <th className="pb-3 font-normal">Project</th>
              <th className="pb-3 font-normal">Address</th>
              <th className="pb-3 font-normal">Date</th>
              <th className="pb-3 font-normal">Status</th>
              <th className="pb-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((clients) => (
              <tr key={clients.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {clients.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{clients.name}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-900">{clients.projects[0]?.name}</td>
                <td className="py-4 text-sm text-gray-600">{clients.address}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCalendar size={16} className="text-gray-400" />
                    {clients.updatedAt?.toISOString().split('T')[0]}
                  </div>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${clients.status === 'Complete' ? 'text-green-600' :
                    clients.status === 'In Progress' ? 'text-blue-600' :
                      clients.status === 'Approved' ? 'text-yellow-600' :
                        clients.status === 'Pending' ? 'text-blue-400' :
                          'text-gray-500'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${clients.status === 'Complete' ? 'bg-green-500' :
                      clients.status === 'In Progress' ? 'bg-blue-500' :
                        clients.status === 'Approved' ? 'bg-yellow-500' :
                          clients.status === 'Pending' ? 'bg-blue-400' :
                            'bg-gray-400'
                      }`}></div>
                    {clients.status}
                  </span>
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