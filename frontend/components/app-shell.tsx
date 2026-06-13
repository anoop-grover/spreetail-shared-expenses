import Link from "next/link";
import { FileUp, Home, Users } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-white p-4 md:block">
        <div className="mb-8 text-lg font-semibold">Shared Expenses</div>
        <nav className="space-y-1 text-sm">
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/dashboard"><Home size={16} /> Dashboard</Link>
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/groups"><Users size={16} /> Groups</Link>
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/imports"><FileUp size={16} /> CSV Import</Link>
        </nav>
      </aside>
      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
