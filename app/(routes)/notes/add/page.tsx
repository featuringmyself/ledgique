"use client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  IconArrowLeft, 
  IconPlus, 
  IconX,
  IconUser,
  IconBriefcase,
  IconTag,
  IconCalendar,
  IconNotes,
  IconCheck
} from "@tabler/icons-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export default function AddNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Get the type from URL params, default to GENERAL
  const initialType = searchParams.get('type') || 'GENERAL';
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: initialType,
    priority: "MEDIUM",
    status: "ACTIVE",
    tags: [] as string[],
    dueDate: "",
    clientId: "",
    projectId: "",
  });
  
  const [newTag, setNewTag] = useState("");

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients/list');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  useEffect(() => {
    setFilteredClients(
      clients.filter(client => 
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(clientSearch.toLowerCase()))
      )
    );
  }, [clientSearch, clients]);

  useEffect(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(projectSearch.toLowerCase());
      const matchesClient = !formData.clientId || project.clientId === formData.clientId;
      return matchesSearch && matchesClient;
    });
    setFilteredProjects(filtered);
  }, [projectSearch, projects, formData.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/notes/add", formData);
      router.push("/notes");
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset project when client changes
    if (name === 'clientId') {
      setFormData(prev => ({ ...prev, projectId: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
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

  const getButtonColor = () => {
    switch (formData.type) {
      case 'TODO': return 'bg-blue-600 hover:bg-blue-700';
      case 'DELIVERABLE': return 'bg-purple-600 hover:bg-purple-700';
      case 'MEETING_NOTES': return 'bg-orange-600 hover:bg-orange-700';
      case 'CLIENT_COMMUNICATION': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'PROJECT_NOTES': return 'bg-teal-600 hover:bg-teal-700';
      case 'PERSONAL': return 'bg-pink-600 hover:bg-pink-700';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

  const getButtonText = () => {
    switch (formData.type) {
      case 'TODO': return 'Create Todo';
      case 'DELIVERABLE': return 'Create Deliverable';
      case 'MEETING_NOTES': return 'Create Meeting Note';
      case 'CLIENT_COMMUNICATION': return 'Create Communication';
      case 'PROJECT_NOTES': return 'Create Project Note';
      case 'PERSONAL': return 'Create Personal Note';
      default: return 'Create Note';
    }
  };

  const getHeaderText = () => {
    switch (formData.type) {
      case 'TODO': return 'Add Todo';
      case 'DELIVERABLE': return 'Add Deliverable';
      case 'MEETING_NOTES': return 'Add Meeting Note';
      case 'CLIENT_COMMUNICATION': return 'Add Client Communication';
      case 'PROJECT_NOTES': return 'Add Project Note';
      case 'PERSONAL': return 'Add Personal Note';
      default: return 'Add Note';
    }
  };

  const getHeaderDescription = () => {
    switch (formData.type) {
      case 'TODO': return 'Create a new todo item';
      case 'DELIVERABLE': return 'Create a new project deliverable';
      case 'MEETING_NOTES': return 'Create a new meeting note';
      case 'CLIENT_COMMUNICATION': return 'Create a new client communication';
      case 'PROJECT_NOTES': return 'Create a new project note';
      case 'PERSONAL': return 'Create a new personal note';
      default: return 'Create a new general note';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TODO': return <IconCheck className="h-5 w-5 text-blue-600" />;
      case 'DELIVERABLE': return <IconBriefcase className="h-5 w-5 text-purple-600" />;
      case 'MEETING_NOTES': return <IconUser className="h-5 w-5 text-orange-600" />;
      case 'CLIENT_COMMUNICATION': return <IconUser className="h-5 w-5 text-indigo-600" />;
      case 'PROJECT_NOTES': return <IconBriefcase className="h-5 w-5 text-teal-600" />;
      case 'PERSONAL': return <IconUser className="h-5 w-5 text-pink-600" />;
      default: return <IconNotes className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/notes"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {getTypeIcon(formData.type)}
            {getHeaderText()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {getHeaderDescription()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.type === 'TODO' ? 'Todo Title' : 
                 formData.type === 'DELIVERABLE' ? 'Deliverable Title' :
                 formData.type === 'MEETING_NOTES' ? 'Meeting Title' :
                 formData.type === 'CLIENT_COMMUNICATION' ? 'Communication Title' :
                 formData.type === 'PROJECT_NOTES' ? 'Project Note Title' :
                 formData.type === 'PERSONAL' ? 'Personal Note Title' :
                 'Note Title'} *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={formData.type === 'TODO' ? 'What needs to be done?' : 
                           formData.type === 'DELIVERABLE' ? 'What needs to be delivered?' :
                           formData.type === 'MEETING_NOTES' ? 'What was discussed?' :
                           formData.type === 'CLIENT_COMMUNICATION' ? 'What was communicated?' :
                           formData.type === 'PROJECT_NOTES' ? 'What is the project note about?' :
                           formData.type === 'PERSONAL' ? 'What is this personal note about?' :
                           'Enter note title'}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.type === 'TODO' ? 'Description' : 
                 formData.type === 'DELIVERABLE' ? 'Deliverable Description' :
                 formData.type === 'MEETING_NOTES' ? 'Meeting Notes' :
                 formData.type === 'CLIENT_COMMUNICATION' ? 'Communication Details' :
                 formData.type === 'PROJECT_NOTES' ? 'Project Notes' :
                 formData.type === 'PERSONAL' ? 'Personal Notes' :
                 'Content'} *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder={formData.type === 'TODO' ? 'Describe the todo in detail...' : 
                           formData.type === 'DELIVERABLE' ? 'Describe the deliverable in detail...' :
                           formData.type === 'MEETING_NOTES' ? 'Record the meeting notes...' :
                           formData.type === 'CLIENT_COMMUNICATION' ? 'Record the communication details...' :
                           formData.type === 'PROJECT_NOTES' ? 'Record the project notes...' :
                           formData.type === 'PERSONAL' ? 'Record your personal notes...' :
                           'Enter note content'}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GENERAL">General Note</option>
                  <option value="TODO">Todo</option>
                  <option value="DELIVERABLE">Deliverable</option>
                  <option value="MEETING_NOTES">Meeting Notes</option>
                  <option value="CLIENT_COMMUNICATION">Client Communication</option>
                  <option value="PROJECT_NOTES">Project Notes</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <Input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client and Project Selection */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Link to Client/Project (Optional)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  className="w-full"
                />
                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, clientId: "", projectId: "" }));
                        setClientSearch("");
                        setShowClientDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      No client
                    </button>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, clientId: client.id, projectId: "" }));
                          setClientSearch(client.name);
                          setShowClientDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <div className="font-medium">{client.name}</div>
                        {client.company && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{client.company}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formData.clientId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setShowProjectDropdown(true);
                    }}
                    onFocus={() => setShowProjectDropdown(true)}
                    className="w-full"
                  />
                  {showProjectDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, projectId: "" }));
                          setProjectSearch("");
                          setShowProjectDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        No project
                      </button>
                      {filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectId: project.id }));
                            setProjectSearch(project.name);
                            setShowProjectDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tags
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className={`px-4 py-2 ${getButtonColor()} text-white rounded-lg flex items-center gap-2 transition-colors`}
              >
                <IconPlus className="h-4 w-4" />
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                  >
                    <IconTag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Preview
          </h3>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(formData.type)}
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {formData.title || `${formData.type === 'TODO' ? 'Todo' : 
                                   formData.type === 'DELIVERABLE' ? 'Deliverable' :
                                   formData.type === 'MEETING_NOTES' ? 'Meeting Note' :
                                   formData.type === 'CLIENT_COMMUNICATION' ? 'Communication' :
                                   formData.type === 'PROJECT_NOTES' ? 'Project Note' :
                                   formData.type === 'PERSONAL' ? 'Personal Note' :
                                   'Note'} Title`}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(formData.priority)}`}>
                {formData.priority}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {formData.content || `${formData.type === 'TODO' ? 'Todo description' : 
                                   formData.type === 'DELIVERABLE' ? 'Deliverable description' :
                                   formData.type === 'MEETING_NOTES' ? 'Meeting notes' :
                                   formData.type === 'CLIENT_COMMUNICATION' ? 'Communication details' :
                                   formData.type === 'PROJECT_NOTES' ? 'Project notes' :
                                   formData.type === 'PERSONAL' ? 'Personal notes' :
                                   'Note content'} will appear here...`}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {formData.dueDate && (
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4" />
                  <span>{new Date(formData.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {formData.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <IconTag className="h-4 w-4" />
                  <span>{formData.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/notes"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.content}
            className={`px-6 py-2 ${getButtonColor()} disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <IconPlus className="h-4 w-4" />
                {getButtonText()}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
