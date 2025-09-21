"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft } from "@tabler/icons-react";

interface Client {
  id: string;
  name: string;
  company: string;
}

interface Project {
  id: string;
  name: string;
}

export default function AddRetainerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    projectId: "",
    totalAmount: "",
    hourlyRate: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients/list');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(`/api/projects?clientId=${formData.clientId}`);
          setProjects(response.data);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };

      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [formData.clientId]);

  useEffect(() => {
    setFilteredClients(
      clients.filter(client => 
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(clientSearch.toLowerCase()))
      )
    );
  }, [clientSearch, clients]);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(project => 
        project.name.toLowerCase().includes(projectSearch.toLowerCase())
      )
    );
  }, [projectSearch, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/retainers", formData);
      router.push("/retainers");
    } catch (error) {
      console.error("Error creating retainer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div 
      className="p-6 bg-white w-full min-h-screen"
      onClick={() => {
        setShowClientDropdown(false);
        setShowProjectDropdown(false);
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Retainer</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retainer Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter retainer title"
                required
                className="border-gray-300"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
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
                  className="border-gray-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project (Optional)
              </label>
              <div onClick={(e) => e.stopPropagation()}>
                <Input
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setShowProjectDropdown(true);
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  placeholder="Search project..."
                  className="border-gray-300"
                />
              </div>
              {showProjectDropdown && filteredProjects.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, projectId: project.id });
                        setProjectSearch(project.name);
                        setShowProjectDropdown(false);
                      }}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount *
              </label>
              <Input
                name="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="Enter total amount"
                required
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (Optional)
              </label>
              <Input
                name="hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="Enter hourly rate"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Retainer description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.clientId || !formData.totalAmount}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Retainer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}