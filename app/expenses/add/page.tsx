'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Project {
  id: string;
  name: string;
}

export default function AddExpensePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'OTHER',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    projectId: ''
  });

  const categories = [
    { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'MEALS', label: 'Meals' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'RENT', label: 'Rent' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          projectId: formData.projectId || null
        })
      });

      if (response.ok) {
        router.push('/expenses');
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Expense</h1>
        <p className="text-gray-600">Track your business expenses and receipts</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            placeholder="Expense title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project (Optional)</label>
          <select
            value={formData.projectId}
            onChange={(e) => setFormData({...formData, projectId: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">No project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Additional details about this expense"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Receipt URL</label>
          <Input
            placeholder="https://example.com/receipt.pdf"
            value={formData.receiptUrl}
            onChange={(e) => setFormData({...formData, receiptUrl: e.target.value})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit">Add Expense</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/expenses')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}