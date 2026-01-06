"use client";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { 
  IconPlus, 
  IconSearch, 
  IconCalendar, 
  IconDots, 
  IconEye, 
  IconEdit, 
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconTag,
  IconUser,
  IconBriefcase,
  IconNotes,
  IconFileText,
  IconCheckbox,
  IconPackage,
  IconUsers,
  IconMessageCircle
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Skeleton, SkeletonStatsGrid, SkeletonListCard } from "@/components/ui/skeleton";

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type NoteType = 'ALL' | 'GENERAL' | 'TODO' | 'DELIVERABLE' | 'MEETING_NOTES' | 'CLIENT_COMMUNICATION' | 'PROJECT_NOTES' | 'PERSONAL';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<NoteType>('ALL');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const noteTypes = [
    { key: 'ALL' as NoteType, label: 'All Notes', icon: IconNotes, color: 'text-gray-600' },
    { key: 'TODO' as NoteType, label: 'Todos', icon: IconCheckbox, color: 'text-blue-600' },
    { key: 'DELIVERABLE' as NoteType, label: 'Deliverables', icon: IconPackage, color: 'text-purple-600' },
    { key: 'MEETING_NOTES' as NoteType, label: 'Meeting Notes', icon: IconUsers, color: 'text-orange-600' },
    { key: 'CLIENT_COMMUNICATION' as NoteType, label: 'Client Communication', icon: IconMessageCircle, color: 'text-indigo-600' },
    { key: 'PROJECT_NOTES' as NoteType, label: 'Project Notes', icon: IconBriefcase, color: 'text-teal-600' },
    { key: 'GENERAL' as NoteType, label: 'General Notes', icon: IconFileText, color: 'text-green-600' },
    { key: 'PERSONAL' as NoteType, label: 'Personal', icon: IconUser, color: 'text-pink-600' },
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: pagination.currentPage.toString(),
          limit: pagination.limit.toString(),
        });

        if (activeTab !== 'ALL') params.append('type', activeTab);
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'ALL') params.append('status', statusFilter);
        if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

        const response = await axios.get(`/api/notes?${params.toString()}`);
        const { notes: fetchedNotes, pagination: paginationInfo } = response.data;
        setNotes(fetchedNotes);
        setPagination(paginationInfo);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [pagination.currentPage, pagination.limit, searchTerm, statusFilter, priorityFilter, activeTab]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
    setOpenDropdown(null);
  };

  const handleStatusChange = async (noteId: string, newStatus: string) => {
    try {
      await axios.put(`/api/notes/${noteId}`, { status: newStatus });
      setNotes(notes.map(n => 
        n.id === noteId 
          ? { ...n, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null }
          : n
      ));
    } catch (error) {
      console.error('Error updating note status:', error);
      alert('Failed to update note status');
    }
    setOpenDropdown(null);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
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
    const noteType = noteTypes.find(nt => nt.key === type);
    if (noteType) {
      const IconComponent = noteType.icon;
      return <IconComponent className={`h-5 w-5 ${noteType.color}`} />;
    }
    return <IconNotes className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  };

  const totalNotes = pagination.totalCount;
  const activeNotes = notes.filter(n => n.status === 'ACTIVE').length;
  const completedNotes = notes.filter(n => n.status === 'COMPLETED').length;
  const overdueNotes = notes.filter(n => isOverdue(n.dueDate, n.status)).length;

  const getAddButtonColor = () => {
    switch (activeTab) {
      case 'TODO': return 'bg-blue-600 hover:bg-blue-700';
      case 'DELIVERABLE': return 'bg-purple-600 hover:bg-purple-700';
      case 'MEETING_NOTES': return 'bg-orange-600 hover:bg-orange-700';
      case 'CLIENT_COMMUNICATION': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'PROJECT_NOTES': return 'bg-teal-600 hover:bg-teal-700';
      case 'GENERAL': return 'bg-green-600 hover:bg-green-700';
      case 'PERSONAL': return 'bg-pink-600 hover:bg-pink-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'TODO': return 'Add Todo';
      case 'DELIVERABLE': return 'Add Deliverable';
      case 'MEETING_NOTES': return 'Add Meeting Note';
      case 'CLIENT_COMMUNICATION': return 'Add Communication';
      case 'PROJECT_NOTES': return 'Add Project Note';
      case 'GENERAL': return 'Add Note';
      case 'PERSONAL': return 'Add Personal Note';
      default: return 'Add Note';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <IconNotes className="h-8 w-8 text-gray-600" />
            Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your notes, todos, deliverables, and communications
          </p>
        </div>
        <Link
          href={`/notes/add?type=${activeTab}`}
          className={`${getAddButtonColor()} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
        >
          <IconPlus className="h-5 w-5" />
          {getAddButtonText()}
        </Link>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <SkeletonStatsGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNotes}</p>
              </div>
              <IconNotes className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeNotes}</p>
              </div>
              <IconClock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedNotes}</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueNotes}</p>
              </div>
              <IconAlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {noteTypes.map((noteType) => {
              const IconComponent = noteType.icon;
              return (
                <button
                  key={noteType.key}
                  onClick={() => setActiveTab(noteType.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === noteType.key
                      ? `border-blue-500 ${noteType.color}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {noteType.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <IconSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Skeleton className="h-5 w-5 rounded mt-1" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <IconNotes className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters to see more notes.'
                : 'Get started by creating your first note.'}
            </p>
            <Link
              href={`/notes/add?type=${activeTab}`}
              className={`${getAddButtonColor()} text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors`}
            >
              <IconPlus className="h-5 w-5" />
              {getAddButtonText()}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notes.map((note) => (
              <div key={note.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Interactive checkbox for todos */}
                    {note.type === 'TODO' ? (
                      <button
                        onClick={() => handleStatusChange(note.id, note.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED')}
                        className={`mt-1 p-1 rounded transition-colors ${
                          note.status === 'COMPLETED' 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {note.status === 'COMPLETED' ? (
                          <IconCheck className="h-5 w-5" />
                        ) : (
                          <IconCheckbox className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-1 p-2 rounded-lg bg-gray-100">
                        {getTypeIcon(note.type)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-medium truncate ${
                          note.status === 'COMPLETED' 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {note.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(note.priority)}`}>
                          {note.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(note.status)}`}>
                          {note.status}
                        </span>
                      </div>
                      
                      <p className={`text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 ${
                        note.status === 'COMPLETED' ? 'line-through' : ''
                      }`}>
                        {note.content}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="h-4 w-4" />
                          <span className={isOverdue(note.dueDate, note.status) ? 'text-red-600' : ''}>
                            {formatDate(note.dueDate)}
                          </span>
                        </div>
                        
                        {note.client && (
                          <div className="flex items-center gap-1">
                            <IconUser className="h-4 w-4" />
                            <span>{note.client.name}</span>
                          </div>
                        )}
                        
                        {note.project && (
                          <div className="flex items-center gap-1">
                            <IconBriefcase className="h-4 w-4" />
                            <span>{note.project.name}</span>
                          </div>
                        )}

                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <IconTag className="h-4 w-4" />
                            <span>{note.tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/notes/${note.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <IconEye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/notes/edit/${note.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === note.id ? null : note.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <IconDots className="h-4 w-4" />
                      </button>
                      
                      {openDropdown === note.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <div className="py-1">
                            {note.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleStatusChange(note.id, 'COMPLETED')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Mark as Completed
                              </button>
                            )}
                            {note.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusChange(note.id, 'ACTIVE')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Mark as Active
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(note.id, 'ARCHIVED')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Archive
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => handleDelete(note.id)}
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && notes.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} notes
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}