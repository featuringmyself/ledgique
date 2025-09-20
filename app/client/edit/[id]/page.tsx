"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft } from "@tabler/icons-react";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [clientSources, setClientSources] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    website: "",
    notes: "",
    clientSourceId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, sourcesRes] = await Promise.all([
          axios.get(`/api/clients/${params.id}`),
          axios.get('/api/client-sources')
        ]);
        
        const client = clientRes.data;
        setFormData({
          name: client.name || "",
          email: client.email?.[0] || "",
          phone: client.phone?.[0] || "",
          company: client.company || "",
          address: client.address || "",
          website: client.website || "",
          notes: client.notes || "",
          clientSourceId: client.clientSourceId || "",
        });
        setClientSources(sourcesRes.data);
      } catch (error) {
        console.error('Error fetching client:', error);
        alert('Failed to load client data');
        router.back();
      } finally {
        setFetching(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/clients/${params.id}`, formData);
      router.push("/client");
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Failed to update client");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded">
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Client</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <Input name="company" value={formData.company} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <Input name="website" value={formData.website} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Source</label>
              <select name="clientSourceId" value={formData.clientSourceId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select source</option>
                {clientSources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <Input name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading || !formData.name} className="flex-1">
              {loading ? "Updating..." : "Update Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}