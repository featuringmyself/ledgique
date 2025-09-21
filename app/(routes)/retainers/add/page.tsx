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
    <div className="p-6 bg-white w-full min-h-screen">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project (Optional)
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
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