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
      accent: "#3B82F6",
      bg: "#EEF2FF",
    },
    {
      label: "Expenses",
      value: summary?.expenses ?? 0,
      icon: Receipt,
      subtitle: "Tracked Expenses",
      accent: "#F59E0B",
      bg: "#FFFBEB",
    },
    {
      label: "Total Spend",
      value: `₹${summary?.total_expense_amount ?? "0"}`,
      icon: IndianRupee,
      subtitle: "Across All Groups",
      accent: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Settlements",
      value: summary?.settlements ?? 0,
      icon: ArrowLeftRight,
      subtitle: "Recorded",
      accent: "#8B5CF6",
      bg: "#F5F3FF",
    },
    {
      label: "Imports",
      value: summary?.imports ?? 0,
      icon: FileSpreadsheet,
      subtitle: "CSV Uploads",
      accent: "#EF4444",
      bg: "#FEF2F2",
    },
  ];

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .dash-hero {
          margin-bottom: 2rem;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 60%, #818CF8 100%);
          box-shadow: 0 8px 32px rgba(99,102,241,0.25);
          padding: 2.5rem;
          color: white;
          position: relative;
        }

        .dash-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .dash-hero::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 30%;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .dash-hero h1 {
          font-size: 1.875rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 0.625rem;
        }

        .dash-hero p {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
          max-width: 520px;
          line-height: 1.6;
        }

        .hero-actions {
          margin-top: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #FFFFFF;
          color: #1E2A45;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1.1rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .hero-btn-primary:hover { background: #F0F4FF; transform: translateY(-1px); }

        .hero-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.12);
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1.1rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.25);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
        }

        .hero-btn-outline:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); }

        /* Metric cards */
        .metrics-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1280px) {
          .metrics-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .metric-card {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 16px;
          padding: 1.25rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.1);
        }

        .metric-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }

        .metric-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.03em;
          margin-top: 0.25rem;
          line-height: 1;
        }

        .metric-subtitle {
          font-size: 0.7rem;
          color: #94A3B8;
          margin-top: 0.35rem;
        }

        /* Feature cards */
        .feature-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 1024px) {
          .feature-grid { grid-template-columns: 1fr 1fr; }
        }

        .feature-card {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 16px;
          padding: 1.5rem;
          transition: box-shadow 0.15s;
        }

        .feature-card:hover {
          box-shadow: 0 8px 24px rgba(99,102,241,0.08);
        }

        .feature-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .feature-icon {
          width: 36px; height: 36px;
          background: #EEF2FF;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #6366F1;
          flex-shrink: 0;
        }

        .feature-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1E2A45;
          letter-spacing: -0.01em;
        }

        .feature-desc {
          font-size: 0.825rem;
          color: #64748B;
          line-height: 1.5;
          margin-bottom: 0.875rem;
        }

        .feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .feature-list li {
          font-size: 0.8rem;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feature-list li::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          flex-shrink: 0;
        }

        /* Insights */
        .insights-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
          margin-bottom: 1.5rem;
        }

        @media (min-width: 1280px) {
          .insights-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .insight-card {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .insight-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
        }

        .insight-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.025em;
          margin-top: 0.4rem;
          line-height: 1;
        }

        .insight-sub {
          font-size: 0.72rem;
          color: #94A3B8;
          margin-top: 0.35rem;
        }

        /* Activity */
        .activity-card {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .activity-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1E2A45;
          letter-spacing: -0.01em;
          margin-bottom: 1rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F8FAFF;
          border: 1px solid #EEF2FF;
          border-radius: 12px;
          padding: 0.875rem 1rem;
        }

        .activity-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1E2A45;
        }

        .activity-sub {
          font-size: 0.75rem;
          color: #94A3B8;
          margin-top: 0.15rem;
        }

        .activity-badge {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6366F1;
          background: #EEF2FF;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }

        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          margin-bottom: 0.75rem;
        }
      `}</style>

      {/* Hero */}
      <div className="dash-hero">
        <h1>Shared Expense<br />Management</h1>
        <p>Track expenses, settlements, balances, imports, and audit history from one centralized platform.</p>
        <div className="hero-actions">
          <Link href="/groups" className="hero-btn-primary">
            <Plus size={14} /> Create Group
          </Link>
          <Link href="/imports" className="hero-btn-outline">
            <Upload size={14} /> Import CSV
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <p className="section-label">Overview</p>
      <div className="metrics-grid">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div className="metric-card" key={m.label}>
              <div className="metric-icon-wrap" style={{ background: m.bg }}>
                <Icon size={18} style={{ color: m.accent }} />
              </div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-subtitle">{m.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Feature Cards */}
      <p className="section-label">Platform Capabilities</p>
      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-card-header">
            <div className="feature-icon"><Activity size={18} /></div>
            <span className="feature-title">Balance Engine</span>
          </div>
          <p className="feature-desc">Calculates balances across all expenses and settlements in real time.</p>
          <ul className="feature-list">
            <li>Join/Leave Membership Aware</li>
            <li>Settlement Aware</li>
            <li>Full Audit Trace Support</li>
            <li>Debt Simplification Engine</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <div className="feature-icon"><ShieldCheck size={18} /></div>
            <span className="feature-title">CSV Import Pipeline</span>
          </div>
          <p className="feature-desc">Import expense history with automated anomaly detection and review workflows.</p>
          <ul className="feature-list">
            <li>Validation Rules</li>
            <li>Duplicate Detection</li>
            <li>Membership Checks</li>
            <li>Import Reporting</li>
          </ul>
        </div>
      </div>

      {/* Quick Insights */}
      <p className="section-label">Quick Insights</p>
      <div className="insights-grid">
        {[
          { label: "Most Active Area", value: "Groups", sub: `${summary?.groups ?? 0} managed groups` },
          { label: "Expense Records", value: summary?.expenses ?? 0, sub: "Transactions tracked" },
          { label: "Total Imported", value: summary?.imports ?? 0, sub: "CSV sessions processed" },
          { label: "Settlement Activity", value: summary?.settlements ?? 0, sub: "Recorded settlements" },
        ].map((item) => (
          <div className="insight-card" key={item.label}>
            <div className="insight-label">{item.label}</div>
            <div className="insight-value">{item.value}</div>
            <div className="insight-sub">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <p className="section-label">Recent Activity</p>
      <div className="activity-card">
        <div className="activity-list">
          {[
            { name: "Expense Created", sub: "Pizza Party Expense Added" },
            { name: "Settlement Recorded", sub: "Partial repayment processed" },
            { name: "CSV Import Completed", sub: "Import session finished successfully" },
          ].map((item) => (
            <div className="activity-item" key={item.name}>
              <div>
                <div className="activity-name">{item.name}</div>
                <div className="activity-sub">{item.sub}</div>
              </div>
              <span className="activity-badge">Recent</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}