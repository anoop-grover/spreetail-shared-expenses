"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api, demoToken } from "@/lib/api";

type Summary = { groups: number; expenses: number; total_expense_amount: string; settlements: number; imports: number };

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>("/reports/summary/", { token: demoToken() }).then(setSummary).catch(() => setSummary({ groups: 0, expenses: 0, total_expense_amount: "0", settlements: 0, imports: 0 }));
  }, []);

  const metrics = [
    ["Groups", summary?.groups ?? 0],
    ["Expenses", summary?.expenses ?? 0],
    ["Total Spend", summary?.total_expense_amount ?? "0"],
    ["Settlements", summary?.settlements ?? 0],
    ["Imports", summary?.imports ?? 0]
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track shared spending, balances, imports, and audit-ready settlement activity.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="py-3 text-sm text-muted-foreground">{label}</CardHeader>
            <CardContent className="text-2xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Balance Engine</h2></CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">Calculations respect join and leave dates, include settlements, and return trace rows for every net balance movement.</CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">CSV Import</h2></CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">Uploads are parsed, validated, reviewed, and reported without relying on unavailable official CSV contents.</CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
