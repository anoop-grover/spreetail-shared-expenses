"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { api } from "@/lib/api";
import type { Group } from "@/types/domain";

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

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
    .catch(() => setGroups([]))
    .finally(() => setLoading(false));
}, [router]);

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

  if (loading) {
  return (
    <AppShell>
      <div className="p-8">
        Loading groups...
      </div>
    </AppShell>
  );
}

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Groups
          </h1>

          <p className="mt-2 text-slate-500">
            Manage members, balances, and debt
            simplification.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <CalendarDays size={16} />
          New Group
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-semibold">
              Create New Group
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) =>
                  setGroupName(e.target.value)
                }
              />

              <textarea
                rows={4}
                placeholder="Description"
                value={groupDescription}
                onChange={(e) =>
                  setGroupDescription(
                    e.target.value
                  )
                }
                className="w-full rounded-md border p-3 text-sm"
              />

              {createError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {createError}
                </div>
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
                  {creating
                    ? "Creating..."
                    : "Create Group"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


            <div className="grid gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {group.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {group.default_currency_code}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                    {group.memberships.length} Members
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {group.description || "No description provided."}
                </p>
              </div>

              <Button
  className="cursor-pointer"
  onClick={() =>
    router.push(`/groups/${group.id}`)
  }
>
  Open Group
</Button>
            </CardHeader>

            <CardContent>
  <div className="grid gap-3 md:grid-cols-3">

    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-500">
        Members
      </div>

      <div className="mt-1 text-2xl font-bold">
        {group.memberships.length}
      </div>
    </div>

    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-500">
        Currency
      </div>

      <div className="mt-1 text-2xl font-bold">
        {group.default_currency_code}
      </div>
    </div>

    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-500">
        Status
      </div>

      <div className="mt-1 text-lg font-bold text-green-600">
        Active
      </div>
    </div>

  </div>
</CardContent>
          </Card>
        ))}
      </div>
    {groups.length === 0 && (
  <Card>
    <CardContent className="py-12 text-center">
      <h3 className="text-lg font-semibold">
        No Groups Yet
      </h3>

      <p className="mt-2 text-slate-500">
        Create your first group to start tracking expenses.
      </p>
    </CardContent>
  </Card>
)}
    </AppShell>
  );
}