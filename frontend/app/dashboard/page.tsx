"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Receipt,
  IndianRupee,
  ArrowLeftRight,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  CheckCircle,
  Plus,
  Upload,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";

type Summary = {
  groups: number;
  expenses: number;
  total_expense_amount: string;
  settlements: number;
  imports: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    api<Summary>("/reports/summary/", { token })
      .then(setSummary)
      .catch(() =>
        setSummary({
          groups: 0,
          expenses: 0,
          total_expense_amount: "0",
          settlements: 0,
          imports: 0,
        })
      );
  }, [router]);

  const metrics = [
    {
      label: "Groups",
      value: summary?.groups ?? 0,
      icon: Users,
      subtitle: "Active Groups",
      bg: "bg-blue-50",
    },
    {
      label: "Expenses",
      value: summary?.expenses ?? 0,
      icon: Receipt,
      subtitle: "Tracked Expenses",
      bg: "bg-orange-50",
    },
    {
      label: "Total Spend",
      value: `₹${summary?.total_expense_amount ?? "0"}`,
      icon: IndianRupee,
      subtitle: "Across All Groups",
      bg: "bg-green-50",
    },
    {
      label: "Settlements",
      value: summary?.settlements ?? 0,
      icon: ArrowLeftRight,
      subtitle: "Recorded",
      bg: "bg-purple-50",
    },
    {
      label: "Imports",
      value: summary?.imports ?? 0,
      icon: FileSpreadsheet,
      subtitle: "CSV Uploads",
      bg: "bg-red-50",
    },
  ];

  return (
    <AppShell>
      {/* Hero Section */}
      <Card className="mb-8 border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-xl">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold">
            Shared Expense Management
          </h1>

          <p className="mt-3 max-w-2xl text-slate-200">
            Track expenses, settlements, balances, imports,
            membership timelines, and audit history from one
            centralized platform.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/groups">
              <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                <Plus size={16} />
                Create Group
              </button>
            </Link>

            <Link href="/imports">
              <button className="flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm transition hover:bg-white/10">
                <Upload size={16} />
                Import CSV
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.label}
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`rounded-xl p-3 ${metric.bg}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  {metric.label}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {metric.value}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {metric.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Feature Cards */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Activity
                className="text-primary"
                size={20}
              />

              <h2 className="text-lg font-semibold">
                Balance Engine
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Calculates balances across all expenses and
              settlements.
            </p>

            <ul className="space-y-2">
              <li>✓ Join/Leave Membership Aware</li>
              <li>✓ Settlement Aware</li>
              <li>✓ Full Audit Trace Support</li>
              <li>✓ Debt Simplification Engine</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="text-primary"
                size={20}
              />

              <h2 className="text-lg font-semibold">
                CSV Import Pipeline
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Import expense history with automated anomaly
              detection and review workflows.
            </p>

            <ul className="space-y-2">
              <li>✓ Validation Rules</li>
              <li>✓ Duplicate Detection</li>
              <li>✓ Membership Checks</li>
              <li>✓ Import Reporting</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Quick Insights */}
      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">
              Most Active Area
            </p>

            <h3 className="mt-2 text-xl font-bold">
              Groups
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {summary?.groups ?? 0} managed groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">
              Expense Records
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {summary?.expenses ?? 0}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Transactions tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">
              Total Imported
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {summary?.imports ?? 0}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              CSV sessions processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">
              Settlement Activity
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {summary?.settlements ?? 0}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Recorded settlements
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Recent Activity
            </h2>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  Expense Created
                </p>

                <p className="text-sm text-slate-500">
                  Pizza Party Expense Added
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Recent
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  Settlement Recorded
                </p>

                <p className="text-sm text-slate-500">
                  Partial repayment processed
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Recent
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  CSV Import Completed
                </p>

                <p className="text-sm text-slate-500">
                  Import session finished successfully
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Recent
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}