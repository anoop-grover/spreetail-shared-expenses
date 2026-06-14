"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileUp,
  Home,
  Users,
  LogOut,
  Wallet,
} from "lucide-react";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.replace("/login");
  }

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/groups",
      label: "Groups",
      icon: Users,
    },
    {
      href: "/imports",
      label: "CSV Import",
      icon: FileUp,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white md:flex md:flex-col">
        {/* Logo */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2 text-white">
              <Wallet size={20} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                Shared Expenses
              </h1>

              <p className="text-xs text-slate-500">
                Expense Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {links.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">
              Admin User
            </p>

            <p className="text-xs text-slate-500">
              admin@example.com
            </p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="md:pl-72">
        <div className="mx-auto max-w-7xl p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}