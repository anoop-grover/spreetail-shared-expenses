"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp, Home, Users, LogOut } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-white p-4 md:block">
        <div className="mb-8 text-lg font-semibold">
          Shared Expenses
        </div>

        <nav className="space-y-1 text-sm">
          <Link
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
            href="/dashboard"
          >
            <Home size={16} />
            Dashboard
          </Link>

          <Link
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
            href="/groups"
          >
            <Users size={16} />
            Groups
          </Link>

          <Link
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
            href="/imports"
          >
            <FileUp size={16} />
            CSV Import
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}