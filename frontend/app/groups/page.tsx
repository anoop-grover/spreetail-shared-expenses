"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, X } from "lucide-react";

import { AppShell } from "@/components/app-shell";
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
    if (!token) { router.replace("/login"); return; }
    api<Group[]>("/groups/", { token })
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [router]);

  async function createGroup() {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login"); return; }
    if (!groupName.trim()) { setCreateError("Group name is required"); return; }
    try {
      setCreating(true);
      setCreateError("");
      const newGroup = await api<Group>("/groups/", {
        method: "POST",
        token,
        body: JSON.stringify({ name: groupName, description: groupDescription, default_currency: 1 }),
      });
      setGroups((curr) => [...curr, newGroup]);
      setGroupName("");
      setGroupDescription("");
      setShowModal(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setGroupName("");
    setGroupDescription("");
    setCreateError("");
  }

  if (loading) {
    return (
      <AppShell>
        <style>{`
          .loading-wrap {
            display: flex; align-items: center; justify-content: center;
            min-height: 40vh; gap: 0.75rem;
          }
          .loading-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #6366F1;
            animation: bounce 1.2s ease-in-out infinite;
          }
          .loading-dot:nth-child(2) { animation-delay: 0.2s; }
          .loading-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-10px); opacity: 1; }
          }
        `}</style>
        <div className="loading-wrap">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* ── Page header ── */
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .page-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6366F1;
          margin-bottom: 0.35rem;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .page-sub {
          margin-top: 0.35rem;
          font-size: 0.875rem;
          color: #94A3B8;
        }

        .new-group-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          color: white;
          font-size: 0.825rem;
          font-weight: 600;
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(99,102,241,0.28);
          transition: opacity 0.15s, transform 0.1s;
        }

        .new-group-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ── Group cards ── */
        .groups-list { display: flex; flex-direction: column; gap: 1rem; }

        .group-card {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 16px;
          padding: 1.5rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .group-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.1);
        }

        .group-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .group-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1E2A45;
          letter-spacing: -0.02em;
        }

        .group-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.5rem;
        }

        .badge-currency {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #EEF2FF;
          color: #6366F1;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }

        .badge-members {
          font-size: 0.65rem;
          font-weight: 600;
          background: #F1F5F9;
          color: #64748B;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }

        .group-desc {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #94A3B8;
          line-height: 1.5;
        }

        .open-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #F8FAFF;
          border: 1px solid #DDE3F0;
          color: #1E2A45;
          font-size: 0.775rem;
          font-weight: 600;
          padding: 0.45rem 0.9rem;
          border-radius: 9px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }

        .open-btn:hover {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: #6366F1;
        }

        .group-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .stat-box {
          background: #F8FAFF;
          border: 1px solid #EEF2FF;
          border-radius: 12px;
          padding: 0.875rem 1rem;
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.025em;
          margin-top: 0.3rem;
          line-height: 1;
        }

        .stat-value.active { color: #10B981; font-size: 1rem; }

        /* ── Empty state ── */
        .empty-state {
          background: #FFFFFF;
          border: 1px dashed #C7D2FE;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          width: 56px; height: 56px;
          background: #EEF2FF;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
          color: #6366F1;
        }

        .empty-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1E2A45;
          margin-bottom: 0.4rem;
        }

        .empty-sub {
          font-size: 0.85rem;
          color: #94A3B8;
          margin-bottom: 1.5rem;
        }

        /* ── Modal ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(15,22,41,0.45);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }

        .modal-box {
          background: #FFFFFF;
          border: 1px solid #DDE3F0;
          border-radius: 20px;
          padding: 2rem;
          width: 100%; max-width: 440px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.15);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1E2A45;
          letter-spacing: -0.02em;
        }

        .modal-close {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: #F1F5F9;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #64748B;
          transition: background 0.15s;
        }

        .modal-close:hover { background: #EEF2FF; color: #6366F1; }

        .modal-fields { display: flex; flex-direction: column; gap: 0.875rem; }

        .modal-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748B;
          margin-bottom: 0.35rem;
        }

        .modal-input {
          width: 100%;
          background: #F8FAFF !important;
          border: 1px solid #DDE3F0 !important;
          border-radius: 10px !important;
          color: #1E2A45 !important;
          font-size: 0.875rem !important;
          padding: 0.65rem 0.875rem !important;
          height: auto !important;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .modal-input::placeholder { color: #CBD5E1 !important; }

        .modal-input:focus {
          outline: none !important;
          border-color: #6366F1 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }

        .modal-textarea {
          width: 100%;
          background: #F8FAFF;
          border: 1px solid #DDE3F0;
          border-radius: 10px;
          color: #1E2A45;
          font-size: 0.875rem;
          padding: 0.65rem 0.875rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .modal-textarea::placeholder { color: #CBD5E1; }

        .modal-textarea:focus {
          outline: none;
          border-color: #6366F1;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .modal-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 0.65rem 0.875rem;
          font-size: 0.8rem;
          color: #EF4444;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.625rem;
          margin-top: 0.5rem;
        }

        .btn-cancel {
          padding: 0.5rem 1rem;
          font-size: 0.825rem;
          font-weight: 600;
          color: #64748B;
          background: #F1F5F9;
          border: 1px solid #DDE3F0;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }

        .btn-cancel:hover { background: #E2E8F0; }

        .btn-create {
          padding: 0.5rem 1.25rem;
          font-size: 0.825rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #3B82F6, #6366F1);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99,102,241,0.28);
          transition: opacity 0.15s;
          font-family: inherit;
        }

        .btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-create:not(:disabled):hover { opacity: 0.9; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Manage</p>
          <h1 className="page-title">Groups</h1>
          <p className="page-sub">Manage members, balances, and debt simplification.</p>
        </div>
        <button className="new-group-btn" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Group
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Create New Group</span>
              <button className="modal-close" onClick={closeModal}><X size={15} /></button>
            </div>

            <div className="modal-fields">
              <div>
                <label className="modal-label">Group Name</label>
                <Input
                  className="modal-input"
                  placeholder="e.g. Goa Trip 2025"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="modal-label">Description</label>
                <textarea
                  rows={3}
                  className="modal-textarea"
                  placeholder="Optional description..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>

              {createError && <div className="modal-error">⚠ {createError}</div>}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button className="btn-create" disabled={creating} onClick={createGroup}>
                  {creating ? "Creating…" : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.length > 0 ? (
        <div className="groups-list">
          {groups.map((group) => (
            <div className="group-card" key={group.id}>
              <div className="group-card-top">
                <div>
                  <div className="group-name">{group.name}</div>
                  <div className="group-badges">
                    <span className="badge-currency">{group.default_currency_code}</span>
                    <span className="badge-members">{group.memberships.length} Members</span>
                  </div>
                  <p className="group-desc">{group.description || "No description provided."}</p>
                </div>
                <button className="open-btn" onClick={() => router.push(`/groups/${group.id}`)}>
                  Open →
                </button>
              </div>

              <div className="group-stats">
                <div className="stat-box">
                  <div className="stat-label">Members</div>
                  <div className="stat-value">{group.memberships.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Currency</div>
                  <div className="stat-value">{group.default_currency_code}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Status</div>
                  <div className="stat-value active">Active</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Users size={24} /></div>
          <div className="empty-title">No Groups Yet</div>
          <p className="empty-sub">Create your first group to start tracking expenses.</p>
          <button className="new-group-btn" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Create Your First Group
          </button>
        </div>
      )}
    </AppShell>
  );
}