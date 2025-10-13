"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { IconArrowLeft, IconCalendar, IconUser, IconBriefcase, IconCurrencyDollar, IconEdit, IconAlertTriangle, IconCheck, IconClock, IconX, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

interface Payment {
  id: string;
  amount: number;
  status: string;
  date: string;
  dueDate?: string;
  description?: string;
  type: string;
  method: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  client: {
    id: string;
    name: string;
    company?: string;
  };
  payments: Payment[];
  paymentSummary: {
    totalBudget: number;
    totalPaid: number;
    totalPending: number;
    paymentCompletionPercentage: number;
    completedPaymentsCount: number;
    pendingPaymentsCount: number;
    totalPaymentsCount: number;
    isPaymentIncomplete: boolean;
  };
}

export default function ProjectViewPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentSectionExpanded, setIsPaymentSectionExpanded] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${params.id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Project not found');
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/client');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <IconCheck size={16} className="text-green-600" />;
      case 'PENDING': return <IconClock size={16} className="text-yellow-600" />;
      case 'FAILED': return <IconX size={16} className="text-red-600" />;
      case 'CANCELLED': return <IconX size={16} className="text-gray-600" />;
      case 'PARTIALLY_PAID': return <IconClock size={16} className="text-blue-600" />;
      default: return <IconClock size={16} className="text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-700 bg-green-100';
      case 'PENDING': return 'text-yellow-700 bg-yellow-100';
      case 'FAILED': return 'text-red-700 bg-red-100';
      case 'CANCELLED': return 'text-gray-700 bg-gray-100';
      case 'PARTIALLY_PAID': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (!project) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 mx-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                // console.log('Back button clicked');
                router.push('/client');
              }} 
              className="p-2 hover:bg-gray-200 rounded "
            >
              <IconArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
          </div>
          <Link href={`/project/edit/${project.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <IconEdit size={16} />
              Edit
            </button>
          </Link>
        </div>

        {/* Project Card */}
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Project Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <IconBriefcase size={24} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <IconUser size={16} className="text-gray-400" />
                  <Link href={`/client/${project.client.id}`} className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                    {project.client.name}
                  </Link>
                  {project.client.company && (
                    <span className="text-gray-500">• 
                      <Link href={`/client/${project.client.id}`} className="text-gray-500 hover:text-gray-700 hover:underline cursor-pointer">
                        {project.client.company}
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-gray-700 bg-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Priority</label>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full text-gray-700 bg-gray-100">
                  {project.priority}
                </span>
              </div>
            </div>

            {project.budget && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Budget</label>
                <div className="flex items-center gap-2">
                  <IconCurrencyDollar size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">₹{project.budget.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {(project.startDate || project.endDate) && (
              <div className="grid grid-cols-2 gap-6">
                {project.startDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Start Date</label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                {project.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">End Date</label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {project.description && (
              <div className="pt-6 border-t">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Description</label>
                <p className="text-gray-900 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        {project.paymentSummary.totalPaymentsCount > 0 && (
          <div className="bg-white rounded-lg border shadow-sm mt-6">
            <div 
              className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsPaymentSectionExpanded(!isPaymentSectionExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  {project.paymentSummary.isPaymentIncomplete && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      <IconAlertTriangle size={14} />
                      <span className="text-xs">Incomplete</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    ₹{project.paymentSummary.totalPaid.toLocaleString()} / ₹{project.paymentSummary.totalBudget.toLocaleString()}
                  </span>
                  {isPaymentSectionExpanded ? (
                    <IconChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <IconChevronRight size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {isPaymentSectionExpanded && (
              <div className="p-6">
                {/* Payment Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Budget</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{project.paymentSummary.totalBudget.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Paid</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{project.paymentSummary.totalPaid.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Pending</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{project.paymentSummary.totalPending.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Progress</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {project.paymentSummary.paymentCompletionPercentage}%
                  </div>
                </div>
              </div>

              {/* Payment Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Payment Progress</span>
                  <span className="text-xs text-gray-500">
                    {project.paymentSummary.completedPaymentsCount} of {project.paymentSummary.totalPaymentsCount} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      project.paymentSummary.isPaymentIncomplete ? 'bg-gray-400' : 'bg-gray-600'
                    }`}
                    style={{ width: `${project.paymentSummary.paymentCompletionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Payment List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payments</h4>
                <div className="space-y-2">
                  {project.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(payment.status)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.description || 'Payment'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.type.replace('_', ' ')} • {payment.method.replace('_', ' ')}
                          </div>
                          {payment.dueDate && (
                            <div className={`text-xs ${
                              new Date(payment.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'
                            }`}>
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                              {new Date(payment.dueDate) < new Date() && ' (Overdue)'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ')}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{payment.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}