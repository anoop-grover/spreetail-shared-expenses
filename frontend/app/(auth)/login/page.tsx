"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const PREVIEW_EXPENSES = [
  { who: "Rahul", what: "Dinner at Dhaba", amount: "₹1,240", split: 4, color: "#3B82F6" },
  { who: "Priya", what: "Cab to airport", amount: "₹680", split: 3, color: "#8B5CF6" },
  { who: "You", what: "Hotel booking", amount: "₹4,500", split: 2, color: "#10B981" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api<{ access: string; refresh: string }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("accessToken", result.access);
      localStorage.setItem("refreshToken", result.refresh);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100svh;
          background: #F0F4FF;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #DDE3F0;
          background: #FFFFFF;
          box-shadow: 0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04);
        }

        @media (min-width: 900px) {
          .login-card { grid-template-columns: 1fr 1fr; }
        }

        /* ── Left panel ── */
        .left-panel {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          background: linear-gradient(160deg, #EEF2FF 0%, #E8F0FF 60%, #F0F4FF 100%);
          border-right: 1px solid #DDE3F0;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 900px) {
          .left-panel { display: flex; }
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -80px; left: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -60px;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }

        .brand-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1E2A45;
          letter-spacing: -0.01em;
        }

        .left-headline {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0;
        }

        .left-headline h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #1E2A45;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }

        .left-headline h1 span {
          background: linear-gradient(90deg, #3B82F6, #6366F1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-headline p {
          font-size: 0.875rem;
          color: #64748B;
          line-height: 1.6;
          max-width: 280px;
        }

        /* Expense preview cards */
        .expense-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .expense-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          margin-bottom: 0.25rem;
        }

        .expense-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(59,130,246,0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          backdrop-filter: blur(4px);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .expense-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .expense-info {
          flex: 1;
          min-width: 0;
        }

        .expense-who {
          font-size: 0.7rem;
          color: #94A3B8;
          margin-bottom: 0.1rem;
        }

        .expense-what {
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .expense-right {
          text-align: right;
          flex-shrink: 0;
        }

        .expense-amount {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1E2A45;
        }

        .expense-split {
          font-size: 0.65rem;
          color: #94A3B8;
        }

        /* ── Right panel ── */
        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          background: #FFFFFF;
        }

        .form-wrap {
          width: 100%;
          max-width: 360px;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6366F1;
          margin-bottom: 0.5rem;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }

        .form-subtitle {
          margin-top: 0.4rem;
          font-size: 0.825rem;
          color: #94A3B8;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748B;
          margin-bottom: 0.35rem;
        }

        .custom-input {
          width: 100%;
          background: #F8FAFF !important;
          border: 1px solid #DDE3F0 !important;
          border-radius: 10px !important;
          color: #1E2A45 !important;
          font-size: 0.875rem !important;
          padding: 0.65rem 0.875rem !important;
          height: auto !important;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }

        .custom-input::placeholder { color: #CBD5E1 !important; }

        .custom-input:focus {
          outline: none !important;
          border-color: #6366F1 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }

        .error-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: #EF4444;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3B82F6, #6366F1) !important;
          border: none !important;
          border-radius: 10px !important;
          color: white !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          height: 44px !important;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: inherit;
          margin-top: 0.25rem;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.38);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0 1rem;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #EEF2FF;
        }

        .divider-text {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #CBD5E1;
        }

        .demo-box {
          background: #F8FAFF;
          border: 1px solid #DDE3F0;
          border-radius: 10px;
          padding: 0.875rem 1rem;
        }

        .demo-title {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          margin-bottom: 0.5rem;
        }

        .demo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }

        .demo-key {
          font-size: 0.75rem;
          color: #94A3B8;
        }

        .demo-val {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748B;
          font-family: 'SF Mono', 'Fira Code', monospace;
          background: #EEF2FF;
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
        }
      `}</style>

      <main className="login-root">
        <div className="login-card">

          {/* ── Left panel ── */}
          <div className="left-panel">
            <div className="brand-mark">
              <div className="brand-icon">⚡</div>
              <span className="brand-name">FairShare</span>
            </div>

            <div className="left-headline">
              <h1>Split bills,<br />not <span>friendships</span>.</h1>
              <p>Track every shared expense, settle balances instantly, and keep your group finances transparent.</p>
            </div>

            <div className="expense-preview">
              <p className="expense-label">Recent activity</p>
              {PREVIEW_EXPENSES.map((e, i) => (
                <div className="expense-item" key={i}>
                  <div className="expense-dot" style={{ background: e.color }} />
                  <div className="expense-info">
                    <div className="expense-who">{e.who} added</div>
                    <div className="expense-what">{e.what}</div>
                  </div>
                  <div className="expense-right">
                    <div className="expense-amount">{e.amount}</div>
                    <div className="expense-split">÷ {e.split} people</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="right-panel">
            <div className="form-wrap">
              <div className="form-header">
                <p className="form-eyebrow">Secure login</p>
                <h2 className="form-title">Welcome back</h2>
                <p className="form-subtitle">Sign in to your account to continue.</p>
              </div>

              <form className="form-fields" onSubmit={submit}>
                <div>
                  <label className="field-label" htmlFor="email">Email</label>
                  <Input
                    id="email"
                    className="custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="password">Password</label>
                  <Input
                    id="password"
                    className="custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="error-box">
                    <span>⚠</span> {error}
                  </div>
                )}

                <Button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in →"}
                </Button>
              </form>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">Demo</span>
                <div className="divider-line" />
              </div>

              <div className="demo-box">
                <p className="demo-title">Try it out</p>
                <div className="demo-row">
                  <span className="demo-key">Email</span>
                  <span className="demo-val">admin@example.com</span>
                </div>
                <div className="demo-row">
                  <span className="demo-key">Password</span>
                  <span className="demo-val">Password123!</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}