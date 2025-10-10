"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash,
  IconDots,
  IconCalendar,
  IconUser,
  IconBriefcase,
  IconTag,
  IconNotes,
  IconCheck,
  IconAlertCircle,
  IconStar,
  IconClock
} from "@tabler/icons-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  tags: string[];
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    company?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export default function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { id } = await params;
        const response = await axios.get(`/api/notes/${id}`);
        setNote(response.data);
      } catch (error) {
        console.error('Error fetching note:', error);
        router.push('/notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [params, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`/api/notes/${note?.id}`);
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!note) return;
    
    try {
      await axios.put(`/api/notes/${note.id}`, { status: newStatus });
      setNote(prev => prev ? {
        ...prev,
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null
      } : null);
    } catch (error) {
      console.error('Error updating note status:', error);
      alert('Failed to update note status');
    }
    setOpenDropdown(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'ARCHIVED': return 'text-gray-600 bg-gray-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TODO': return <IconCheck className="h-5 w-5" />;
      case 'DELIVERABLE': return <IconBriefcase className="h-5 w-5" />;
      case 'MEETING_NOTES': return <IconNotes className="h-5 w-5" />;
      case 'CLIENT_COMMUNICATION': return <IconUser className="h-5 w-5" />;
      case 'PROJECT_NOTES': return <IconBriefcase className="h-5 w-5" />;
      default: return <IconNotes className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Note not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/notes"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/notes"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created {formatDate(note.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/notes/edit/${note.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <IconEdit className="h-5 w-5" />
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <IconDots className="h-5 w-5" />
            </button>
            
            {openDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  {note.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {note.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange('ACTIVE')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Mark as Active
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange('ARCHIVED')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Archive
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Meta Information */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {getTypeIcon(note.type)}
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {note.type.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(note.priority)}`}>
              {note.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(note.status)}`}>
              {note.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {note.dueDate && (
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                  <span className={isOverdue(note.dueDate, note.status) ? 'text-red-600 font-medium' : 'text-gray-900 dark:text-white'}>
                    {formatDate(note.dueDate)}
                    {isOverdue(note.dueDate, note.status) && (
                      <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                        OVERDUE
                      </span>
                    )}
                  </span>
                </div>
              )}

              {note.completedAt && (
                <div className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(note.completedAt)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(note.updatedAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              {note.client && (
                <div className="flex items-center gap-2">
                  <IconUser className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Client:</span>
                  <Link
                    href={`/client/${note.client.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {note.client.name}
                    {note.client.company && ` (${note.client.company})`}
                  </Link>
                </div>
              )}

              {note.project && (
                <div className="flex items-center gap-2">
                  <IconBriefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Project:</span>
                  <Link
                    href={`/project/${note.project.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {note.project.name}
                  </Link>
                </div>
              )}

              {note.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <IconTag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content</h3>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
