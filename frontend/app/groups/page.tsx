"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, GitCompareArrows } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { api } from "@/lib/api";
import type { Group } from "@/types/domain";

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [balances, setBalances] = useState<Record<number, unknown>>({});

  const [showModal, setShowModal] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    api<Group[]>("/groups/", { token })
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [router]);

  async function loadBalances(group: Group) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const result = await api(
      `/groups/${group.id}/simplified-debts/`,
      { token }
    );

    setBalances((current) => ({
      ...current,
      [group.id]: result,
    }));
  }
  async function createGroup() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    router.replace("/login");
    return;
  }

  if (!groupName.trim()) {
    setCreateError("Group name is required");
    return;
  }

  try {
    setCreating(true);
    setCreateError("");

    const newGroup = await api<Group>("/groups/", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: groupName,
        description: groupDescription,
        default_currency: 1,
      }),
    });

    setGroups((current) => [...current, newGroup]);

    setGroupName("");
    setGroupDescription("");
    setShowModal(false);
  } catch (error) {
    setCreateError(
      error instanceof Error
        ? error.message
        : "Failed to create group"
    );
  } finally {
    setCreating(false);
  }
}

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Groups</h1>
          <p className="text-sm text-muted-foreground">
            Membership timelines, balances, and debt simplification.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <CalendarDays size={16} />
          New group
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              Create New Group
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              <textarea
                className="w-full rounded-md border border-border p-3 text-sm"
                rows={4}
                placeholder="Description"
                value={groupDescription}
                onChange={(e) =>
                  setGroupDescription(e.target.value)
                }
              />

              {createError && (
                <p className="text-sm text-red-500">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setGroupName("");
                    setGroupDescription("");
                    setCreateError("");
                  }}
                >
                  Cancel
                </Button>

                <Button
  disabled={creating}
  onClick={createGroup}
>
  {creating ? "Creating..." : "Create Group"}
</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-semibold">{group.name}</h2>

                <p className="text-sm text-muted-foreground">
                  {group.default_currency_code}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => loadBalances(group)}
              >
                <GitCompareArrows size={16} />
                Simplify
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-2">Member</th>
                      <th>Joined</th>
                      <th>Left</th>
                    </tr>
                  </thead>

                  <tbody>
                    {group.memberships.map((member) => (
                      <tr
                        key={member.id}
                        className="border-t border-border"
                      >
                        <td className="py-2">
                          {member.user_name ||
                            member.user_email}
                        </td>

                        <td>
                          {new Date(
                            member.joined_at
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          {member.left_at
                            ? new Date(
                                member.left_at
                              ).toLocaleDateString()
                            : "Active"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {balances[group.id] ? (
                <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(
                    balances[group.id],
                    null,
                    2
                  )}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 ? (
          <Card>
            <CardContent>
              No groups yet.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}