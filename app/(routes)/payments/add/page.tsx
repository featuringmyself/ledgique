"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  company: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  client: {
    name: string;
    company: string;
  };
}

export default function AddPaymentPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "FULL_PAYMENT",
    method: "BANK_TRANSFER",
    status: "COMPLETED",
    date: new Date().toISOString().split('T')[0],
    clientId: "",
    projectId: "",
  });

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [formData.clientId]);

  useEffect(() => {
    if (!projects || !Array.isArray(projects)) return;
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (!clients || !Array.isArray(clients)) return;
    
    setFilteredClients(
      clients.filter(client => 
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(clientSearch.toLowerCase()))
      )
    );
  }, [clientSearch, clients]);

  useEffect(() => {
    if (!projects || !Array.isArray(projects)) return;
    
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projectSearch, projects]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients/autocomplete');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const url = formData.clientId 
        ? `/api/projects/autocomplete?clientId=${formData.clientId}`
        : '/api/projects/autocomplete';
      const response = await axios.get(url);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/payments', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      router.push('/payments');
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="p-3 sm:p-6 bg-white w-full min-h-screen flex flex-col items-center justify-center"
      onClick={() => {
        setShowClientDropdown(false);
        setShowProjectDropdown(false);
      }}
    >
      <div className="flex items-center gap-4 mb-4 sm:mb-6 w-full max-w-4xl">
        <Link href="/payments">
          <button className="p-2 hover:bg-gray-100 rounded">
            <IconArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Log Payment</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Record a new payment transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-4xl px-4 sm:px-0">
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <div className="relative">
                <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Input
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Search client..."
                  required={!formData.clientId}
                />
              </div>
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, clientId: client.id, projectId: "" });
                        setClientSearch(`${client.name}${client.company ? ` (${client.company})` : ''}`);
                        setShowClientDropdown(false);
                        setProjectSearch("");
                      }}
                    >
                      {client.name} {client.company && `(${client.company})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Input
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setShowProjectDropdown(true);
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  placeholder="Search project..."
                  required={!formData.projectId}
                />
              </div>
              {showProjectDropdown && filteredProjects.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        const selectedProject = projects.find(p => p.id === project.id);
                        setFormData({ 
                          ...formData, 
                          projectId: project.id,
                          clientId: selectedProject ? selectedProject.clientId : formData.clientId
                        });
                        setProjectSearch(project.name);
                        setShowProjectDropdown(false);
                        if (selectedProject) {
                          setClientSearch(`${selectedProject.client.name}${selectedProject.client.company ? ` (${selectedProject.client.company})` : ''}`);
                        }
                      }}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FULL_PAYMENT">Full Payment</option>
                <option value="PARTIAL">Partial Payment</option>
                <option value="ADVANCE">Advance</option>
                <option value="MILESTONE">Milestone</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Payment description"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Payment'}
          </button>
          <Link href="/payments" className="w-full sm:w-auto">
            <button type="button" className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}