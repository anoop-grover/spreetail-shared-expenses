"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileUp, Home, Users, LogOut, Wallet } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.replace("/login");
  }

  const links = [
    { href: "/dashboard", label: "Dashboard",  icon: Home  },
    { href: "/groups",    label: "Groups",      icon: Users },
    { href: "/imports",   label: "CSV Import",  icon: FileUp },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .shell-root {
          min-height: 100vh;
          background: #F3F6FD;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar ── */
        .sidebar {
          position: fixed;
          inset-block: 0;
          left: 0;
          width: 260px;
          background: #fff;
          border-right: 1px solid #DDE3F0;
          display: none;
          flex-direction: column;
          z-index: 40;
        }
        @media (min-width: 768px) { .sidebar { display: flex; } }

        /* Logo */
        .sidebar-logo {
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid #DDE3F0;
          display: flex;
          align-items: center;
          gap: .875rem;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,.30);
        }
        .logo-name {
          font-size: .95rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -.02em;
          line-height: 1.2;
        }
        .logo-sub {
          font-size: .7rem;
          color: #94A3B8;
          font-weight: 500;
          margin-top: .1rem;
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 1rem .875rem;
          display: flex;
          flex-direction: column;
          gap: .25rem;
        }
        .nav-label {
          font-size: .6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #CBD5E1;
          padding: .5rem .625rem .25rem;
          margin-top: .25rem;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: .75rem;
          padding: .675rem .875rem;
          border-radius: 12px;
          font-size: .825rem;
          font-weight: 600;
          color: #64748B;
          text-decoration: none;
          transition: background .15s, color .15s;
        }
        .nav-link:hover {
          background: #F8FAFF;
          color: #1E2A45;
        }
        .nav-link.active {
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,.28);
        }
        .nav-link .nav-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,.15);
          transition: background .15s;
        }
        .nav-link:not(.active) .nav-icon {
          background: #EEF2FF;
          color: #6366F1;
        }
        .nav-link.active .nav-icon {
          background: rgba(255,255,255,.20);
          color: #fff;
        }

        /* User section */
        .sidebar-footer {
          padding: 1rem .875rem;
          border-top: 1px solid #DDE3F0;
        }
        .user-card {
          background: #F8FAFF;
          border: 1px solid #EEF2FF;
          border-radius: 12px;
          padding: .75rem 1rem;
          margin-bottom: .75rem;
          display: flex;
          align-items: center;
          gap: .75rem;
        }
        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .8rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .user-name  { font-size: .825rem; font-weight: 700; color: #1E2A45; }
        .user-email { font-size: .7rem;   color: #94A3B8;   margin-top: .1rem; }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: .75rem;
          width: 100%;
          padding: .625rem .875rem;
          border-radius: 12px;
          font-size: .825rem;
          font-weight: 600;
          color: #64748B;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background .15s, color .15s;
        }
        .logout-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
        }
        .logout-btn .nav-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .15s;
        }
        .logout-btn:hover .nav-icon {
          background: #FEE2E2;
          color: #DC2626;
        }

        /* Main */
        .shell-main {
          padding-left: 0;
        }
        @media (min-width: 768px) { .shell-main { padding-left: 260px; } }

        .shell-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.75rem 1.25rem;
        }
        @media (min-width: 768px) { .shell-content { padding: 2.5rem; } }
      `}</style>

      <div className="shell-root">
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon"><Wallet size={18} /></div>
            <div>
              <div className="logo-name">FairShare</div>
              <div className="logo-sub">Expense Management</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`nav-link${active ? " active" : ""}`}>
                  <span className="nav-icon"><Icon size={15} /></span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">A</div>
              <div>
                <div className="user-name">Admin User</div>
                <div className="user-email">admin@example.com</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <span className="nav-icon"><LogOut size={15} /></span>
              Logout
            </button>
          </div>
        </aside>

        <main className="shell-main">
          <div className="shell-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}