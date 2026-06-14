"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, ShieldCheck, X, AlertTriangle, CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { ImportSession } from "@/types/domain";

export default function ImportsPage() {
  const router = useRouter();
  const [session, setSession] = useState<ImportSession | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.replace("/login");
  }, [router]);

  async function upload() {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login"); return; }
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedGroup) {
        formData.append("group", String(selectedGroup.id));
      }
      const result = await api<ImportSession>("/imports/", { method: "POST", body: formData, token });
      setSession(result);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function review(action: "import" | "merge" | "keep_both" | "ignore") {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login"); return; }
    if (!session) return;
    try {
      const actions = session.anomalies.map((item) => ({ row_number: item.row_number, action }));
      const result = await api<ImportSession>(`/imports/${session.id}/review/`, {
        method: "POST",
        body: JSON.stringify({ actions }),
        token,
      });
      setSession(result);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Review failed");
    }
  }

  const severityColor = (s: string) => {
    if (s === "error") return "#EF4444";
    if (s === "warning") return "#F59E0B";
    return "#6366F1";
  };

  const severityBg = (s: string) => {
    if (s === "error") return "#FEF2F2";
    if (s === "warning") return "#FFFBEB";
    return "#EEF2FF";
  };

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .imp-page { font-family: 'Inter', sans-serif; }

        .imp-title { font-size: 1.875rem; font-weight: 800; color: #1E2A45; letter-spacing: -.03em; line-height: 1.1; }
        .imp-sub   { margin-top: .35rem; font-size: .875rem; color: #94A3B8; }

        /* Upload card */
        .imp-card  { background: #fff; border: 1px solid #DDE3F0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
        .imp-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .imp-card-title { font-size: 1rem; font-weight: 700; color: #1E2A45; letter-spacing: -.01em; }

        /* File input zone */
        .file-zone {
          border: 2px dashed #DDE3F0;
          border-radius: 12px;
          background: #F8FAFF;
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          position: relative;
        }
        .file-zone:hover { border-color: #6366F1; background: #EEF2FF; }
        .file-zone input[type=file] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }
        .file-zone-icon { width: 44px; height: 44px; border-radius: 12px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto .75rem; color: #6366F1; }
        .file-zone-label { font-size: .875rem; font-weight: 600; color: #1E2A45; }
        .file-zone-hint  { font-size: .75rem; color: #94A3B8; margin-top: .25rem; }
        .file-chosen     { font-size: .75rem; font-weight: 600; color: #6366F1; margin-top: .5rem; }

        /* Upload button */
        .btn-upload {
          display: inline-flex; align-items: center; gap: .45rem;
          padding: .55rem 1.25rem; font-size: .825rem; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #3B82F6, #6366F1);
          border: none; border-radius: 10px; cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 12px rgba(99,102,241,.28); transition: opacity .15s, transform .1s;
          white-space: nowrap;
        }
        .btn-upload:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-upload:disabled { opacity: .55; cursor: not-allowed; }

        /* Action buttons */
        .act-btn { display: inline-flex; align-items: center; gap: .4rem; font-size: .775rem; font-weight: 600; padding: .5rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity .15s, transform .1s; white-space: nowrap; }
        .act-btn:hover { opacity: .88; transform: translateY(-1px); }
        .act-btn.green  { background: #ECFDF5; color: #059669; }
        .act-btn.indigo { background: #EEF2FF; color: #6366F1; }
        .act-btn.red    { background: #FEF2F2; color: #DC2626; }
        .actions-row { display: flex; flex-wrap: wrap; gap: .625rem; }

        /* Session card header */
        .session-meta { display: flex; align-items: center; gap: .75rem; }
        .session-icon { width: 40px; height: 40px; border-radius: 10px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; color: #6366F1; flex-shrink: 0; }
        .session-name { font-size: .95rem; font-weight: 700; color: #1E2A45; }
        .session-status { display: inline-block; font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; padding: .2rem .65rem; border-radius: 20px; margin-top: .25rem; }
        .status-pending   { background: #FFFBEB; color: #D97706; }
        .status-done      { background: #ECFDF5; color: #059669; }
        .status-default   { background: #EEF2FF; color: #6366F1; }

        /* Report box */
        .report-box {
          background: #0F1729; border-radius: 12px; padding: 1.25rem;
          margin-bottom: 1.25rem; overflow: auto; max-height: 220px;
        }
        .report-box pre { font-size: .7rem; color: #94A3B8; line-height: 1.6; margin: 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; }

        /* Anomaly table */
        .ano-table { width: 100%; border-collapse: collapse; }
        .ano-table thead th {
          font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
          color: #94A3B8; padding: 0 .75rem .75rem; text-align: left;
        }
        .ano-table tbody tr { border-top: 1px solid #EEF2FF; }
        .ano-table tbody tr:hover { background: #F8FAFF; }
        .ano-table td { padding: .75rem; font-size: .825rem; color: #475569; vertical-align: middle; }
        .ano-table td.row-num { font-weight: 700; color: #1E2A45; }
        .ano-table td.msg { color: #64748B; }
        .sev-badge {
          display: inline-block; font-size: .65rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .06em;
          padding: .2rem .6rem; border-radius: 6px;
        }
        .code-chip {
          display: inline-block; font-size: .7rem; font-family: monospace;
          background: #F1F5F9; color: #475569; border-radius: 6px;
          padding: .15rem .5rem; border: 1px solid #E2E8F0;
        }
        .empty-text { font-size: .85rem; color: #94A3B8; text-align: center; padding: 2rem 0; }
      `}</style>

      <div className="imp-page">
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 className="imp-title">CSV Import</h1>
          <p className="imp-sub">Parse, validate, detect anomalies, review, and import.</p>
        </div>

        {/* Upload card */}
        <div className="imp-card">
          <div className="imp-card-hd">
            <span className="imp-card-title">Upload CSV File</span>
            <button className="btn-upload" onClick={upload} disabled={!file || uploading}>
              <FileUp size={14} />
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>

          <div className="file-zone">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="file-zone-icon"><FileUp size={20} /></div>
            <div className="file-zone-label">Drag & drop or click to browse</div>
            <div className="file-zone-hint">Accepts .csv files only</div>
            {file && <div className="file-chosen">✓ {file.name}</div>}
          </div>
        </div>

        {/* Session results card */}
        {session && (
          <div className="imp-card">
            <div className="imp-card-hd">
              <div className="session-meta">
                <div className="session-icon"><FileText size={18} /></div>
                <div>
                  <div className="session-name">{session.original_filename}</div>
                  <span className={`session-status ${
                    session.status === "pending" ? "status-pending"
                    : session.status === "done" ? "status-done"
                    : "status-default"
                  }`}>{session.status}</span>
                </div>
              </div>

              <div className="actions-row">
                <button className="act-btn green" onClick={() => review("keep_both")}>
                  <ShieldCheck size={13} /> Keep Both
                </button>
                <button className="act-btn indigo" onClick={() => review("merge")}>
                  <ChevronRight size={13} /> Merge
                </button>
                <button className="act-btn red" onClick={() => review("ignore")}>
                  <X size={13} /> Ignore
                </button>
              </div>
            </div>

            {/* Report JSON */}
            {session.report && (
              <div className="report-box">
                <pre>{JSON.stringify(session.report, null, 2)}</pre>
              </div>
            )}

            {/* Anomalies */}
            <div style={{ fontSize: ".65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#94A3B8", marginBottom: ".75rem" }}>
              Anomalies ({session.anomalies.length})
            </div>

            {session.anomalies.length === 0 ? (
              <div className="empty-text">
                <CheckCircle2 size={28} style={{ color: "#10B981", margin: "0 auto .5rem", display: "block" }} />
                No anomalies detected — file looks clean!
              </div>
            ) : (
              <table className="ano-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Severity</th>
                    <th>Code</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {session.anomalies.map((anomaly) => (
                    <tr key={anomaly.id}>
                      <td className="row-num">#{anomaly.row_number}</td>
                      <td>
                        <span
                          className="sev-badge"
                          style={{ background: severityBg(anomaly.severity), color: severityColor(anomaly.severity) }}
                        >
                          {anomaly.severity}
                        </span>
                      </td>
                      <td><span className="code-chip">{anomaly.code}</span></td>
                      <td className="msg">{anomaly.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}