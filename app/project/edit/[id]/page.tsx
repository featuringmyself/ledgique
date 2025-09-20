"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft } from "@tabler/icons-react";

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    budget: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${params.id}`);
        const project = response.data;
        setFormData({
          name: project.name || "",
          description: project.description || "",
          status: project.status || "PENDING",
          priority: project.priority || "MEDIUM",
          budget: project.budget?.toString() || "",
          startDate: project.startDate ? project.startDate.split('T')[0] : "",
          endDate: project.endDate ? project.endDate.split('T')[0] : "",
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Project not found');
        router.back();
      } finally {
        setFetching(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/projects/${params.id}`, formData);
      router.back();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
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

  if (fetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded">
              <IconArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
          </div>
          <p className="text-gray-600">Update project information and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <Input name="name" value={formData.name} onChange={handleChange} required className="border-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <Input name="budget" type="number" step="0.01" value={formData.budget} onChange={handleChange} placeholder="Enter budget" className="border-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={4} 
              placeholder="Project description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="border-gray-300" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading || !formData.name} className="flex-1">
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}