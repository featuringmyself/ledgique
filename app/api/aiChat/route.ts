import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const ai = new GoogleGenAI({});

const functionDeclarations = [
  {
    name: "addExpense",
    description: "Add a new expense to the ledger",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Expense amount" },
        description: { type: Type.STRING, description: "Expense description" },
        category: { type: Type.STRING, description: "Expense category" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
      },
      required: ["amount", "description"]
    }
  },
  {
    name: "createClient",
    description: "Create a new client in the system",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Client name" },
        email: { type: Type.STRING, description: "Client email" },
        phone: { type: Type.STRING, description: "Client phone number" }
      },
      required: ["name"]
    }
  },
  {
    name: "updateClient",
    description: "Update an existing client's information (email, phone, etc.)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientId: { type: Type.STRING, description: "Client ID" },
        name: { type: Type.STRING, description: "Client name" },
        email: { type: Type.STRING, description: "Client email to add/update" },
        phone: { type: Type.STRING, description: "Client phone to add/update" }
      },
      required: ["clientId"]
    }
  },
  {
    name: "showRevenue",
    description: "Display revenue information",
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, description: "Time period: monthly, yearly, or custom" },
        startDate: { type: Type.STRING, description: "Start date for custom period" },
        endDate: { type: Type.STRING, description: "End date for custom period" }
      }
    }
  },
  {
    name: "addIncome",
    description: "Add income or revenue entry",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Income amount" },
        source: { type: Type.STRING, description: "Income source" },
        clientId: { type: Type.STRING, description: "Associated client ID" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
      },
      required: ["amount", "source"]
    }
  },
  {
    name: "createProject",
    description: "Create a new project",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Project name" },
        description: { type: Type.STRING, description: "Project description" },
        clientId: { type: Type.STRING, description: "Client ID" },
        budget: { type: Type.NUMBER, description: "Project budget" },
        priority: { type: Type.STRING, description: "Priority: LOW, MEDIUM, HIGH, URGENT" },
        startDate: { type: Type.STRING, description: "Start date in YYYY-MM-DD format" },
        endDate: { type: Type.STRING, description: "End date in YYYY-MM-DD format" }
      },
      required: ["name", "clientId"]
    }
  },
  {
    name: "createInvoice",
    description: "Create a new invoice",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Invoice title" },
        clientId: { type: Type.STRING, description: "Client ID" },
        projectId: { type: Type.STRING, description: "Project ID (optional)" },
        dueDate: { type: Type.STRING, description: "Due date in YYYY-MM-DD format" },
        items: { 
          type: Type.ARRAY, 
          description: "Invoice items array",
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Item description" },
              quantity: { type: Type.NUMBER, description: "Item quantity" },
              unitPrice: { type: Type.NUMBER, description: "Unit price" }
            },
            required: ["description", "quantity", "unitPrice"]
          }
        },
        taxRate: { type: Type.NUMBER, description: "Tax rate percentage" }
      },
      required: ["title", "clientId", "dueDate", "items"]
    }
  },
  {
    name: "addPayment",
    description: "Record a new payment",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Payment amount" },
        description: { type: Type.STRING, description: "Payment description" },
        clientId: { type: Type.STRING, description: "Client ID" },
        projectId: { type: Type.STRING, description: "Project ID" },
        method: { type: Type.STRING, description: "Payment method" },
        type: { type: Type.STRING, description: "Payment type" },
        date: { type: Type.STRING, description: "Payment date in YYYY-MM-DD format" }
      },
      required: ["amount", "clientId", "projectId"]
    }
  },
  {
    name: "showPendingPayments",
    description: "Show total pending payment amount",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "showOverdueAmount",
    description: "Show total overdue amount from unpaid invoices",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "showClientSources",
    description: "Show where clients came from and client acquisition statistics",
    parameters: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.NUMBER, description: "Year to analyze (optional)" }
      }
    }
  },
  {
    name: "showClientStats",
    description: "Show client statistics including total clients, new clients this year, and top client sources",
    parameters: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.NUMBER, description: "Year to analyze (optional)" }
      }
    }
  },
  {
    name: "showDashboardStats",
    description: "Show comprehensive dashboard statistics including revenue, clients, projects, payments for current year",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "showThisYearStats",
    description: "Show statistics for the current year including clients, revenue, projects",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "createRetainer",
    description: "Create a new retainer",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Retainer title" },
        clientId: { type: Type.STRING, description: "Client ID" },
        totalAmount: { type: Type.NUMBER, description: "Total retainer amount" },
        hourlyRate: { type: Type.NUMBER, description: "Hourly rate (optional)" },
        startDate: { type: Type.STRING, description: "Start date in YYYY-MM-DD format" },
        endDate: { type: Type.STRING, description: "End date in YYYY-MM-DD format (optional)" }
      },
      required: ["title", "clientId", "totalAmount"]
    }
  },
  {
    name: "addClientSource",
    description: "Add a source to a client (like LinkedIn, referral, etc.)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientId: { type: Type.STRING, description: "Client ID" },
        sourceName: { type: Type.STRING, description: "Source name (e.g., LinkedIn, referral, website)" }
      },
      required: ["clientId", "sourceName"]
    }
  },
  {
    name: "createClientSource",
    description: "Create a new client source category",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Source name (e.g., LinkedIn, referral, website)" },
        description: { type: Type.STRING, description: "Source description (optional)" }
      },
      required: ["name"]
    }
  },
  {
    name: "updateProject",
    description: "Update an existing project",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "Project ID" },
        name: { type: Type.STRING, description: "Project name" },
        description: { type: Type.STRING, description: "Project description" },
        budget: { type: Type.NUMBER, description: "Project budget" },
        priority: { type: Type.STRING, description: "Priority: LOW, MEDIUM, HIGH, URGENT" },
        startDate: { type: Type.STRING, description: "Start date in YYYY-MM-DD format" },
        endDate: { type: Type.STRING, description: "End date in YYYY-MM-DD format" }
      },
      required: ["projectId"]
    }
  },
  {
    name: "updateExpense",
    description: "Update an existing expense",
    parameters: {
      type: Type.OBJECT,
      properties: {
        expenseId: { type: Type.STRING, description: "Expense ID" },
        amount: { type: Type.NUMBER, description: "Expense amount" },
        description: { type: Type.STRING, description: "Expense description" },
        category: { type: Type.STRING, description: "Expense category" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
      },
      required: ["expenseId"]
    }
  },
  {
    name: "updatePayment",
    description: "Update an existing payment",
    parameters: {
      type: Type.OBJECT,
      properties: {
        paymentId: { type: Type.STRING, description: "Payment ID" },
        amount: { type: Type.NUMBER, description: "Payment amount" },
        description: { type: Type.STRING, description: "Payment description" },
        method: { type: Type.STRING, description: "Payment method" },
        type: { type: Type.STRING, description: "Payment type" },
        status: { type: Type.STRING, description: "Payment status" },
        date: { type: Type.STRING, description: "Payment date in YYYY-MM-DD format" }
      },
      required: ["paymentId"]
    }
  },
  {
    name: "showExpenses",
    description: "Get total expenses and expense details for a specific time period (month, year, or date range). Use this to calculate total expense amounts.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        month: { type: Type.NUMBER, description: "Month (1-12) for filtering expenses" },
        year: { type: Type.NUMBER, description: "Year for filtering expenses" },
        startDate: { type: Type.STRING, description: "Start date in YYYY-MM-DD format for custom range" },
        endDate: { type: Type.STRING, description: "End date in YYYY-MM-DD format for custom range" }
      }
    }
  },
  {
    name: "showUnpaidInvoices",
    description: "Show count and details of unpaid invoices",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "listClients",
    description: "List all clients with their IDs and names for reference",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: { type: Type.STRING, description: "Optional search term to filter clients" }
      }
    }
  },
  {
    name: "listProjects",
    description: "List all projects with their IDs and names for reference",
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientId: { type: Type.STRING, description: "Optional client ID to filter projects" },
        search: { type: Type.STRING, description: "Optional search term to filter projects" }
      }
    }
  },
  {
    name: "searchClients",
    description: "Search for clients by name or email to find their IDs",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Search query (name or email)" }
      },
      required: ["query"]
    }
  },
  {
    name: "searchProjects",
    description: "Search for projects by name to find their IDs",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Search query (project name)" }
      },
      required: ["query"]
    }
  }
];

// Type definitions
interface AddExpenseParams {
  amount: number;
  description: string;
  category?: string;
  date?: string;
}

interface CreateClientParams {
  name: string;
  email?: string;
  phone?: string;
}

interface UpdateClientParams {
  clientId: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface ShowRevenueParams {
  period?: string;
  startDate?: string;
  endDate?: string;
}

interface AddIncomeParams {
  amount: number;
  source: string;
  clientId?: string;
  date?: string;
}

interface CreateProjectParams {
  name: string;
  description?: string;
  clientId: string;
  budget?: number;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateInvoiceParams {
  title: string;
  clientId: string;
  projectId?: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate?: number;
}

interface AddPaymentParams {
  amount: number;
  description?: string;
  clientId: string;
  projectId: string;
  method?: string;
  type?: string;
  date?: string;
}

interface CreateRetainerParams {
  title: string;
  clientId: string;
  totalAmount: number;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
}

interface AddClientSourceParams {
  clientId: string;
  sourceName: string;
}

interface CreateClientSourceParams {
  name: string;
  description?: string;
}

interface UpdateProjectParams {
  projectId: string;
  name?: string;
  description?: string;
  budget?: number;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateExpenseParams {
  expenseId: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

interface UpdatePaymentParams {
  paymentId: string;
  amount?: number;
  description?: string;
  method?: string;
  type?: string;
  status?: string;
  date?: string;
}

interface ShowExpensesParams {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

interface ClientAnalysisParams {
  year?: number;
}

interface FunctionResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}



// Function implementations
async function addExpense(params: AddExpenseParams, userId: string): Promise<FunctionResult> {
  try {
    const expense = await prisma.expense.create({
      data: {
        title: params.description,
        description: params.description,
        amount: params.amount,
        category: 'OTHER',
        date: params.date ? new Date(params.date) : new Date(),
        clerkId: userId
      }
    });
    return { success: true, message: `Added expense: ${params.description} for $${params.amount}`, data: expense };
  } catch (_error) {
    return { success: false, error: 'Failed to add expense' };
  }
}

async function createClient(params: CreateClientParams, userId: string): Promise<FunctionResult> {
  try {
    const client = await prisma.client.create({
      data: {
        name: params.name,
        email: params.email ? [params.email] : [],
        phone: params.phone ? [params.phone] : [],
        clerkId: userId
      }
    });
    return { success: true, message: `Created client: ${params.name}`, data: client };
  } catch (_error) {
    return { success: false, error: 'Failed to create client' };
  }
}

async function updateClient(params: UpdateClientParams, userId: string): Promise<FunctionResult> {
  try {
    const updateData: { name?: string; email?: string[]; phone?: string[] } = {};
    
    if (params.name) updateData.name = params.name;
    if (params.email) {
      const existingClient = await prisma.client.findUnique({ where: { id: params.clientId } });
      const currentEmails = existingClient?.email || [];
      updateData.email = [...currentEmails, params.email];
    }
    if (params.phone) {
      const existingClient = await prisma.client.findUnique({ where: { id: params.clientId } });
      const currentPhones = existingClient?.phone || [];
      updateData.phone = [...currentPhones, params.phone];
    }
    
    const client = await prisma.client.update({
      where: { id: params.clientId },
      data: updateData
    });
    
    return { success: true, message: `Updated client information`, data: client };
  } catch (_error) {
    return { success: false, error: 'Failed to update client' };
  }
}

async function showRevenue(params: ShowRevenueParams, userId: string): Promise<FunctionResult> {
  try {
    const startDate = params.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    
    const payments = await prisma.payment.aggregate({
      where: {
        project: { clerkId: userId },
        status: 'COMPLETED',
        date: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });
    
    const total = Number(payments._sum.amount || 0);
    return { success: true, data: { total, period: params.period || 'monthly', startDate, endDate } };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch revenue' };
  }
}

async function addIncome(params: AddIncomeParams, _userId: string): Promise<FunctionResult> {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: params.amount,
        description: `Income from ${params.source}`,
        date: params.date ? new Date(params.date) : new Date(),
        type: 'FULL_PAYMENT',
        status: 'COMPLETED',
        project: {
          create: {
            name: `Income - ${params.source}`,
            clerkId: _userId,
            client: {
              connect: params.clientId ? { id: params.clientId } : undefined,
              create: params.clientId ? undefined : {
                name: params.source,
                clerkId: _userId
              }
            }
          }
        },
        client: {
          connect: params.clientId ? { id: params.clientId } : undefined,
          create: params.clientId ? undefined : {
            name: params.source,
            clerkId: _userId
          }
        }
      }
    });
    return { success: true, message: `Added income: $${params.amount} from ${params.source}`, data: payment };
  } catch (_error) {
    return { success: false, error: 'Failed to add income' };
  }
}

async function createProject(params: CreateProjectParams, userId: string): Promise<FunctionResult> {
  try {
    const project = await prisma.project.create({
      data: {
        name: params.name,
        description: params.description,
        clientId: params.clientId,
        clerkId: userId,
        budget: params.budget,
        priority: (params.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null
      }
    });
    return { success: true, message: `Created project: ${params.name}`, data: project };
  } catch (_error) {
    return { success: false, error: 'Failed to create project' };
  }
}

async function createInvoice(params: CreateInvoiceParams, userId: string): Promise<FunctionResult> {
  try {
    const subtotal = params.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (params.taxRate || 0) / 100;
    const totalAmount = subtotal + taxAmount;
    
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        title: params.title,
        clientId: params.clientId,
        projectId: params.projectId,
        dueDate: new Date(params.dueDate),
        subtotal,
        taxRate: params.taxRate || 0,
        taxAmount,
        totalAmount,
        items: {
          create: params.items.map((item: InvoiceItem) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      }
    });
    return { success: true, message: `Created invoice: ${invoiceNumber}`, data: invoice };
  } catch (_error) {
    return { success: false, error: 'Failed to create invoice' };
  }
}

async function addPayment(params: AddPaymentParams, userId: string): Promise<FunctionResult> {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: params.amount,
        description: params.description,
        clientId: params.clientId,
        projectId: params.projectId,
        method: (params.method as 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'RAZORPAY' | 'UPI' | 'CHEQUE' | 'CRYPTO' | 'OTHER') || 'BANK_TRANSFER',
        type: (params.type as 'ADVANCE' | 'MILESTONE' | 'FINAL' | 'FULL_PAYMENT' | 'PARTIAL' | 'REFUND') || 'PARTIAL',
        date: params.date ? new Date(params.date) : new Date(),
        status: 'COMPLETED'
      }
    });
    return { success: true, message: `Added payment: $${params.amount}`, data: payment };
  } catch (_error) {
    return { success: false, error: 'Failed to add payment' };
  }
}

async function showPendingPayments(_userId: string): Promise<FunctionResult> {
  try {
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        status: { in: ["PENDING", "PARTIALLY_PAID"] },
        project: { clerkId: _userId }
      },
      _sum: { amount: true }
    });
    const amount = pendingPayments._sum.amount || 0;
    return { success: true, message: `Total pending payment amount: ₹${amount.toLocaleString()}`, data: { amount } };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch pending payments' };
  }
}

async function showOverdueAmount(_userId: string): Promise<FunctionResult> {
  try {
    // Check both invoices and payments for overdue amounts
    const [overdueInvoices, overduePayments, allInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          client: { clerkId: _userId }
        },
        _sum: { totalAmount: true }
      }),
      prisma.payment.aggregate({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ["PENDING", "PARTIALLY_PAID"] },
          project: { clerkId: _userId }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.count({
        where: { client: { clerkId: _userId } }
      })
    ]);
    
    const invoiceAmount = Number(overdueInvoices._sum.totalAmount || 0);
    const paymentAmount = Number(overduePayments._sum.amount || 0);
    const totalAmount = invoiceAmount + paymentAmount;
    
    return { 
      success: true, 
      message: `Total overdue amount: ₹${totalAmount.toLocaleString()} (${invoiceAmount} from invoices, ${paymentAmount} from payments). You have ${allInvoices} total invoices.`, 
      data: { amount: totalAmount, invoiceAmount, paymentAmount, totalInvoices: allInvoices } 
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch overdue amount' };
  }
}

async function showClientSources(params: ClientAnalysisParams, userId: string): Promise<FunctionResult> {
  try {
    const year = params.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const clientSources = await prisma.clientSource.findMany({
      where: { clerkId: userId },
      include: {
        clients: {
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        },
        _count: {
          select: { clients: true }
        }
      }
    });

    const sourceStats = clientSources.map(source => ({
      name: source.name,
      clientsThisYear: source.clients.length,
      totalClients: source._count.clients
    })).sort((a, b) => b.clientsThisYear - a.clientsThisYear);

    const totalClientsThisYear = sourceStats.reduce((sum, s) => sum + s.clientsThisYear, 0);
    const topSource = sourceStats[0];

    return {
      success: true,
      message: `In ${year}, you received ${totalClientsThisYear} new clients. Top source: ${topSource?.name || 'None'} (${topSource?.clientsThisYear || 0} clients)`,
      data: { year, totalClientsThisYear, sources: sourceStats }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch client sources' };
  }
}

async function showClientStats(params: ClientAnalysisParams, userId: string): Promise<FunctionResult> {
  try {
    const year = params.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const [totalClients, clientsThisYear, clientsBySource] = await Promise.all([
      prisma.client.count({ where: { clerkId: userId } }),
      prisma.client.count({
        where: {
          clerkId: userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.client.groupBy({
        by: ['clientSourceId'],
        where: {
          clerkId: userId,
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      })
    ]);

    return {
      success: true,
      message: `Client Stats for ${year}: Total clients: ${totalClients}, New clients this year: ${clientsThisYear}`,
      data: { year, totalClients, clientsThisYear, clientsBySource }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch client stats' };
  }
}

async function showDashboardStats(_userId: string): Promise<FunctionResult> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const [revenue, clients, projects, payments, expenses, clientSources] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          project: { clerkId: _userId },
          status: 'COMPLETED',
          date: { gte: startOfYear, lte: endOfYear }
        },
        _sum: { amount: true }
      }),
      prisma.client.count({
        where: {
          clerkId: _userId,
          createdAt: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.project.count({
        where: {
          clerkId: _userId,
          createdAt: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.payment.count({
        where: {
          project: { clerkId: _userId },
          date: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.expense.aggregate({
        where: {
          clerkId: _userId,
          date: { gte: startOfYear, lte: endOfYear }
        },
        _sum: { amount: true }
      }),
      prisma.clientSource.findMany({
        where: { clerkId: _userId },
        include: {
          clients: {
            where: { createdAt: { gte: startOfYear, lte: endOfYear } }
          }
        }
      })
    ]);

    const topClientSource = clientSources
      .map(source => ({ name: source.name, count: source.clients.length }))
      .sort((a, b) => b.count - a.count)[0];

    return {
      success: true,
      message: `${currentYear} Dashboard: Revenue: ₹${(revenue._sum.amount || 0).toLocaleString()}, New Clients: ${clients}, Projects: ${projects}, Payments: ${payments}, Expenses: ₹${(expenses._sum.amount || 0).toLocaleString()}. Top client source: ${topClientSource?.name || 'None'} (${topClientSource?.count || 0} clients)`,
      data: {
        year: currentYear,
        revenue: revenue._sum.amount || 0,
        clients,
        projects,
        payments,
        expenses: expenses._sum.amount || 0,
        topClientSource
      }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

async function showThisYearStats(_userId: string): Promise<FunctionResult> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const clientSources = await prisma.clientSource.findMany({
      where: { clerkId: _userId },
      include: {
        clients: {
          where: { createdAt: { gte: startOfYear, lte: endOfYear } }
        }
      }
    });

    const sourceStats = clientSources
      .map(source => ({ name: source.name, count: source.clients.length }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);

    const totalClients = sourceStats.reduce((sum, s) => sum + s.count, 0);
    const topSource = sourceStats[0];

    return {
      success: true,
      message: `This year (${currentYear}), you received ${totalClients} new clients. Maximum clients came from: ${topSource?.name || 'No source specified'} (${topSource?.count || 0} clients). All sources: ${sourceStats.map(s => `${s.name}: ${s.count}`).join(', ')}`,
      data: {
        year: currentYear,
        totalClients,
        topSource,
        allSources: sourceStats
      }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch this year stats' };
  }
}

async function createRetainer(params: CreateRetainerParams, userId: string): Promise<FunctionResult> {
  try {
    const retainer = await prisma.retainer.create({
      data: {
        title: params.title,
        clientId: params.clientId,
        totalAmount: params.totalAmount,
        hourlyRate: params.hourlyRate,
        startDate: params.startDate ? new Date(params.startDate) : new Date(),
        endDate: params.endDate ? new Date(params.endDate) : null
      }
    });
    return { success: true, message: `Created retainer: ${params.title}`, data: retainer };
  } catch (_error) {
    return { success: false, error: 'Failed to create retainer' };
  }
}

async function addClientSource(params: AddClientSourceParams, userId: string): Promise<FunctionResult> {
  try {
    // Find or create the source
    let clientSource = await prisma.clientSource.findFirst({
      where: { name: params.sourceName, clerkId: userId }
    });
    
    if (!clientSource) {
      clientSource = await prisma.clientSource.create({
        data: { name: params.sourceName, clerkId: userId }
      });
    }
    
    // Update client with source
    const client = await prisma.client.update({
      where: { id: params.clientId },
      data: { clientSourceId: clientSource.id }
    });
    
    return { success: true, message: `Added ${params.sourceName} as source for client`, data: client };
  } catch (_error) {
    return { success: false, error: 'Failed to add client source' };
  }
}

async function createClientSource(params: CreateClientSourceParams, userId: string): Promise<FunctionResult> {
  try {
    const clientSource = await prisma.clientSource.create({
      data: {
        name: params.name,
        clerkId: userId
      }
    });
    return { success: true, message: `Created client source: ${params.name}`, data: clientSource };
  } catch (_error) {
    return { success: false, error: 'Failed to create client source' };
  }
}

async function updateProject(params: UpdateProjectParams, userId: string): Promise<FunctionResult> {
  try {
    const updateData: Record<string, unknown> = {};
    if (params.name) updateData.name = params.name;
    if (params.description) updateData.description = params.description;
    if (params.budget) updateData.budget = params.budget;
    if (params.priority) updateData.priority = params.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    if (params.startDate) updateData.startDate = new Date(params.startDate);
    if (params.endDate) updateData.endDate = new Date(params.endDate);
    
    const project = await prisma.project.update({
      where: { id: params.projectId },
      data: updateData
    });
    return { success: true, message: `Updated project`, data: project };
  } catch (_error) {
    return { success: false, error: 'Failed to update project' };
  }
}

async function updateExpense(params: UpdateExpenseParams, userId: string): Promise<FunctionResult> {
  try {
    const updateData: Record<string, unknown> = {};
    if (params.amount) updateData.amount = params.amount;
    if (params.description) {
      updateData.title = params.description;
      updateData.description = params.description;
    }
    if (params.category) updateData.category = params.category as 'OTHER';
    if (params.date) updateData.date = new Date(params.date);
    
    const expense = await prisma.expense.update({
      where: { id: params.expenseId },
      data: updateData
    });
    return { success: true, message: `Updated expense`, data: expense };
  } catch (_error) {
    return { success: false, error: 'Failed to update expense' };
  }
}

async function updatePayment(params: UpdatePaymentParams, userId: string): Promise<FunctionResult> {
  try {
    const updateData: Record<string, unknown> = {};
    if (params.amount) updateData.amount = params.amount;
    if (params.description) updateData.description = params.description;
    if (params.method) updateData.method = params.method;
    if (params.type) updateData.type = params.type;
    if (params.status) updateData.status = params.status;
    if (params.date) updateData.date = new Date(params.date);
    
    const payment = await prisma.payment.update({
      where: { id: params.paymentId },
      data: updateData
    });
    return { success: true, message: `Updated payment`, data: payment };
  } catch (_error) {
    return { success: false, error: 'Failed to update payment' };
  }
}

async function showExpenses(params: ShowExpensesParams, userId: string): Promise<FunctionResult> {
  try {
    let startDate: Date;
    let endDate: Date;
    
    if (params.startDate && params.endDate) {
      startDate = new Date(params.startDate);
      endDate = new Date(params.endDate);
    } else if (params.month && params.year) {
      startDate = new Date(params.year, params.month - 1, 1);
      endDate = new Date(params.year, params.month, 0);
    } else if (params.year) {
      startDate = new Date(params.year, 0, 1);
      endDate = new Date(params.year, 11, 31);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    const expenses = await prisma.expense.findMany({
      where: {
        clerkId: userId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });
    
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const monthName = startDate.toLocaleString('default', { month: 'long' });
    const year = startDate.getFullYear();
    
    return {
      success: true,
      message: `Total expenses for ${monthName} ${year}: ₹${totalAmount.toLocaleString()} (${expenses.length} expenses)`,
      data: { totalAmount, expenses, count: expenses.length, period: `${monthName} ${year}` }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch expenses' };
  }
}

async function showUnpaidInvoices(_userId: string): Promise<FunctionResult> {
  try {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        client: { clerkId: _userId },
        status: { in: ["SENT", "VIEWED", "OVERDUE"] }
      },
      include: {
        client: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
    
    const totalAmount = unpaidInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
    
    return {
      success: true,
      message: `You have ${unpaidInvoices.length} unpaid invoices totaling ₹${totalAmount.toLocaleString()}`,
      data: { count: unpaidInvoices.length, totalAmount, invoices: unpaidInvoices }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch unpaid invoices' };
  }
}

async function listClients(params: { search?: string }, userId: string): Promise<FunctionResult> {
  try {
    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
        ...(params.search && {
          name: { contains: params.search, mode: 'insensitive' }
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' }
    });
    
    return {
      success: true,
      message: `Found ${clients.length} clients`,
      data: { clients }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch clients' };
  }
}

async function listProjects(params: { clientId?: string; search?: string }, userId: string): Promise<FunctionResult> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        clerkId: userId,
        ...(params.clientId && { clientId: params.clientId }),
        ...(params.search && {
          name: { contains: params.search, mode: 'insensitive' }
        })
      },
      select: {
        id: true,
        name: true,
        description: true,
        client: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    return {
      success: true,
      message: `Found ${projects.length} projects`,
      data: { projects }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch projects' };
  }
}

async function searchClients(params: { query: string }, userId: string): Promise<FunctionResult> {
  try {
    const clients = await prisma.client.findMany({
      where: {
        clerkId: userId,
        OR: [
          { name: { contains: params.query, mode: 'insensitive' } },
          { email: { hasSome: [params.query] } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      take: 10
    });
    
    return {
      success: true,
      message: `Found ${clients.length} clients matching "${params.query}"`,
      data: { clients, query: params.query }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to search clients' };
  }
}

async function searchProjects(params: { query: string }, userId: string): Promise<FunctionResult> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        clerkId: userId,
        name: { contains: params.query, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        description: true,
        client: { select: { name: true } }
      },
      take: 10
    });
    
    return {
      success: true,
      message: `Found ${projects.length} projects matching "${params.query}"`,
      data: { projects, query: params.query }
    };
  } catch (_error) {
    return { success: false, error: 'Failed to search projects' };
  }
}

const tools = functionDeclarations;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, chatHistory = [] } = body;
    
    // console.log('Received chatHistory length:', chatHistory.length);
    // console.log('Chat history:', JSON.stringify(chatHistory, null, 2));
    // console.log('Current message:', message);

    const systemPrompt = `You are Ledgique AI — the assistant for Ledgique Accounting Software. You are designed to make accounting effortless. Your goal is to simplify workflows, reduce friction, and anticipate user needs so that users can accomplish tasks with minimal effort.

You have full access to all Ledgique features: creating, viewing, editing, deleting expenses; managing clients and projects; invoicing, payments, recurring items; generating reports; and other related tools.

When interacting, follow these principles:
- Be user-friendly: use clear, simple language. Avoid accounting jargon unless the user prefers it.  
- Be proactive: suggest helpful shortcuts or tips (e.g. "Do you want this expense to recur?").  
- Validate inputs: check if dates are valid, amounts are numeric, required fields are present.  
- SEARCH FIRST: When users mention client names, project names, or other entities, ALWAYS search for them first using searchClients, searchProjects, listClients, or listProjects functions before asking for IDs. Only ask for clarification if no matches are found.
- Auto-complete: If a user says "create invoice for John" - search for clients named John first, then proceed with the invoice creation.
- Clarify when needed: if any detail is missing or ambiguous (client, project, amount, date, etc.), ask follow-up questions before performing an action.  
- Confirm actions: once you act, tell the user what you did and summarize the outcome.  
- Error-aware: if something can't be done because of missing data, permissions, invalid input, etc., explain clearly what's wrong and how to resolve it.  
- Respect permissions and security: do not assume you have rights for actions, avoid exposing private or sensitive data, follow Ledgique's security constraints.

Formatting Guidelines:
- Use clear headings and structure for better readability
- Format currency amounts with ₹ symbol and proper formatting
- Use bullet points for lists and details
- Format dates in a readable format (e.g., September 16, 2025)
- Present data in organized, scannable format
- Use emojis sparingly for visual appeal when appropriate`;

    const contents = [
      ...chatHistory,
      {
        role: "user",
        parts: [{ text: chatHistory.length === 0 ? `${systemPrompt}\n\n${message}` : message }]
      }
    ];
    
    console.log('Contents being sent to Gemini:', JSON.stringify(contents, null, 2));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ functionDeclarations: tools as any }]
      }
    });

    // Check if AI wants to call functions
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const functionCall of response.functionCalls) {
        const functionName = functionCall.name;
        const functionArgs = functionCall.args;

        let functionResult;

        // Execute the appropriate function
        switch (functionName) {
          case "addExpense":
            functionResult = await addExpense(functionArgs as unknown as AddExpenseParams, userId);
            break;
          case "createClient":
            functionResult = await createClient(functionArgs as unknown as CreateClientParams, userId);
            break;
          case "updateClient":
            functionResult = await updateClient(functionArgs as unknown as UpdateClientParams, userId);
            break;
          case "showRevenue":
            functionResult = await showRevenue(functionArgs as unknown as ShowRevenueParams, userId);
            break;
          case "addIncome":
            functionResult = await addIncome(functionArgs as unknown as AddIncomeParams, userId);
            break;
          case "createProject":
            functionResult = await createProject(functionArgs as unknown as CreateProjectParams, userId);
            break;
          case "createInvoice":
            functionResult = await createInvoice(functionArgs as unknown as CreateInvoiceParams, userId);
            break;
          case "addPayment":
            functionResult = await addPayment(functionArgs as unknown as AddPaymentParams, userId);
            break;
          case "showPendingPayments":
            functionResult = await showPendingPayments(userId);
            break;
          case "showOverdueAmount":
            functionResult = await showOverdueAmount(userId);
            break;
          case "showClientSources":
            functionResult = await showClientSources(functionArgs as unknown as ClientAnalysisParams, userId);
            break;
          case "showClientStats":
            functionResult = await showClientStats(functionArgs as unknown as ClientAnalysisParams, userId);
            break;
          case "showDashboardStats":
            functionResult = await showDashboardStats(userId);
            break;
          case "showThisYearStats":
            functionResult = await showThisYearStats(userId);
            break;
          case "createRetainer":
            functionResult = await createRetainer(functionArgs as unknown as CreateRetainerParams, userId);
            break;
          case "addClientSource":
            functionResult = await addClientSource(functionArgs as unknown as AddClientSourceParams, userId);
            break;
          case "createClientSource":
            functionResult = await createClientSource(functionArgs as unknown as CreateClientSourceParams, userId);
            break;
          case "updateProject":
            functionResult = await updateProject(functionArgs as unknown as UpdateProjectParams, userId);
            break;
          case "updateExpense":
            functionResult = await updateExpense(functionArgs as unknown as UpdateExpenseParams, userId);
            break;
          case "updatePayment":
            functionResult = await updatePayment(functionArgs as unknown as UpdatePaymentParams, userId);
            break;
          case "showExpenses":
            functionResult = await showExpenses(functionArgs as unknown as ShowExpensesParams, userId);
            break;
          case "showUnpaidInvoices":
            functionResult = await showUnpaidInvoices(userId);
            break;
          case "listClients":
            functionResult = await listClients(functionArgs as unknown as { search?: string }, userId);
            break;
          case "listProjects":
            functionResult = await listProjects(functionArgs as unknown as { clientId?: string; search?: string }, userId);
            break;
          case "searchClients":
            functionResult = await searchClients(functionArgs as unknown as { query: string }, userId);
            break;
          case "searchProjects":
            functionResult = await searchProjects(functionArgs as unknown as { query: string }, userId);
            break;
          default:
            functionResult = { error: "Unknown function", success: false };
        }

        // Add function call and response to conversation
        contents.push({
          role: "model",
          parts: [{ text: response.text || 'Function call executed' }]
        });
        contents.push({
          role: "user",
          parts: [{
            text: `Function ${functionName} result: ${JSON.stringify(functionResult)}`
          }]
        });
      }

      // Get final response with function results
      const finalResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [{ functionDeclarations: tools as any }]
        }
      });

      const updatedHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: finalResponse.text }] }
      ];

      return NextResponse.json({
        message: finalResponse.text,
        chatHistory: updatedHistory,
        functionsExecuted: response.functionCalls.map((fc) => ({ name: fc.name || '', args: fc.args }))
      });
    } else {
      const updatedHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: response.text }] }
      ];

      return NextResponse.json({
        message: response.text,
        chatHistory: updatedHistory
      });
    }

  } catch (_error) {
    console.error("Error:", _error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}