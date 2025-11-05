"use client";
import { useState } from "react";
import Link from "next/link";
import {
  IconCreditCardPay,
  IconUsers,
  IconChartBar,
  IconBriefcase,
  IconReceipt,
  IconArrowRight,
} from "@tabler/icons-react";

const reportTypes = [
  {
    id: "payments",
    title: "Payment Reports",
    description: "View detailed payment analytics, revenue trends, and payment method breakdowns",
    href: "/reports/payments",
    icon: <IconCreditCardPay className="h-8 w-8" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "clients",
    title: "Client Reports",
    description: "Analyze client activity, revenue by client, and client acquisition trends",
    href: "/reports/clients",
    icon: <IconUsers className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "growth",
    title: "Growth Reports",
    description: "Track business growth, revenue trends, and year-over-year comparisons",
    href: "/reports/growth",
    icon: <IconChartBar className="h-8 w-8" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "projects",
    title: "Project Reports",
    description: "Project performance metrics, completion rates, and project profitability",
    href: "/reports/projects",
    icon: <IconBriefcase className="h-8 w-8" />,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "expenses",
    title: "Expense Reports",
    description: "Expense tracking, category breakdowns, and expense trends",
    href: "/reports/expenses",
    icon: <IconReceipt className="h-8 w-8" />,
    color: "from-red-500 to-rose-500",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-gray-50 p-2 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Access comprehensive analytics and insights for your business
            </p>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Link
              key={report.id}
              href={report.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] dark:bg-neutral-800 dark:border-neutral-700"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${report.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${report.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {report.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 dark:text-gray-400">
                  {report.description}
                </p>
                
                <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white transition-colors">
                  <span>View Report</span>
                  <IconArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Preview */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
            Quick Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a report type above to view detailed analytics and insights for your business.
            Reports are updated in real-time and provide comprehensive data visualization.
          </p>
        </div>
      </div>
    </div>
  );
}

