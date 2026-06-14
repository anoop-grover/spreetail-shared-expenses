"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { Group } from "@/types/domain";
import {
  UserPlus, Plus, TrendingUp, BarChart2, ArrowLeftRight,
  Trash2, X, ChevronLeft, Users, Receipt, IndianRupee, Activity
} from "lucide-react";

type Expense = {
  id: number;
  group: number;
  description: string;
  amount: string;
  expense_date: string;
  paid_by: number;
  split_type?: string;
  currency?: number;
};

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [debts, setDebts] = useState<any[]>([]);
  const [balanceTrace, setBalanceTrace] = useState<any[]>([]);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementFrom, setSettlementFrom] = useState("");
  const [settlementTo, setSettlementTo] = useState("");
  const [showDebtsModal, setShowDebtsModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [balances, setBalances] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroup() {
      const token = localStorage.getItem("accessToken");
      if (!token) { router.replace("/login"); return; }
      try {
        const usersData = await api<any[]>("/users/", { token });
        setUsers(usersData);
        const data = await api<Group>(`/groups/${params.id}/`, { token });
        setGroup(data);
        const expensesData = await api<Expense[]>("/expenses/", { token });
        setExpenses(expensesData.filter((e) => e.group === Number(params.id)));
        const settlementsData = await api<any[]>("/settlements/", { token });
        setSettlements(settlementsData.filter((s) => s.group === Number(params.id)));
      } catch { router.replace("/groups"); }
      finally { setLoading(false); }
    }
    loadGroup();
  }, [params.id, router]);

  async function loadDebts() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group) return;
    try {
      const result = await api<any>(`/groups/${group.id}/simplified-debts/`, { token });
      setDebts(result.transfers || []);
      setShowDebtsModal(true);
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to load debts"); }
  }

  async function loadBalances() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group) return;
    try {
      const result = await api<any>(`/groups/${group.id}/balances/`, { token });
      setBalances(result.balances || []);
      setBalanceTrace(result.trace || []);
      setShowBalancesModal(true);
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to load balances"); }
  }

  async function createSettlement() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group || !settlementAmount || !settlementFrom || !settlementTo) { alert("Fill all fields"); return; }
    try {
      await api("/settlements/", { method: "POST", token, body: JSON.stringify({ group: group.id, paid_by: Number(settlementFrom), paid_to: Number(settlementTo), currency: 1, amount: settlementAmount, settlement_date: new Date().toISOString() }) });
      const data = await api<any[]>("/settlements/", { token });
      setSettlements(data.filter((s) => s.group === group.id));
      setShowSettlementModal(false);
      setSettlementAmount(""); setSettlementFrom(""); setSettlementTo("");
    } catch (error) { alert(error instanceof Error ? error.message : "Failed"); }
  }

  async function addExpense() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group || !expenseDescription || !expenseAmount || !paidBy || selectedParticipants.length === 0) { alert("Fill all fields"); return; }
    try {
      await api("/expenses/", { method: "POST", token, body: JSON.stringify({ group: group.id, paid_by: Number(paidBy), currency: 1, amount: expenseAmount, description: expenseDescription, split_type: "equal", expense_date: new Date().toISOString(), participants: selectedParticipants.map((id) => ({ user: id })) }) });
      const data = await api<Expense[]>("/expenses/", { token });
      setExpenses(data.filter((e) => e.group === group.id));
      setShowExpenseModal(false);
      setExpenseDescription(""); setExpenseAmount(""); setPaidBy(""); setSelectedParticipants([]);
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to add expense"); }
  }

  async function addMember() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group || !selectedUser) return;
    try {
      await api("/memberships/", { method: "POST", token, body: JSON.stringify({ group: group.id, user: Number(selectedUser), joined_at: new Date().toISOString() }) });
      const updated = await api<Group>(`/groups/${group.id}/`, { token });
      setGroup(updated);
      setShowMemberModal(false); setSelectedUser("");
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to add member"); }
  }

  async function deleteGroup() {
    const token = localStorage.getItem("accessToken");
    if (!token || !group) return;
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await api(`/groups/${group.id}/`, { method: "DELETE", token });
      router.push("/groups");
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to delete group"); }
  }

  async function removeMember(membershipId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token || !group || !confirm("Remove this member?")) return;
    try {
      await api(`/memberships/${membershipId}/`, { method: "PATCH", token, body: JSON.stringify({ left_at: new Date().toISOString() }) });
      const updated = await api<Group>(`/groups/${group.id}/`, { token });
      setGroup(updated);
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to remove member"); }
  }

  async function deleteExpense(expenseId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token || !group) return;
    try {
      await api(`/expenses/${expenseId}/`, { method: "DELETE", token });
      setExpenses(expenses.filter((e) => e.id !== expenseId));
    } catch (error) { alert(error instanceof Error ? error.message : "Failed to delete expense"); }
  }

  function getUserName(userId: number) {
    const user = users.find((u) => u.id === userId);
    return user?.full_name || user?.name || user?.email || `User ${userId}`;
  }

  if (loading) {
    return (
      <AppShell>
        <style>{`.ld{display:flex;align-items:center;justify-content:center;min-height:40vh;gap:.75rem}.ld span{width:8px;height:8px;border-radius:50%;background:#6366F1;animation:b 1.2s ease-in-out infinite}.ld span:nth-child(2){animation-delay:.2s}.ld span:nth-child(3){animation-delay:.4s}@keyframes b{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-10px);opacity:1}}`}</style>
        <div className="ld"><span/><span/><span/></div>
      </AppShell>
    );
  }

  if (!group) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const activeMembers = group.memberships.filter((m) => m.left_at === null);
  const formerMembers = group.memberships.filter((m) => m.left_at);

  const MODAL_STYLE = `
    .modal-bd{position:fixed;inset:0;z-index:50;background:rgba(15,22,41,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.5rem}
    .modal-box{background:#fff;border:1px solid #DDE3F0;border-radius:20px;padding:2rem;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.15);max-height:85vh;overflow-y:auto}
    .modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
    .modal-title{font-size:1.05rem;font-weight:800;color:#1E2A45;letter-spacing:-.02em}
    .modal-close{width:32px;height:32px;border-radius:8px;background:#F1F5F9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748B;transition:background .15s}
    .modal-close:hover{background:#EEF2FF;color:#6366F1}
    .modal-fields{display:flex;flex-direction:column;gap:.875rem}
    .mlabel{display:block;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:.35rem}
    .minput{width:100%;background:#F8FAFF;border:1px solid #DDE3F0;border-radius:10px;color:#1E2A45;font-size:.875rem;padding:.65rem .875rem;font-family:inherit;transition:border-color .15s,box-shadow .15s}
    .minput::placeholder{color:#CBD5E1}
    .minput:focus{outline:none;border-color:#6366F1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .mselect{width:100%;background:#F8FAFF;border:1px solid #DDE3F0;border-radius:10px;color:#1E2A45;font-size:.875rem;padding:.65rem .875rem;font-family:inherit;cursor:pointer;transition:border-color .15s}
    .mselect:focus{outline:none;border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .mtextarea{width:100%;background:#F8FAFF;border:1px solid #DDE3F0;border-radius:10px;color:#1E2A45;font-size:.875rem;padding:.65rem .875rem;font-family:inherit;resize:vertical;transition:border-color .15s}
    .mtextarea:focus{outline:none;border-color:#6366F1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .mactions{display:flex;justify-content:flex-end;gap:.625rem;margin-top:.25rem}
    .btn-cancel{padding:.5rem 1rem;font-size:.825rem;font-weight:600;color:#64748B;background:#F1F5F9;border:1px solid #DDE3F0;border-radius:10px;cursor:pointer;font-family:inherit;transition:background .15s}
    .btn-cancel:hover{background:#E2E8F0}
    .btn-confirm{padding:.5rem 1.25rem;font-size:.825rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#3B82F6,#6366F1);border:none;border-radius:10px;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.28);font-family:inherit;transition:opacity .15s}
    .btn-confirm:hover{opacity:.9}
    .participant-row{display:flex;align-items:center;gap:.625rem;padding:.5rem .75rem;border-radius:8px;cursor:pointer;transition:background .15s}
    .participant-row:hover{background:#F8FAFF}
    .participant-row input[type=checkbox]{accent-color:#6366F1;width:15px;height:15px;cursor:pointer}
    .participant-label{font-size:.85rem;color:#1E2A45;cursor:pointer}
    .balance-item{display:flex;align-items:center;justify-content:space-between;background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:.875rem 1rem}
    .balance-name{font-size:.85rem;font-weight:600;color:#1E2A45}
    .balance-pos{font-weight:700;color:#10B981}
    .balance-neg{font-weight:700;color:#EF4444}
    .trace-item{background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:.875rem 1rem;display:grid;grid-template-columns:1fr 1fr;gap:.25rem .75rem}
    .trace-k{font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8}
    .trace-v{font-size:.8rem;font-weight:600;color:#1E2A45}
    .debt-item{background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:.875rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
    .debt-flow{font-size:.85rem;color:#475569;display:flex;align-items:center;gap:.4rem}
    .debt-arrow{color:#94A3B8}
    .debt-amount{font-size:.95rem;font-weight:800;color:#6366F1}
    .section-divider{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#94A3B8;margin:1.25rem 0 .75rem}
  `;

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        ${MODAL_STYLE}

        .back-btn{display:inline-flex;align-items:center;gap:.35rem;font-size:.8rem;font-weight:600;color:#6366F1;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.25rem;transition:opacity .15s;font-family:inherit}
        .back-btn:hover{opacity:.7}
        .page-title{font-size:1.875rem;font-weight:800;color:#1E2A45;letter-spacing:-.03em;line-height:1.1}
        .page-sub{margin-top:.35rem;font-size:.875rem;color:#94A3B8}

        .stat-grid{display:grid;gap:1rem;grid-template-columns:repeat(2,1fr);margin:1.5rem 0}
        @media(min-width:768px){.stat-grid{grid-template-columns:repeat(4,1fr)}}
        .stat-card{background:#fff;border:1px solid #DDE3F0;border-radius:14px;padding:1.1rem 1.25rem}
        .stat-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:.75rem}
        .stat-label{font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8}
        .stat-value{font-size:1.5rem;font-weight:800;color:#1E2A45;letter-spacing:-.025em;margin-top:.2rem;line-height:1}
        .stat-value.green{color:#10B981;font-size:1rem}

        .actions-row{display:flex;flex-wrap:wrap;gap:.625rem;margin-bottom:1.75rem}
        .act-btn{display:inline-flex;align-items:center;gap:.4rem;font-size:.775rem;font-weight:600;padding:.5rem 1rem;border-radius:10px;border:none;cursor:pointer;font-family:inherit;transition:opacity .15s,transform .1s;white-space:nowrap}
        .act-btn:hover{opacity:.88;transform:translateY(-1px)}
        .act-btn.blue{background:#EEF2FF;color:#4F46E5}
        .act-btn.green{background:#ECFDF5;color:#059669}
        .act-btn.orange{background:#FFF7ED;color:#D97706}
        .act-btn.indigo{background:#EEF2FF;color:#6366F1}
        .act-btn.purple{background:#F5F3FF;color:#7C3AED}
        .act-btn.red{background:#FEF2F2;color:#DC2626}

        .section-card{background:#fff;border:1px solid #DDE3F0;border-radius:16px;padding:1.5rem;margin-bottom:1rem}
        .section-title{font-size:1rem;font-weight:700;color:#1E2A45;letter-spacing:-.01em;margin-bottom:1rem}

        .member-grid{display:grid;gap:.75rem}
        @media(min-width:768px){.member-grid{grid-template-columns:repeat(2,1fr)}}
        .member-card{background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:1rem}
        .member-name{font-size:.875rem;font-weight:600;color:#1E2A45}
        .member-date{font-size:.72rem;color:#94A3B8;margin-top:.2rem}
        .member-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.75rem}
        .badge-active{font-size:.65rem;font-weight:600;background:#ECFDF5;color:#059669;padding:.2rem .6rem;border-radius:20px}
        .badge-left{font-size:.65rem;font-weight:600;background:#F1F5F9;color:#64748B;padding:.2rem .6rem;border-radius:20px}
        .rm-btn{font-size:.7rem;font-weight:600;color:#DC2626;background:#FEF2F2;border:none;border-radius:7px;padding:.25rem .6rem;cursor:pointer;font-family:inherit;transition:background .15s}
        .rm-btn:hover{background:#FEE2E2}

        .expense-item{background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:.875rem 1rem;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
        .expense-desc{font-size:.875rem;font-weight:600;color:#1E2A45}
        .expense-amt{font-size:.875rem;font-weight:800;color:#10B981;margin-top:.15rem}
        .expense-date{font-size:.7rem;color:#94A3B8;margin-top:.2rem}
        .del-btn{font-size:.7rem;font-weight:600;color:#DC2626;background:#FEF2F2;border:none;border-radius:7px;padding:.25rem .6rem;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;margin-top:.15rem;transition:background .15s}
        .del-btn:hover{background:#FEE2E2}

        .settlement-item{background:#F8FAFF;border:1px solid #EEF2FF;border-radius:12px;padding:.875rem 1rem}
        .settlement-flow{font-size:.85rem;color:#475569;display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
        .settlement-amt{font-size:.95rem;font-weight:800;color:#8B5CF6;margin-top:.35rem}
        .settlement-date{font-size:.7rem;color:#94A3B8;margin-top:.2rem}

        .empty-text{font-size:.85rem;color:#94A3B8;text-align:center;padding:1.5rem 0}
        .list-gap{display:flex;flex-direction:column;gap:.625rem}
      `}</style>

      {/* ── Modals ── */}

      {showMemberModal && group && (
        <div className="modal-bd" onClick={(e) => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-hd">
              <span className="modal-title">Add Member</span>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-fields">
              <div>
                <label className="mlabel">Select User</label>
                <select className="mselect" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">Choose a user…</option>
                  {users.filter((u) => !group.memberships.some((m) => m.user === u.id)).map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="mactions">
                <button className="btn-cancel" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button className="btn-confirm" onClick={addMember}>Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && group && (
        <div className="modal-bd" onClick={(e) => e.target === e.currentTarget && setShowExpenseModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-hd">
              <span className="modal-title">Add Expense</span>
              <button className="modal-close" onClick={() => setShowExpenseModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-fields">
              <div>
                <label className="mlabel">Description</label>
                <input className="minput" placeholder="e.g. Dinner at restaurant" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
              </div>
              <div>
                <label className="mlabel">Amount (₹)</label>
                <input className="minput" type="number" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              </div>
              <div>
                <label className="mlabel">Paid By</label>
                <select className="mselect" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                  <option value="">Select person…</option>
                  {activeMembers.map((m) => <option key={m.user} value={m.user}>{m.user_name || m.user_email}</option>)}
                </select>
              </div>
              <div>
                <label className="mlabel">Participants</label>
                {activeMembers.map((m) => (
                  <div key={m.user} className="participant-row" onClick={() => {
                    setSelectedParticipants(selectedParticipants.includes(m.user)
                      ? selectedParticipants.filter((id) => id !== m.user)
                      : [...selectedParticipants, m.user]);
                  }}>
                    <input type="checkbox" readOnly checked={selectedParticipants.includes(m.user)} />
                    <span className="participant-label">{m.user_name || m.user_email}</span>
                  </div>
                ))}
              </div>
              <div className="mactions">
                <button className="btn-cancel" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button className="btn-confirm" onClick={addExpense}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettlementModal && group && (
        <div className="modal-bd" onClick={(e) => e.target === e.currentTarget && setShowSettlementModal(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-hd">
              <span className="modal-title">Record Payment</span>
              <button className="modal-close" onClick={() => setShowSettlementModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-fields">
              <div>
                <label className="mlabel">Who Paid?</label>
                <select className="mselect" value={settlementFrom} onChange={(e) => setSettlementFrom(e.target.value)}>
                  <option value="">Select person…</option>
                  {group.memberships.map((m) => <option key={m.user} value={m.user}>{m.user_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mlabel">Paid To?</label>
                <select className="mselect" value={settlementTo} onChange={(e) => setSettlementTo(e.target.value)}>
                  <option value="">Select person…</option>
                  {group.memberships.map((m) => <option key={m.user} value={m.user}>{m.user_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mlabel">Amount (₹)</label>
                <input className="minput" type="number" placeholder="0.00" value={settlementAmount} onChange={(e) => setSettlementAmount(e.target.value)} />
              </div>
              <div className="mactions">
                <button className="btn-cancel" onClick={() => setShowSettlementModal(false)}>Cancel</button>
                <button className="btn-confirm" onClick={createSettlement}>Save Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBalancesModal && (
        <div className="modal-bd" onClick={(e) => e.target === e.currentTarget && setShowBalancesModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-hd">
              <span className="modal-title">Individual Balances</span>
              <button className="modal-close" onClick={() => setShowBalancesModal(false)}><X size={14} /></button>
            </div>
            <div className="list-gap">
              {balances.map((b) => (
                <div key={b.user_id} className="balance-item">
                  <span className="balance-name">{getUserName(b.user_id)}</span>
                  <span className={Number(b.net) >= 0 ? "balance-pos" : "balance-neg"}>
                    {Number(b.net) >= 0 ? "+" : ""}₹{b.net}
                  </span>
                </div>
              ))}
            </div>
            {balanceTrace.length > 0 && <>
              <div className="section-divider">Balance Trace</div>
              <div className="list-gap">
                {balanceTrace.map((item, i) => (
                  <div key={i} className="trace-item">
                    <div><div className="trace-k">User</div><div className="trace-v">{getUserName(item.user_id)}</div></div>
                    <div><div className="trace-k">Type</div><div className="trace-v">{item.type}</div></div>
                    <div><div className="trace-k">Expense ID</div><div className="trace-v">#{item.expense_id}</div></div>
                    <div><div className="trace-k">Delta</div><div className="trace-v">₹{item.delta}</div></div>
                  </div>
                ))}
              </div>
            </>}
            <div className="mactions" style={{ marginTop: "1rem" }}>
              <button className="btn-cancel" onClick={() => setShowBalancesModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDebtsModal && (
        <div className="modal-bd" onClick={(e) => e.target === e.currentTarget && setShowDebtsModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-hd">
              <span className="modal-title">Simplified Debts</span>
              <button className="modal-close" onClick={() => setShowDebtsModal(false)}><X size={14} /></button>
            </div>
            <div className="list-gap">
              {debts.length === 0
                ? <p className="empty-text">No debts to show — all settled!</p>
                : debts.map((d, i) => (
                  <div key={i} className="debt-item">
                    <div className="debt-flow">
                      <span>{getUserName(d.from_user_id)}</span>
                      <span className="debt-arrow">→</span>
                      <span>{getUserName(d.to_user_id)}</span>
                    </div>
                    <span className="debt-amount">₹{d.amount}</span>
                  </div>
                ))
              }
            </div>
            <div className="mactions" style={{ marginTop: "1rem" }}>
              <button className="btn-cancel" onClick={() => setShowDebtsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <button className="back-btn" onClick={() => router.push("/groups")}>
        <ChevronLeft size={14} /> Back to Groups
      </button>

      <h1 className="page-title">{group.name}</h1>
      <p className="page-sub">{group.description || "No description provided"}</p>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: "Members", value: group.memberships.length, icon: <Users size={16} />, bg: "#EEF2FF", color: "#6366F1" },
          { label: "Currency", value: group.default_currency_code, icon: <IndianRupee size={16} />, bg: "#ECFDF5", color: "#10B981" },
          { label: "Total Expenses", value: `₹${totalExpenses}`, icon: <Receipt size={16} />, bg: "#FFFBEB", color: "#F59E0B" },
          { label: "Status", value: "Active", icon: <Activity size={16} />, bg: "#ECFDF5", color: "#10B981", green: true },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color }}>{s.icon}</span></div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value${s.green ? " green" : ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="actions-row">
        <button className="act-btn blue" onClick={() => setShowMemberModal(true)}><UserPlus size={13} /> Add Member</button>
        <button className="act-btn green" onClick={() => setShowExpenseModal(true)}><Plus size={13} /> Add Expense</button>
        <button className="act-btn orange" onClick={loadDebts}><TrendingUp size={13} /> Simplify Debts</button>
        <button className="act-btn indigo" onClick={loadBalances}><BarChart2 size={13} /> View Balances</button>
        <button className="act-btn purple" onClick={() => setShowSettlementModal(true)}><ArrowLeftRight size={13} /> Record Payment</button>
        <button className="act-btn red" onClick={deleteGroup}><Trash2 size={13} /> Delete Group</button>
      </div>

      {/* Active Members */}
      <div className="section-card">
        <div className="section-title">Active Members</div>
        <div className="member-grid">
          {activeMembers.map((m) => (
            <div className="member-card" key={m.id}>
              <div className="member-name">{m.user_name || m.user_email}</div>
              <div className="member-date">Joined {new Date(m.joined_at).toLocaleDateString()}</div>
              <div className="member-footer">
                <button className="rm-btn" onClick={() => removeMember(m.id)}>Remove</button>
                <span className="badge-active">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Former Members */}
      {formerMembers.length > 0 && (
        <div className="section-card">
          <div className="section-title">Former Members</div>
          <div className="member-grid">
            {formerMembers.map((m) => (
              <div className="member-card" key={m.id}>
                <div className="member-name">{m.user_name || m.user_email}</div>
                <div className="member-date">Joined {new Date(m.joined_at).toLocaleDateString()}</div>
                <div className="member-date">Left {new Date(m.left_at!).toLocaleDateString()}</div>
                <div className="member-footer">
                  <span />
                  <span className="badge-left">Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div className="section-card">
        <div className="section-title">Expense History</div>
        {expenses.length === 0
          ? <p className="empty-text">No expenses yet. Add one to get started.</p>
          : <div className="list-gap">
              {expenses.map((e) => (
                <div className="expense-item" key={e.id}>
                  <div>
                    <div className="expense-desc">{e.description}</div>
                    <div className="expense-amt">₹{e.amount}</div>
                    <div className="expense-date">{new Date(e.expense_date).toLocaleDateString()}</div>
                  </div>
                  <button className="del-btn" onClick={() => deleteExpense(e.id)}><Trash2 size={11} style={{ display: "inline", marginRight: 3 }} />Delete</button>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Settlements */}
      <div className="section-card">
        <div className="section-title">Settlement History</div>
        {settlements.length === 0
          ? <p className="empty-text">No settlements yet.</p>
          : <div className="list-gap">
              {settlements.map((s) => (
                <div className="settlement-item" key={s.id}>
                  <div className="settlement-flow">
                    <span>{getUserName(s.paid_by)}</span>
                    <span style={{ color: "#94A3B8" }}>→</span>
                    <span>{getUserName(s.paid_to)}</span>
                  </div>
                  <div className="settlement-amt">₹{s.amount}</div>
                  <div className="settlement-date">{new Date(s.settlement_date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
        }
      </div>
    </AppShell>
  );
}