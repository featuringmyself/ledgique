"use client";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { IconPlus, IconFilter, IconSortDescending, IconSearch, IconCalendar, IconDots } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function ClientPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  useEffect(() =>{
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
              <th className="pb-3 font-normal">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="pb-3 font-normal">Order ID</th>
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
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="py-4 text-sm text-gray-900">{clients.id}</td>
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
                    {clients.date}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing 1 to 5 of 5 results
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            &lt;
          </button>
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">3</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">4</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">5</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}