import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const ai = new GoogleGenAI({});

const functionDeclarations = [
  {
    name: "addExpense",
    description: "Add a new expense to the ledger, optionally associated with a client",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Expense amount" },
        description: { type: Type.STRING, description: "Expense description" },
        category: { type: Type.STRING, description: "Expense category" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
        clientId: { type: Type.STRING, description: "Client ID to associate expense with (optional)" }
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
  },
  {
    name: "findClientByName",
    description: "Find a client ID by client name - useful for parallel operations",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Client name to search for" }
      },
      required: ["name"]
    }
  },
  {
    name: "findProjectByName",
    description: "Find a project ID by project name - useful for parallel operations",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Project name to search for" }
      },
      required: ["name"]
    }
  },
  {
    name: "addExpenseToClient",
    description: "Add an expense to a specific client's account by client name",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Expense amount" },
        description: { type: Type.STRING, description: "Expense description" },
        clientName: { type: Type.STRING, description: "Client name to add expense to" },
        category: { type: Type.STRING, description: "Expense category" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
      },
      required: ["amount", "description", "clientName"]
    }
  },
  {
    name: "getCurrentDateTime",
    description: "Get current date, time, and contextual information",
    parameters: {
      type: Type.OBJECT,
      properties: {
        timezone: { type: Type.STRING, description: "Timezone (optional, defaults to system timezone)" }
      }
    }
  },
  {
    name: "getBusinessContext",
    description: "Get current business context including current month, quarter, year, and financial period information",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "addQuickExpense",
    description: "Add an expense with smart defaults - automatically detects category and uses today's date",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Expense amount" },
        description: { type: Type.STRING, description: "Expense description" },
        clientName: { type: Type.STRING, description: "Client name (optional)" }
      },
      required: ["amount", "description"]
    }
  }
];

// Type definitions
interface AddExpenseParams {
  amount: number;
  description: string;
  category?: 'OFFICE_SUPPLIES' | 'TRAVEL' | 'MEALS' | 'SOFTWARE' | 'EQUIPMENT' | 'MARKETING' | 'UTILITIES' | 'RENT' | 'OTHER';
  date?: string;
  clientId?: string;
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

interface AddExpenseToClientParams {
  amount: number;
  description: string;
  clientName: string;
  category?: string;
  date?: string;
}

interface GetCurrentDateTimeParams {
  timezone?: string;
}

interface GetBusinessContextParams {
  [key: string]: never;
}

interface AddQuickExpenseParams {
  amount: number;
  description: string;
  clientName?: string;
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
    // Smart category detection based on description
    let category: 'OFFICE_SUPPLIES' | 'TRAVEL' | 'MEALS' | 'SOFTWARE' | 'EQUIPMENT' | 'MARKETING' | 'UTILITIES' | 'RENT' | 'OTHER' = 'OTHER';
    const description = params.description.toLowerCase();
    
    if (description.includes('food') || description.includes('golgappe') || description.includes('lunch') || 
        description.includes('dinner') || description.includes('breakfast') || description.includes('snack') ||
        description.includes('restaurant') || description.includes('cafe') || description.includes('meal')) {
      category = 'MEALS';
    } else if (description.includes('travel') || description.includes('taxi') || description.includes('uber') || 
               description.includes('fuel') || description.includes('petrol') || description.includes('diesel')) {
      category = 'TRAVEL';
    } else if (description.includes('office') || description.includes('stationery') || description.includes('supplies')) {
      category = 'OFFICE_SUPPLIES';
    } else if (description.includes('entertainment') || description.includes('movie') || description.includes('game')) {
      category = 'OTHER';
    }

    const expense = await prisma.expense.create({
      data: {
        title: params.description,
        description: params.description,
        amount: params.amount,
        category: params.category || category,
        date: params.date ? new Date(params.date) : new Date(),
        clerkId: userId,
        ...(params.clientId && { client: { connect: { id: params.clientId } } })
      }
    });
    const clientMsg = params.clientId ? ' for client' : '';
    const categoryMsg = params.category ? ` (${params.category})` : ` (${category})`;
    return { success: true, message: `Added expense: ${params.description} for ₹${params.amount}${categoryMsg}${clientMsg}`, data: expense };
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: 'Failed to fetch revenue' };
  }
}

async function addIncome(params: AddIncomeParams, userId: string): Promise<FunctionResult> {
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
            clerkId: userId,
            client: {
              connect: params.clientId ? { id: params.clientId } : undefined,
              create: params.clientId ? undefined : {
                name: params.source,
                clerkId: userId
              }
            }
          }
        },
        client: {
          connect: params.clientId ? { id: params.clientId } : undefined,
          create: params.clientId ? undefined : {
            name: params.source,
            clerkId: userId
          }
        }
      }
    });
    return { success: true, message: `Added income: $${params.amount} from ${params.source}`, data: payment };
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: 'Failed to add payment' };
  }
}

async function showPendingPayments(userId: string): Promise<FunctionResult> {
  try {
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        status: { in: ["PENDING", "PARTIALLY_PAID"] },
        project: { clerkId: userId }
      },
      _sum: { amount: true }
    });
    const amount = pendingPayments._sum.amount || 0;
    return { success: true, message: `Total pending payment amount: ₹${amount.toLocaleString()}`, data: { amount } };
  } catch {
    return { success: false, error: 'Failed to fetch pending payments' };
  }
}

async function showOverdueAmount(userId: string): Promise<FunctionResult> {
  try {
    // Check both invoices and payments for overdue amounts
    const [overdueInvoices, overduePayments, allInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          client: { clerkId: userId }
        },
        _sum: { totalAmount: true }
      }),
      prisma.payment.aggregate({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ["PENDING", "PARTIALLY_PAID"] },
          project: { clerkId: userId }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.count({
        where: { client: { clerkId: userId } }
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
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: 'Failed to fetch client stats' };
  }
}

async function showDashboardStats(userId: string): Promise<FunctionResult> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const [revenue, clients, projects, payments, expenses, clientSources] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          project: { clerkId: userId },
          status: 'COMPLETED',
          date: { gte: startOfYear, lte: endOfYear }
        },
        _sum: { amount: true }
      }),
      prisma.client.count({
        where: {
          clerkId: userId,
          createdAt: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.project.count({
        where: {
          clerkId: userId,
          createdAt: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.payment.count({
        where: {
          project: { clerkId: userId },
          date: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.expense.aggregate({
        where: {
          clerkId: userId,
          date: { gte: startOfYear, lte: endOfYear }
        },
        _sum: { amount: true }
      }),
      prisma.clientSource.findMany({
        where: { clerkId: userId },
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
  } catch {
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

async function showThisYearStats(userId: string): Promise<FunctionResult> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const clientSources = await prisma.clientSource.findMany({
      where: { clerkId: userId },
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: 'Failed to fetch expenses' };
  }
}

async function showUnpaidInvoices(userId: string): Promise<FunctionResult> {
  try {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        client: { clerkId: userId },
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: 'Failed to search projects' };
  }
}

// Helper function to find client ID by name
async function findClientByName(name: string, userId: string): Promise<string | null> {
  const client = await prisma.client.findFirst({
    where: {
        clerkId: userId,
      name: { contains: name, mode: 'insensitive' }
    },
    select: { id: true }
  });
  return client?.id || null;
}

// Helper function to find project ID by name
async function findProjectByName(name: string, userId: string): Promise<string | null> {
  const project = await prisma.project.findFirst({
    where: {
        clerkId: userId,
      name: { contains: name, mode: 'insensitive' }
    },
    select: { id: true }
  });
  return project?.id || null;
}

// Add expense to client by name
async function addExpenseToClient(params: AddExpenseToClientParams, userId: string): Promise<FunctionResult> {
  try {
    // Find client by name
    const client = await prisma.client.findFirst({
      where: {
        clerkId: userId,
        name: { contains: params.clientName, mode: 'insensitive' }
      }
    });
    
    if (!client) {
      return { success: false, error: `Client '${params.clientName}' not found` };
    }
    
    // Create expense with client association
    const expense = await prisma.expense.create({
      data: {
        title: params.description,
        description: params.description,
        amount: params.amount,
        category: 'OTHER',
        date: params.date ? new Date(params.date) : new Date(),
        clerkId: userId,
        clientId: client.id
      }
    });
    
    return { 
      success: true, 
      message: `Added expense: ${params.description} for ₹${params.amount} to ${client.name}'s account`, 
      data: expense 
    };
  } catch {
    return { success: false, error: 'Failed to add expense to client account' };
  }
}

// Get current date and time with context
async function getCurrentDateTime(params: GetCurrentDateTimeParams, _userId: string): Promise<FunctionResult> {
  try {
    const now = new Date();
    const timezone = params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const dateInfo = {
      currentDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
      currentTime: now.toLocaleTimeString('en-US', { 
        timeZone: timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      currentDateTime: now.toLocaleString('en-US', { 
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      timezone: timezone,
      dayOfWeek: now.toLocaleDateString('en-US', { 
        timeZone: timezone,
        weekday: 'long' 
      }),
      dayOfYear: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
      weekOfYear: Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7)),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      isBusinessDay: now.getDay() >= 1 && now.getDay() <= 5
    };
    
    return {
      success: true,
      message: `Current date and time: ${dateInfo.currentDateTime} (${timezone})`,
      data: dateInfo
    };
  } catch {
    return { success: false, error: 'Failed to get current date and time' };
  }
}

// Get business context information
async function getBusinessContext(_params: GetBusinessContextParams, _userId: string): Promise<FunctionResult> {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentQuarter = Math.ceil(currentMonth / 3);
    const currentDay = now.getDate();
    
    // Financial year calculation (assuming April-March financial year)
    const financialYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
    const financialYearStart = new Date(financialYear, 3, 1); // April 1st
    const financialYearEnd = new Date(financialYear + 1, 2, 31); // March 31st
    
    // Calculate days remaining in current month
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysRemainingInMonth = lastDayOfMonth - currentDay;
    
    // Calculate days remaining in quarter
    const quarterEndMonth = currentQuarter * 3;
    const quarterEndDay = new Date(currentYear, quarterEndMonth, 0).getDate();
    const quarterEndDate = new Date(currentYear, quarterEndMonth - 1, quarterEndDay);
    const daysRemainingInQuarter = Math.ceil((quarterEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate days remaining in financial year
    const daysRemainingInFinancialYear = Math.ceil((financialYearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const businessContext = {
      currentYear,
      currentMonth,
      currentMonthName: now.toLocaleDateString('en-US', { month: 'long' }),
      currentQuarter,
      currentDay,
      financialYear: `${financialYear}-${financialYear + 1}`,
      financialYearStart: financialYearStart.toISOString().split('T')[0],
      financialYearEnd: financialYearEnd.toISOString().split('T')[0],
      daysRemainingInMonth,
      daysRemainingInQuarter,
      daysRemainingInFinancialYear,
      isEndOfMonth: daysRemainingInMonth <= 3,
      isEndOfQuarter: daysRemainingInQuarter <= 7,
      isEndOfFinancialYear: daysRemainingInFinancialYear <= 30,
      monthProgress: Math.round((currentDay / lastDayOfMonth) * 100),
      quarterProgress: Math.round(((currentMonth - (currentQuarter - 1) * 3) / 3) * 100),
      yearProgress: Math.round((now.getTime() - new Date(currentYear, 0, 1).getTime()) / (new Date(currentYear + 1, 0, 1).getTime() - new Date(currentYear, 0, 1).getTime()) * 100)
    };
    
    return {
      success: true,
      message: `Business context: ${businessContext.currentMonthName} ${currentYear}, Q${currentQuarter}, Financial Year ${businessContext.financialYear}`,
      data: businessContext
    };
  } catch {
    return { success: false, error: 'Failed to get business context' };
  }
}

// Add quick expense with smart defaults
async function addQuickExpense(params: AddQuickExpenseParams, userId: string): Promise<FunctionResult> {
  try {
    // Smart category detection based on description
    let category: 'OFFICE_SUPPLIES' | 'TRAVEL' | 'MEALS' | 'SOFTWARE' | 'EQUIPMENT' | 'MARKETING' | 'UTILITIES' | 'RENT' | 'OTHER' = 'OTHER';
    const description = params.description.toLowerCase();
    
    if (description.includes('food') || description.includes('golgappe') || description.includes('lunch') || 
        description.includes('dinner') || description.includes('breakfast') || description.includes('snack') ||
        description.includes('restaurant') || description.includes('cafe') || description.includes('meal')) {
      category = 'MEALS';
    } else if (description.includes('travel') || description.includes('taxi') || description.includes('uber') || 
               description.includes('fuel') || description.includes('petrol') || description.includes('diesel')) {
      category = 'TRAVEL';
    } else if (description.includes('office') || description.includes('stationery') || description.includes('supplies')) {
      category = 'OFFICE_SUPPLIES';
    } else if (description.includes('entertainment') || description.includes('movie') || description.includes('game')) {
      category = 'OTHER';
    }

    // Find client if specified
    let clientId: string | undefined;
    if (params.clientName) {
      const client = await prisma.client.findFirst({
        where: {
          clerkId: userId,
          name: { contains: params.clientName, mode: 'insensitive' }
        },
        select: { id: true }
      });
      clientId = client?.id;
    }

    const expense = await prisma.expense.create({
      data: {
        title: params.description,
        description: params.description,
        amount: params.amount,
        category: category,
        date: new Date(), // Always use today's date
        clerkId: userId,
        ...(clientId && { client: { connect: { id: clientId } } })
      }
    });
    
    const clientMsg = clientId ? ` for ${params.clientName}` : '';
    return { 
      success: true, 
      message: `✅ Added expense: ${params.description} for ₹${params.amount} (${category})${clientMsg}`, 
      data: expense 
    };
  } catch {
    return { success: false, error: 'Failed to add expense' };
  }
}

// Parallel function execution helper
async function executeParallelFunctions(functionCalls: Array<{ name: string; args: unknown }>, userId: string): Promise<FunctionResult[]> {
  const promises = functionCalls.map(async (functionCall) => {
    const { name: functionName, args: functionArgs } = functionCall;
    
    switch (functionName) {
      case "addExpense":
        return addExpense(functionArgs as AddExpenseParams, userId);
      case "createClient":
        return createClient(functionArgs as CreateClientParams, userId);
      case "updateClient":
        return updateClient(functionArgs as UpdateClientParams, userId);
      case "showRevenue":
        return showRevenue(functionArgs as ShowRevenueParams, userId);
      case "addIncome":
        return addIncome(functionArgs as AddIncomeParams, userId);
      case "createProject":
        return createProject(functionArgs as CreateProjectParams, userId);
      case "createInvoice":
        return createInvoice(functionArgs as CreateInvoiceParams, userId);
      case "addPayment":
        return addPayment(functionArgs as AddPaymentParams, userId);
      case "showPendingPayments":
        return showPendingPayments(userId);
      case "showOverdueAmount":
        return showOverdueAmount(userId);
      case "showClientSources":
        return showClientSources(functionArgs as ClientAnalysisParams, userId);
      case "showClientStats":
        return showClientStats(functionArgs as ClientAnalysisParams, userId);
      case "showDashboardStats":
        return showDashboardStats(userId);
      case "showThisYearStats":
        return showThisYearStats(userId);
      case "createRetainer":
        return createRetainer(functionArgs as CreateRetainerParams, userId);
      case "addClientSource":
        return addClientSource(functionArgs as AddClientSourceParams, userId);
      case "createClientSource":
        return createClientSource(functionArgs as CreateClientSourceParams, userId);
      case "updateProject":
        return updateProject(functionArgs as UpdateProjectParams, userId);
      case "updateExpense":
        return updateExpense(functionArgs as UpdateExpenseParams, userId);
      case "updatePayment":
        return updatePayment(functionArgs as UpdatePaymentParams, userId);
      case "showExpenses":
        return showExpenses(functionArgs as ShowExpensesParams, userId);
      case "showUnpaidInvoices":
        return showUnpaidInvoices(userId);
      case "listClients":
        return listClients(functionArgs as { search?: string }, userId);
      case "listProjects":
        return listProjects(functionArgs as { clientId?: string; search?: string }, userId);
      case "searchClients":
        return searchClients(functionArgs as { query: string }, userId);
      case "searchProjects":
        return searchProjects(functionArgs as { query: string }, userId);
      case "findClientByName":
        const clientId = await findClientByName((functionArgs as { name: string }).name, userId);
        return { success: true, data: { clientId }, message: clientId ? 'Client found' : 'Client not found' };
      case "findProjectByName":
        const projectId = await findProjectByName((functionArgs as { name: string }).name, userId);
        return { success: true, data: { projectId }, message: projectId ? 'Project found' : 'Project not found' };
      case "addExpenseToClient":
        return addExpenseToClient(functionArgs as AddExpenseToClientParams, userId);
      case "getCurrentDateTime":
        return getCurrentDateTime(functionArgs as GetCurrentDateTimeParams, userId);
      case "getBusinessContext":
        return getBusinessContext(functionArgs as GetBusinessContextParams, userId);
      case "addQuickExpense":
        return addQuickExpense(functionArgs as AddQuickExpenseParams, userId);
      default:
        return { error: "Unknown function", success: false };
    }
  });
  
  return Promise.all(promises);
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

IMPORTANT: You have access to current date, time, and business context information. Use getCurrentDateTime() and getBusinessContext() functions to provide relevant time-aware assistance. Always consider:
- Current date and time for date-sensitive operations
- Business day vs weekend context
- Month-end, quarter-end, and year-end deadlines
- Financial year periods (April-March)
- Progress through current periods (month, quarter, year)

When interacting, follow these principles:
- Be user-friendly: use clear, simple language. Avoid accounting jargon unless the user prefers it.  
- Be proactive: suggest helpful shortcuts or tips (e.g. "Do you want this expense to recur?").  
- Be time-aware: consider current date/time context and business deadlines when making suggestions.
- Be autonomous: Make reasonable assumptions and only ask for truly essential information. For expenses, default to "Food" category and today's date unless specified otherwise.
- Validate inputs: check if dates are valid, amounts are numeric, required fields are present.  
- SEARCH FIRST: When users mention client names, project names, or other entities, ALWAYS search for them first using searchClients, searchProjects, listClients, or listProjects functions before asking for IDs. Only ask for clarification if no matches are found.
- Auto-complete: If a user says "create invoice for John" - search for clients named John first, then proceed with the invoice creation.
- Minimize questions: Only ask for information that is absolutely critical and cannot be reasonably assumed. Default to sensible values for optional fields.
- Confirm actions: once you act, tell the user what you did and summarize the outcome.  
- Error-aware: if something can't be done because of missing data, permissions, invalid input, etc., explain clearly what's wrong and how to resolve it.  
- Respect permissions and security: do not assume you have rights for actions, avoid exposing private or sensitive data, follow Ledgique's security constraints.

Formatting Guidelines:
- Use clear headings and structure for better readability
- Format currency amounts with ₹ symbol and proper formatting
- Use bullet points for lists and details
- Format dates in a readable format (e.g., September 16, 2025)
- Present data in organized, scannable format
- Use emojis sparingly for visual appeal when appropriate
- Include relevant time context when helpful (e.g., "Today is Monday, September 16, 2025")`;

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
      // Execute all functions in parallel
      const functionCallsData = response.functionCalls.map(fc => ({
        name: fc.name || '',
        args: fc.args || {}
      }));
      
      const functionResults = await executeParallelFunctions(functionCallsData, userId);
      
      // Add function calls and responses to conversation
      contents.push({
        role: "model",
        parts: [{ text: response.text || 'Function calls executed' }]
      });
      
      // Add all function results
      functionResults.forEach((result, index) => {
        const functionName = functionCallsData[index].name;
        contents.push({
          role: "user",
          parts: [{
            text: `Function ${functionName} result: ${JSON.stringify(result)}`
          }]
        });
      });

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
        functionsExecuted: functionCallsData,
        functionResults
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

  } catch {
    console.error("Error processing request");
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}