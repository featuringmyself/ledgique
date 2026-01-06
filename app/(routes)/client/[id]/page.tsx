"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  IconArrowLeft,
  IconEdit,
  IconMail,
  IconPhone,
  IconBuilding,
  IconCalendar,
  IconFileInvoice,
  IconFolder,
  IconNotes,
  IconCreditCard,
  IconWallet,
  IconUser,
  IconWorld,
  IconMapPin,
  IconEye,
  IconX,
  IconClock,
  IconPlus
} from "@tabler/icons-react";
import Link from "next/link";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  project?: { name: string };
  items: { description: string; quantity: number; unitPrice: number; totalPrice: number }[];
  payments: { id: string; amount: number; date: string; status: string }[];
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: string;
  method: string;
  type: string;
  description?: string;
  project?: { name: string };
  invoice?: { invoiceNumber: string; title: string };
}

interface Project {
  id: string;
  name: string;
  status: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  dueDate?: string;
}

interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  project?: { name: string };
}

interface Retainer {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  hourlyRate?: number;
  status: string;
  startDate: string;
  endDate?: string;
  project?: { name: string };
}

interface Client {
  id: string;
  name: string;
  email: string[];
  phone: string[];
  company?: string;
  address?: string;
  website?: string;
  clientNotes?: string;
  clientSource: { name: string } | null;
  status: string;
  createdAt: string;
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  notes: Note[];
  expenses: Expense[];
  retainers: Retainer[];
  _count: {
    projects: number;
    payments: number;
    invoices: number;
    notes: number;
    expenses: number;
    retainers: number;
  };
}

type TabType = "overview" | "invoices" | "payments" | "projects" | "notes" | "expenses" | "retainers" | "contacts" | "company";

export default function ClientViewPage() {
  const router = useRouter();
  const params = useParams();
  const { currency } = useCurrency();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/api/clients/${params.id}`);
        setClient(response.data);
      } catch (error) {
        console.error("Error fetching client:", error);
        alert("Client not found");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchClient();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) return null;

  // Map currency symbols to ISO 4217 currency codes
  const getCurrencyCode = (currencySymbol: string): string => {
    const symbolToCode: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '₹': 'INR',
      '¥': 'JPY',
      'A$': 'AUD',
      'C$': 'CAD',
      'CHF': 'CHF',
      'S$': 'SGD',
      'NZ$': 'NZD',
      'د.إ': 'AED',
      '﷼': 'SAR',
      'R': 'ZAR',
      'HK$': 'HKD',
      'RM': 'MYR',
      '฿': 'THB',
      '₱': 'PHP',
      'Rp': 'IDR',
      '৳': 'BDT',
      '₨': 'PKR',
      '₦': 'NGN',
      'KSh': 'KES',
      '₺': 'TRY',
      'kr': 'SEK', // Default to SEK if ambiguous
      'zł': 'PLN',
      'R$': 'BRL',
      '₪': 'ILS',
    };

    // If it's already a valid code (3 uppercase letters), return it
    if (currencySymbol && /^[A-Z]{3}$/.test(currencySymbol)) {
      return currencySymbol;
    }

    // Otherwise, try to map from symbol
    return symbolToCode[currencySymbol] || 'USD';
  };

  const formatCurrency = (amount: number) => {
    try {
      const currencyCode = getCurrencyCode(currency || 'USD');
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      // Fallback to USD if currency code is invalid
      console.warn('Invalid currency code, falling back to USD:', error);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PAID: "text-green-700 bg-green-100",
      SENT: "text-blue-700 bg-blue-100",
      DRAFT: "text-gray-700 bg-gray-100",
      OVERDUE: "text-red-700 bg-red-100",
      COMPLETED: "text-green-700 bg-green-100",
      IN_PROGRESS: "text-blue-700 bg-blue-100",
      PENDING: "text-yellow-700 bg-yellow-100",
      ACTIVE: "text-green-700 bg-green-100",
      INACTIVE: "text-gray-700 bg-gray-100",
      ARCHIVED: "text-gray-700 bg-gray-100",
      CANCELLED: "text-red-700 bg-red-100",
    };
    return statusMap[status] || "text-gray-700 bg-gray-100";
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <IconUser size={18} /> },
    { id: "invoices", label: "Invoices", icon: <IconFileInvoice size={18} />, count: client.invoices.length },
    { id: "payments", label: "Payments", icon: <IconCreditCard size={18} />, count: client._count.payments },
    { id: "projects", label: "Projects", icon: <IconFolder size={18} />, count: client._count.projects },
    { id: "notes", label: "Notes", icon: <IconNotes size={18} />, count: client._count.notes },
    { id: "expenses", label: "Expenses", icon: <IconWallet size={18} />, count: client._count.expenses },
    { id: "retainers", label: "Retainers", icon: <IconWallet size={18} />, count: client._count.retainers },
    { id: "contacts", label: "Contacts", icon: <IconUser size={18} /> },
    { id: "company", label: "Company", icon: <IconBuilding size={18} /> },
  ];

  return (
    <div className="min-h-screen p-6 mx-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              {client.company && (
                <p className="text-gray-600 mt-1 flex items-center gap-1">
                  <IconBuilding size={16} />
                  {client.company}
                </p>
              )}
            </div>
          </div>
          <Link href={`/client/edit/${client.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <IconEdit size={16} />
              Edit
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Invoiced</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(
                        client.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Total Paid</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                      {formatCurrency(
                        client.payments
                          .filter((p) => p.status === "COMPLETED")
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
              </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Outstanding</div>
                    <div className="text-2xl font-bold text-yellow-900 mt-1">
                      {formatCurrency(
                        client.invoices
                          .filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED")
                          .reduce((sum, inv) => {
                            const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                            return sum + (inv.totalAmount - paid);
                          }, 0)
                )}
              </div>
            </div>
          </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Projects</span>
                        <span className="font-medium">{client._count.projects}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Invoices</span>
                        <span className="font-medium">{client._count.invoices}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payments</span>
                        <span className="font-medium">{client._count.payments}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Notes</span>
                        <span className="font-medium">{client._count.notes}</span>
                      </div>
                </div>
              </div>
              
              <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconMail size={16} className="text-gray-400" />
                        <span className="text-gray-900">
                          {client.email.length > 0 ? client.email.join(", ") : "No email"}
                        </span>
                      </div>
                <div className="flex items-center gap-2">
                  <IconPhone size={16} className="text-gray-400" />
                        <span className="text-gray-900">
                          {client.phone.length > 0 ? client.phone.join(", ") : "No phone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconCalendar size={16} className="text-gray-400" />
                        <span className="text-gray-900">
                          Joined {formatDate(client.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                            client.status
                          )}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                          {client.status}
                        </span>
                      </div>
                </div>
              </div>
            </div>

                {client.clientNotes && (
              <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700 leading-relaxed">{client.clientNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
                  <Link href="/invoice/create">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Invoice
                    </button>
                  </Link>
                </div>
                {client.invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconFileInvoice size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.invoices.map((invoice) => {
                      const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
                      const remaining = invoice.totalAmount - paidAmount;
                      return (
                        <div
                          key={invoice.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {invoice.invoiceNumber} - {invoice.title}
                              </h4>
                              <span
                                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status}
                              </span>
                            </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                {invoice.project && (
                                  <div>Project: {invoice.project.name}</div>
                                )}
                                <div>Issue Date: {formatDate(invoice.issueDate)}</div>
                                <div>Due Date: {formatDate(invoice.dueDate)}</div>
                                <div className="font-medium text-gray-900">
                                  Total: {formatCurrency(invoice.totalAmount)}
                                  {paidAmount > 0 && (
                                    <span className="text-green-600 ml-2">
                                      (Paid: {formatCurrency(paidAmount)})
                                    </span>
                                  )}
                                  {remaining > 0 && (
                                    <span className="text-red-600 ml-2">
                                      (Remaining: {formatCurrency(remaining)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                  <Link href="/payments/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Payment
                    </button>
                  </Link>
                </div>
                {client.payments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconCreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No payments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </h4>
                              <span
                                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Date: {formatDate(payment.date)}</div>
                              {payment.dueDate && (
                                <div>Due Date: {formatDate(payment.dueDate)}</div>
                              )}
                              <div>Method: {payment.method}</div>
                              <div>Type: {payment.type}</div>
                              {payment.project && (
                                <div>Project: {payment.project.name}</div>
                              )}
                              {payment.invoice && (
              <div>
                                  Invoice: {payment.invoice.invoiceNumber} - {payment.invoice.title}
                                </div>
                              )}
                              {payment.description && (
                                <div>{payment.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                  <Link href="/projects/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Project
                    </button>
                  </Link>
                </div>
                {client.projects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconFolder size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No projects found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.projects.map((project) => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                <span
                                  className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                    project.status
                                  )}`}
                                >
                                  {project.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                {project.budget && (
                                  <div>Budget: {formatCurrency(project.budget)}</div>
                                )}
                                {project.startDate && (
                                  <div>Start: {formatDate(project.startDate)}</div>
                                )}
                                {project.endDate && (
                                  <div>End: {formatDate(project.endDate)}</div>
                                )}
                                <div>Created: {formatDate(project.createdAt)}</div>
                              </div>
                            </div>
                            <IconEye size={18} className="text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <Link href="/notes/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Note
                    </button>
                  </Link>
                </div>
                {client.notes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconNotes size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No notes found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.notes.map((note) => (
                      <Link key={note.id} href={`/notes/${note.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                <span
                                  className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                    note.status
                                  )}`}
                                >
                                  {note.status}
                                </span>
                                <span
                                  className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                    note.priority
                                  )}`}
                                >
                                  {note.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {note.content}
                              </p>
                              <div className="text-xs text-gray-500">
                                {formatDate(note.createdAt)}
                                {note.dueDate && ` • Due: ${formatDate(note.dueDate)}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === "expenses" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                  <Link href="/expenses/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Expense
                    </button>
                  </Link>
                </div>
                {client.expenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconWallet size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No expenses found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(expense.amount)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Category: {expense.category}</div>
                              <div>Date: {formatDate(expense.date)}</div>
                              {expense.project && (
                                <div>Project: {expense.project.name}</div>
                              )}
                              {expense.description && (
                                <div>{expense.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
                )}
              </div>
            )}

            {/* Retainers Tab */}
            {activeTab === "retainers" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Retainers</h3>
                  <Link href="/retainers/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <IconPlus size={16} />
                      New Retainer
                    </button>
                  </Link>
                </div>
                {client.retainers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconWallet size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No retainers found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.retainers.map((retainer) => (
                      <div
                        key={retainer.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{retainer.title}</h4>
                              <span
                                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                                  retainer.status
                                )}`}
                              >
                                {retainer.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="font-medium text-gray-900">
                                Total: {formatCurrency(retainer.totalAmount)}
                              </div>
                              {retainer.hourlyRate && (
                                <div>Hourly Rate: {formatCurrency(retainer.hourlyRate)}</div>
                              )}
                              <div>Start Date: {formatDate(retainer.startDate)}</div>
                              {retainer.endDate && (
                                <div>End Date: {formatDate(retainer.endDate)}</div>
                              )}
                              {retainer.project && (
                                <div>Project: {retainer.project.name}</div>
                              )}
                              {retainer.description && (
                                <div>{retainer.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <IconMail size={18} />
                      Email Addresses
                    </h4>
                    {client.email.length > 0 ? (
                <div className="space-y-2">
                        {client.email.map((email, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                          >
                            <a
                              href={`mailto:${email}`}
                              className="text-gray-900 hover:text-blue-600"
                            >
                              {email}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No email addresses</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <IconPhone size={18} />
                      Phone Numbers
                    </h4>
                    {client.phone.length > 0 ? (
                      <div className="space-y-2">
                        {client.phone.map((phone, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                          >
                            <a
                              href={`tel:${phone}`}
                              className="text-gray-900 hover:text-blue-600"
                            >
                              {phone}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No phone numbers</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {client.company && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <IconBuilding size={18} />
                        Company Name
                      </h4>
                      <p className="text-gray-900 text-lg">{client.company}</p>
                    </div>
                  )}

                  {client.website && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <IconWorld size={18} />
                        Website
                      </h4>
                      <a
                        href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {client.website}
                      </a>
                    </div>
                  )}

                  {client.address && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <IconMapPin size={18} />
                        Address
                      </h4>
                      <p className="text-gray-900">{client.address}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <IconCalendar size={18} />
                      Client Since
                    </h4>
                    <p className="text-gray-900">{formatDate(client.createdAt)}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Source</h4>
                    <p className="text-gray-900">{client.clientSource?.name || "Direct"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
