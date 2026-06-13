"use client";

import { useState } from "react";
import { FileUp, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api, demoToken } from "@/lib/api";
import type { ImportSession } from "@/types/domain";

export default function ImportsPage() {
  const [session, setSession] = useState<ImportSession | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await api<ImportSession>("/imports/", { method: "POST", body: formData, token: demoToken() });
    setSession(result);
  }

  async function review(action: "import" | "merge" | "keep_both" | "ignore") {
    if (!session) return;
    const actions = session.anomalies.map((item) => ({ row_number: item.row_number, action }));
    const result = await api<ImportSession>(`/imports/${session.id}/review/`, { method: "POST", body: JSON.stringify({ actions }), token: demoToken() });
    setSession(result);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">CSV Import</h1>
        <p className="text-sm text-muted-foreground">Parse, validate, detect anomalies, review, import, and report.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Upload CSV</h2>
          <Button onClick={upload}><FileUp size={16} /> Upload</Button>
        </CardHeader>
        <CardContent>
          <input className="block w-full rounded-md border border-border p-2 text-sm" type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </CardContent>
      </Card>
      {session ? (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="font-semibold">{session.original_filename}</h2>
              <p className="text-sm text-muted-foreground">{session.status}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => review("keep_both")}><ShieldCheck size={16} /> Keep both</Button>
              <Button variant="outline" onClick={() => review("merge")}>Merge</Button>
              <Button variant="destructive" onClick={() => review("ignore")}>Ignore</Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="mb-4 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(session.report, null, 2)}</pre>
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground"><tr><th className="py-2">Row</th><th>Severity</th><th>Code</th><th>Message</th></tr></thead>
              <tbody>
                {session.anomalies.map((anomaly) => (
                  <tr className="border-t border-border" key={anomaly.id}>
                    <td className="py-2">{anomaly.row_number}</td>
                    <td>{anomaly.severity}</td>
                    <td>{anomaly.code}</td>
                    <td>{anomaly.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
