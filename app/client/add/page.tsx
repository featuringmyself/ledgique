"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconPlus, IconX, IconBriefcase } from "@tabler/icons-react";

interface Project {
  name: string;
  description: string;
  budget: string;
  priority: string;
  startDate: string;
  endDate: string;
}

export default function AddClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    website: "",
    notes: "",
  });
  const [projectData, setProjectData] = useState<Project>({
    name: "",
    description: "",
    budget: "",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create client first
      const clientResponse = await axios.post("/api/clients/add", formData);
      const clientId = clientResponse.data.id;

      // Create projects if any
      if (projects.length > 0) {
        const projectPromises = projects.map(project =>
          axios.post("/api/projects/add", {
            ...project,
            clientId,
            status: "PENDING",
          })
        );
        await Promise.all(projectPromises);
      }

      router.push("/client");
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value,
    });
  };

  const addProject = () => {
    if (projectData.name.trim()) {
      setProjects([...projects, { ...projectData }]);
      setProjectData({
        name: "",
        description: "",
        budget: "",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
      });
      setShowProjectForm(false);
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Client</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter client name"
                required
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website URL"
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              className="border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the client"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Projects Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="flex items-center gap-2"
              >
                <IconPlus size={16} />
                Add Project
              </Button>
            </div>

            {/* Existing Projects */}
            {projects.length > 0 && (
              <div className="space-y-3 mb-4">
                {projects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <IconBriefcase size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-500">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Priority: {project.priority}</span>
                          {project.budget && <span>Budget: ${project.budget}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <IconX size={16} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Project Form */}
            {showProjectForm && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <Input
                      name="name"
                      value={projectData.name}
                      onChange={handleProjectChange}
                      placeholder="Enter project name"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={projectData.priority}
                      onChange={handleProjectChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <Input
                      name="budget"
                      type="number"
                      step="0.01"
                      value={projectData.budget}
                      onChange={handleProjectChange}
                      placeholder="Enter budget"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      name="startDate"
                      type="date"
                      value={projectData.startDate}
                      onChange={handleProjectChange}
                      className="border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={projectData.description}
                    onChange={handleProjectChange}
                    placeholder="Project description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addProject}
                    disabled={!projectData.name.trim()}
                    size="sm"
                  >
                    Add Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProjectForm(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
              disabled={loading || !formData.name}
              className="flex-1"
            >
              {loading ? "Creating..." : `Create Client${projects.length > 0 ? ` & ${projects.length} Project${projects.length > 1 ? 's' : ''}` : ''}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}