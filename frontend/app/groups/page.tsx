"use client";

import { useEffect, useState } from "react";
import { CalendarDays, GitCompareArrows } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, demoToken } from "@/lib/api";
import type { Group } from "@/types/domain";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [balances, setBalances] = useState<Record<number, unknown>>({});

  useEffect(() => {
    api<Group[]>("/groups/", { token: demoToken() }).then(setGroups).catch(() => setGroups([]));
  }, []);

  async function loadBalances(group: Group) {
    const result = await api(`/groups/${group.id}/simplified-debts/`, { token: demoToken() });
    setBalances((current) => ({ ...current, [group.id]: result }));
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Groups</h1>
          <p className="text-sm text-muted-foreground">Membership timelines, balances, and debt simplification.</p>
        </div>
        <Button><CalendarDays size={16} /> New group</Button>
      </div>
      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-semibold">{group.name}</h2>
                <p className="text-sm text-muted-foreground">{group.default_currency_code}</p>
              </div>
              <Button variant="outline" onClick={() => loadBalances(group)}><GitCompareArrows size={16} /> Simplify</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground"><tr><th className="py-2">Member</th><th>Joined</th><th>Left</th></tr></thead>
                  <tbody>
                    {group.memberships.map((member) => (
                      <tr className="border-t border-border" key={member.id}>
                        <td className="py-2">{member.user_name || member.user_email}</td>
                        <td>{new Date(member.joined_at).toLocaleDateString()}</td>
                        <td>{member.left_at ? new Date(member.left_at).toLocaleDateString() : "Active"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {balances[group.id] ? <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(balances[group.id], null, 2)}</pre> : null}
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 ? <Card><CardContent>No groups yet.</CardContent></Card> : null}
      </div>
    </AppShell>
  );
}
