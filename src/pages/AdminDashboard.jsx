import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Loader from '../components/Loader';
import {
  LogOut, Plus, Trash2, Edit3, Save, X, Upload,
  Calendar, Users, Trophy, Clock, Link, FileText,
  Settings, ChevronDown, ChevronUp, CheckCircle, Menu, ChevronRight, Globe, Folder,
  Shield, Check, AlertTriangle, XCircle, Search, Download, Eye, KeyRound, RefreshCw,
  BarChart3, UserPlus, Sliders, Activity, Filter
} from 'lucide-react';
import { generateAdminFinalReportPDF } from '../utils/pdfGenerator';

// ========================
// REUSABLE TOAST
// ========================
function Toast({ msg, onClose }) {
  return (
    <div className="toast-msg">
      <CheckCircle size={16} />
      <span>{msg}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ========================
// SECTION WRAPPER
// ========================
function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-section">
      <button className="admin-section-header" onClick={() => setOpen(!open)}>
        <span className="admin-section-title">{icon} {title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="admin-section-body">{children}</div>}
    </div>
  );
}

// ==========================================
// 1. OVERVIEW & METRICS PANEL (Super Admin)
// ==========================================
function OverviewPanel({ stats, onSelectTab }) {
  return (
    <div>
      {/* Top 6 KPI Cards */}
      <div className="admin-kpi-grid">
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Events</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{stats?.totalEvents || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Across Days 1 & 2</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Event Coordinators</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{stats?.totalCoordinators || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Active event managers</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Registered Teams</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{stats?.totalTeams || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Total student teams</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ color: '#93c5fd', fontSize: '0.85rem' }}>Pending Submissions</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>{stats?.pendingSubmissions || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Awaiting admin review</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ color: '#86efac', fontSize: '0.85rem' }}>Approved Results</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{stats?.approvedResults || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Published to scoreboard</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>Rejected / Reopened</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{stats?.rejectedResults || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Sent back for correction</div>
        </div>
      </div>

      {/* Event-wise Performance & Recent Logs */}
      <div className="admin-overview-grid">
        {/* Performance */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>Event-wise Team & Scoring Status</h3>
            <button onClick={() => onSelectTab('allteams')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer' }}>View All Teams →</button>
          </div>

          {(!stats?.eventPerformance || stats.eventPerformance.length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No team registrations recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.eventPerformance.slice(0, 6).map((ep, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>{ep.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{ep.totalTeams} Teams Registered · {ep.scoredTeams} Scored</div>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                    Avg: {ep.avgScore} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Logs */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>Recent Coordinator Activity</h3>
            <button onClick={() => onSelectTab('auditlogs')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer' }}>View All Logs →</button>
          </div>

          {(!stats?.recentLogs || stats.recentLogs.length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent activity logs.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.recentLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <strong>{log.action}</strong>
                    <span style={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{log.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 2. RESULT APPROVAL MANAGEMENT (Super Admin Only)
// ====================================================
function ResultApprovalManager({ toast, onRefreshStats }) {
  const { apiFetch, currentUser } = useApp();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Score details modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Reject / Request Correction modal
  const [rejectingSub, setRejectingSub] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isCorrectionRequest, setIsCorrectionRequest] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    try {
      setLoading(true);
      const res = await apiFetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, currentUser]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Approve Results
  const handleApprove = async (sub) => {
    if (!window.confirm(`Approve final results for "${sub.eventName}"?\n\nThis will lock final scores, publish results, and automatically update the live public scoreboard!`)) return;

    try {
      const res = await apiFetch(`/api/submissions/${sub._id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to approve');
        return;
      }
      toast(`Results for "${sub.eventName}" approved! Public scoreboard updated.`);
      fetchSubmissions();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast('Network error during approval');
    }
  };

  // Submit Rejection / Correction Request
  const handleConfirmRejection = async () => {
    if (!rejectingSub) return;
    try {
      const res = await apiFetch(`/api/submissions/${rejectingSub._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          remarks: rejectionRemarks,
          requestCorrection: isCorrectionRequest,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to process request');
        return;
      }

      toast(isCorrectionRequest ? 'Correction requested. Coordinator can now adjust scores.' : 'Submission rejected.');
      setRejectingSub(null);
      setRejectionRemarks('');
      fetchSubmissions();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast('Network error');
    }
  };

  // Reopen Submission
  const handleReopen = async (sub) => {
    if (!window.confirm(`Reopen submission for "${sub.eventName}"? Coordinator will be allowed to modify scores.`)) return;
    try {
      const res = await apiFetch(`/api/submissions/${sub._id}/reopen`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to reopen');
        return;
      }
      toast(`Submission for "${sub.eventName}" reopened.`);
      fetchSubmissions();
      if (onRefreshStats) onRefreshStats();
    } catch {
      toast('Network error');
    }
  };

  // Download PDF
  const handleDownloadPDF = (sub) => {
    generateAdminFinalReportPDF({
      submission: sub,
      eventName: sub.eventName,
      coordinatorName: sub.coordinatorName,
      approvedBy: sub.approvedBy || 'Super Admin',
      approvedAt: sub.approvedAt || new Date(),
      teams: sub.finalScores || [],
    });
    toast('Official Approved PDF Report downloaded');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 4px 0' }}>Result Approval Management</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Review coordinator submissions, view team scores, download official reports, and approve scores into the public scoreboard.
          </p>
        </div>
        <button onClick={fetchSubmissions} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <Clock size={40} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#cbd5e1' }}>No Score Submissions Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>When event coordinators submit their final results, they will appear here for your review and approval.</p>
        </div>
      ) : (
        <div className="admin-submissions-grid">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                border: sub.status === 'approved'
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : sub.status === 'pending'
                  ? '1px solid rgba(59, 130, 246, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '14px',
                padding: '22px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    {sub.eventName}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    background: sub.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : sub.status === 'pending' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: sub.status === 'approved' ? '#10b981' : sub.status === 'pending' ? '#60a5fa' : '#ef4444',
                    border: `1px solid ${sub.status === 'approved' ? 'rgba(16, 185, 129, 0.4)' : sub.status === 'pending' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  }}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Sub details */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: '#cbd5e1' }}>Coordinator: <strong style={{ color: '#38bdf8' }}>{sub.coordinatorName}</strong></div>
                  <div style={{ color: '#cbd5e1' }}>Total Teams Scored: <strong>{sub.teamsCount}</strong></div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Submitted on: {new Date(sub.submittedAt).toLocaleString()}</div>
                  {sub.approvedBy && (
                    <div style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '4px' }}>
                      Approved by {sub.approvedBy} on {new Date(sub.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                  {sub.rejectionRemarks && (
                    <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
                      Remarks: "{sub.rejectionRemarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { setSelectedSubmission(sub); setShowScoresModal(true); }}
                    style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> View Scores
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(sub)}
                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#cbd5e1', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                </div>

                {sub.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(sub)}
                      style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Check size={16} /> Approve & Publish
                    </button>

                    <button
                      onClick={() => { setRejectingSub(sub); setIsCorrectionRequest(true); setRejectionRemarks(''); }}
                      style={{ flex: 1, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#f59e0b', padding: '10px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Correction
                    </button>

                    <button
                      onClick={() => { setRejectingSub(sub); setIsCorrectionRequest(false); setRejectionRemarks(''); }}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {sub.status === 'approved' && (
                  <button
                    onClick={() => handleReopen(sub)}
                    style={{ background: 'transparent', border: '1px dashed rgba(245, 158, 11, 0.5)', color: '#f59e0b', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Reopen Submission for Editing
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW SCORES MODAL */}
      {showScoresModal && selectedSubmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="admin-modal-card" style={{ background: '#1e293b', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 4px 0' }}>Submitted Scores: {selectedSubmission.eventName}</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Coordinator: {selectedSubmission.coordinatorName} · Total Teams: {selectedSubmission.teamsCount}</p>
              </div>
              <button onClick={() => setShowScoresModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '10px' }}>Rank</th>
                    <th style={{ padding: '10px' }}>Team Name</th>
                    <th style={{ padding: '10px' }}>College</th>
                    <th style={{ padding: '10px' }}>Leader</th>
                    <th style={{ padding: '10px' }}>Total Score</th>
                    <th style={{ padding: '10px' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedSubmission.finalScores || []).map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 700, color: t.rank === 1 ? '#f59e0b' : t.rank === 2 ? '#cbd5e1' : t.rank === 3 ? '#b45309' : '#94a3b8' }}>
                        #{t.rank || idx + 1}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{t.teamName}</td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>{t.leaderCollege}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{t.leaderName} ({t.leaderUsn})</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#f59e0b' }}>{t.totalScore} pts</td>
                      <td style={{ padding: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>{t.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowScoresModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
              <button onClick={() => handleDownloadPDF(selectedSubmission)} style={{ background: '#38bdf8', border: 'none', color: '#0f172a', fontWeight: 700, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / CORRECTION REMARKS MODAL */}
      {rejectingSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ color: '#f8fafc', margin: '0 0 10px 0' }}>
              {isCorrectionRequest ? 'Request Correction from Coordinator' : 'Reject Submission'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
              Provide remarks or instructions for coordinator <strong style={{ color: '#f8fafc' }}>{rejectingSub.coordinatorName}</strong>. The scores will be unlocked for them to update.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Please verify Round 2 scores for Team 3, marks seem incomplete..."
              value={rejectionRemarks}
              onChange={e => setRejectionRemarks(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc', marginBottom: '18px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setRejectingSub(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmRejection} style={{ background: isCorrectionRequest ? '#f59e0b' : '#ef4444', border: 'none', color: '#fff', fontWeight: 700, padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>
                {isCorrectionRequest ? 'Send Correction Request' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================
// 3. MANAGE EVENT COORDINATORS (Super Admin Only)
// ====================================================
function CoordinatorManager({ toast, onRefreshStats }) {
  const { apiFetch, currentUser } = useApp();
  const [coordinators, setCoordinators] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCoord, setEditingCoord] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    mobile: '',
    assignedEvent: '',
    department: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');

  // Password reset modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    try {
      setLoading(true);
      const [coordRes, evRes] = await Promise.all([
        apiFetch('/api/coordinators'),
        apiFetch('/api/events'),
      ]);
      if (coordRes.ok) setCoordinators(await coordRes.json());
      if (evRes.ok) setEventsList(await evRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingCoord(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      mobile: '',
      assignedEvent: eventsList[0]?.name || '',
      department: '',
      status: 'active',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (coord) => {
    setEditingCoord(coord);
    setFormData({
      name: coord.name,
      username: coord.username,
      password: '',
      email: coord.email || '',
      mobile: coord.mobile || '',
      assignedEvent: coord.assignedEvent || '',
      department: coord.department || '',
      status: coord.status || 'active',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveCoordinator = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.assignedEvent) {
      setFormError('Name, Username/ID, and Assigned Event are required.');
      return;
    }

    if (!editingCoord && (!formData.password || formData.password.length < 6)) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const url = editingCoord ? `/api/coordinators/${editingCoord._id}` : '/api/coordinators';
      const method = editingCoord ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save coordinator');
        return;
      }

      setShowModal(false);
      toast(editingCoord ? `Coordinator ${formData.name} updated` : `Coordinator ${formData.name} created successfully!`);
      loadData();
      if (onRefreshStats) onRefreshStats();
    } catch {
      setFormError('Network error while saving coordinator');
    }
  };

  // Toggle active / inactive
  const handleToggleStatus = async (coord) => {
    const nextStatus = coord.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await apiFetch(`/api/coordinators/${coord._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast(`Coordinator account is now ${nextStatus}`);
        loadData();
      }
    } catch {
      toast('Failed to change status');
    }
  };

  // Reset Password
  const handleConfirmResetPassword = async () => {
    if (!resetModalUser || !newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await apiFetch(`/api/coordinators/${resetModalUser._id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to reset password');
        return;
      }

      toast(`Password for ${resetModalUser.name} reset successfully`);
      setResetModalUser(null);
      setNewPassword('');
    } catch {
      toast('Network error');
    }
  };

  // Delete Coordinator
  const handleDelete = async (coord) => {
    if (!window.confirm(`Delete coordinator "${coord.name}" (${coord.username})?`)) return;

    try {
      const res = await apiFetch(`/api/coordinators/${coord._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast(`Coordinator "${coord.name}" deleted`);
        loadData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch {
      toast('Failed to delete coordinator');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 4px 0' }}>Manage Event Coordinators</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Create coordinator credentials, assign individual events, activate/deactivate accounts, and reset passwords.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-admin-save"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <UserPlus size={16} /> Create Coordinator
        </button>
      </div>

      {/* Coordinators Table */}
      <div className="admin-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '14px 16px' }}>Coordinator Name</th>
              <th style={{ padding: '14px 16px' }}>Username / ID</th>
              <th style={{ padding: '14px 16px' }}>Assigned Event</th>
              <th style={{ padding: '14px 16px' }}>Department</th>
              <th style={{ padding: '14px 16px' }}>Contact</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coordinators.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  No coordinators created yet. Click "Create Coordinator" to add the first event coordinator.
                </td>
              </tr>
            ) : (
              coordinators.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{c.username}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {c.assignedEvent}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{c.department || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1', fontSize: '0.8rem' }}>
                    {c.email && <div>{c.email}</div>}
                    {c.mobile && <div style={{ color: '#94a3b8' }}>{c.mobile}</div>}
                    {!c.email && !c.mobile && '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggleStatus(c)}
                      style={{
                        background: c.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${c.status === 'active' ? '#10b981' : '#ef4444'}`,
                        color: c.status === 'active' ? '#10b981' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {c.status}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => { setResetModalUser(c); setNewPassword(''); }}
                        title="Reset Password"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#f59e0b', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Coordinator"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#38bdf8', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        title="Delete Coordinator"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="admin-modal-card" style={{ background: '#1e293b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', margin: '0 0 16px 0' }}>
              {editingCoord ? 'Edit Coordinator Details' : 'Create New Event Coordinator'}
            </h3>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCoordinator}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Coordinator Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Ramesh Rao / Jane Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Username / ID *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCoord}
                    placeholder="e.g. coord_hackathon"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                  />
                </div>

                {!editingCoord && (
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Assigned Event *</label>
                <select
                  required
                  value={formData.assignedEvent}
                  onChange={e => setFormData({ ...formData, assignedEvent: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                >
                  <option value="">-- Select Event --</option>
                  {eventsList.map(ev => (
                    <option key={ev.id} value={ev.name}>{ev.name} ({ev.day || 'Day 1'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="coordinator@gmu.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Department</label>
                  <input
                    type="text"
                    placeholder="CSE / AIML / ECE"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#f59e0b', border: 'none', color: '#0f172a', fontWeight: 700, padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                  {editingCoord ? 'Update Coordinator' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Reset Password</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
              Set a new password for <strong style={{ color: '#f8fafc' }}>{resetModalUser.name}</strong> ({resetModalUser.username}):
            </p>

            <input
              type="password"
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#f8fafc', marginBottom: '18px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setResetModalUser(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmResetPassword} style={{ background: '#f59e0b', border: 'none', color: '#0f172a', fontWeight: 700, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Save New Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================
// 4. ALL REGISTERED TEAMS VIEWER (Super Admin)
// ====================================================
function AllTeamsViewer({ toast }) {
  const { apiFetch, currentUser } = useApp();
  const [teams, setTeams] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTeams = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    try {
      setLoading(true);
      const url = selectedEvent !== 'all' ? `/api/teams?event=${encodeURIComponent(selectedEvent)}` : '/api/teams';
      const [tRes, evRes] = await Promise.all([
        apiFetch(url),
        apiFetch('/api/events'),
      ]);
      if (tRes.ok) setTeams(await tRes.json());
      if (evRes.ok) setEventsList(await evRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, currentUser, selectedEvent]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const filteredTeams = teams.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.leaderName.toLowerCase().includes(q) ||
      t.leaderCollege.toLowerCase().includes(q) ||
      t.leaderUsn.toLowerCase().includes(q) ||
      t.eventName.toLowerCase().includes(q) ||
      (t.registrationNo && t.registrationNo.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 4px 0' }}>All Registered Teams</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Inspect registered student teams, leader information, participants, and scoring progress across all events.
          </p>
        </div>

        {/* Filter controls */}
        <div className="admin-filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '0.85rem' }}
          >
            <option value="all">All Events ({teams.length})</option>
            {eventsList.map(ev => (
              <option key={ev.id} value={ev.name}>{ev.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
            <input
              type="text"
              placeholder="Search team, college, USN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem', outline: 'none', width: '180px' }}
            />
          </div>
        </div>
      </div>

      <div className="admin-teams-grid">
        {filteredTeams.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px' }}>
            No registered teams found matching criteria.
          </div>
        ) : (
          filteredTeams.map((t) => (
            <div
              key={t._id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                    {t.eventName}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: t.scoreStatus === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: t.scoreStatus === 'Approved' ? '#10b981' : '#38bdf8',
                  }}>
                    {t.scoreStatus}
                  </span>
                </div>

                <h4 style={{ color: '#f8fafc', fontSize: '1.15rem', margin: '0 0 6px 0' }}>{t.teamName}</h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Reg: {t.registrationNo}</div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '10px' }}>
                  <div>Leader: <strong>{t.leaderName}</strong> ({t.leaderUsn})</div>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>College: {t.leaderCollege}</div>
                </div>

                {t.participants && t.participants.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Members ({t.participants.length}): {t.participants.map(p => `${p.name} [${p.usn}]`).join(', ')}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Score:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  {t.totalScore !== undefined ? `${t.totalScore} pts` : '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ====================================================
// 5. COORDINATOR ACTIVITY LOGS (Audit Log System)
// ====================================================
function AuditLogsViewer({ toast }) {
  const { apiFetch, authToken, currentUser } = useApp();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableActions, setAvailableActions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (selectedAction !== 'all') params.append('action', selectedAction);

      const res = await apiFetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.availableActions) setAvailableActions(data.availableActions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, currentUser, page, search, selectedAction]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Export CSV
  const handleExportCSV = () => {
    window.open(`/api/audit-logs/export/csv?action=${encodeURIComponent(selectedAction)}`, '_blank');
    toast('Audit logs export triggered');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 4px 0' }}>Coordinator Activity & Audit Logs</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Immutable chronological record of every login, team creation, score entry, submission, and admin approval.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Download size={14} /> Export to CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0 12px', flex: 1, minWidth: '240px' }}>
          <Search size={14} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search by coordinator, action, log ID, description..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem', outline: 'none', width: '100%', padding: '10px 0' }}
          />
        </div>

        <select
          value={selectedAction}
          onChange={e => { setSelectedAction(e.target.value); setPage(1); }}
          style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#f8fafc', fontSize: '0.85rem' }}
        >
          <option value="all">All Actions</option>
          {availableActions.map((act, i) => (
            <option key={i} value={act}>{act}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '12px 14px' }}>Log ID</th>
              <th style={{ padding: '12px 14px' }}>Timestamp</th>
              <th style={{ padding: '12px 14px' }}>User / Coordinator</th>
              <th style={{ padding: '12px 14px' }}>Assigned Event</th>
              <th style={{ padding: '12px 14px' }}>Action</th>
              <th style={{ padding: '12px 14px' }}>Description</th>
              <th style={{ padding: '12px 14px' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  No audit logs recorded for this filter.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l._id || l.logId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>
                    {l.logId}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#38bdf8' }}>
                    {l.coordinatorName}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#f59e0b' }}>
                    {l.assignedEvent || '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#e2e8f0', maxWidth: '300px' }}>
                    {l.description}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.75rem' }}>
                    {l.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        <span>Showing {logs.length} of {total} total logs</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: page <= 1 ? '#475569' : '#f8fafc', padding: '6px 14px', borderRadius: '6px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Previous
          </button>
          <span style={{ padding: '6px 12px' }}>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: page >= totalPages ? '#475569' : '#f8fafc', padding: '6px 14px', borderRadius: '6px', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. EVENTS & CRITERIA MANAGER
// ==========================================
function EventsManager({ toast }) {
  const { events, setEvents, apiFetch } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', time: '', day: 'Day 1', rulebookLink: '', registrationLink: '',
    description: '', category: 'Technical', maxTeamSize: 4,
  });

  const resetForm = () => {
    setForm({ name: '', time: '', day: 'Day 1', rulebookLink: '', registrationLink: '', description: '', category: 'Technical', maxTeamSize: 4 });
    setEditing(null);
  };

  const startEdit = (ev) => {
    setEditing(ev.id);
    setForm({ ...ev });
    document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editing) {
        const res = await apiFetch(`/api/events/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setEvents(prev => prev.map(e => e.id === editing ? updated : e));
          toast('Event updated successfully!');
        }
      } else {
        const res = await apiFetch('/api/events', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setEvents(prev => [...prev, created]);
          toast('Event added successfully!');
        }
      }
    } catch {
      toast('Failed to save event');
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
        setEvents(prev => prev.filter(e => e.id !== id));
        toast('Event deleted');
      } catch {
        toast('Failed to delete event');
      }
    }
  };

  return (
    <div>
      <div id="event-form" className="admin-form-card">
        <h4 className="admin-form-title">{editing ? 'Edit Event' : 'Add Event'}</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Event Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM - 1:00 PM" />
          </div>
          <div className="form-group">
            <label className="form-label">Day</label>
            <select className="form-input" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
              <option value="Day 1">Day 1</option>
              <option value="Day 2">Day 2</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" />
          </div>
          <div className="form-group">
            <label className="form-label">Rulebook Link</label>
            <input className="form-input" value={form.rulebookLink} onChange={e => setForm({ ...form, rulebookLink: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">Registration Link</label>
            <input className="form-input" value={form.registrationLink} onChange={e => setForm({ ...form, registrationLink: e.target.value })} placeholder="https://unstop.com/..." />
          </div>
          <div className="form-group">
            <label className="form-label">Max Team Size</label>
            <input type="number" className="form-input" value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: Number(e.target.value) })} placeholder="4" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-admin-save" onClick={handleSave}>
            <Save size={16} /> {editing ? 'Update Event' : 'Add Event'}
          </button>
          {editing && (
            <button className="btn-admin-cancel" onClick={resetForm}>
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="admin-list">
        {events.map(ev => (
          <div className="admin-list-item" key={ev.id}>
            <div className="admin-list-info">
              <div className="admin-list-name">{ev.name}</div>
              <div className="admin-list-meta">
                <span>{ev.day}</span>
                <span>{ev.time}</span>
                <span>{ev.category}</span>
                {ev.coordinatorName && <span style={{ color: '#38bdf8' }}>Coord: {ev.coordinatorName}</span>}
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="btn-edit" onClick={() => startEdit(ev)}><Edit3 size={15} /></button>
              <button className="btn-delete" onClick={() => handleDelete(ev.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 7. SCOREBOARD MANAGER (Super Admin)
// ==========================================
function ScoreboardManager({ toast }) {
  const { scoreboard, refreshScoreboard, apiFetch } = useApp();
  const [collegeName, setCollegeName] = useState('');
  const [score, setScore] = useState('');

  const handleAdd = async () => {
    if (!collegeName.trim()) return;
    try {
      const res = await apiFetch('/api/scoreboard', {
        method: 'POST',
        body: JSON.stringify({ collegeName, score: Number(score) || 0 }),
      });
      if (res.ok) {
        toast(`Score for "${collegeName}" saved!`);
        setCollegeName('');
        setScore('');
        refreshScoreboard();
      }
    } catch {
      toast('Failed to update scoreboard');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this college score?')) {
      try {
        await apiFetch(`/api/scoreboard/${id}`, { method: 'DELETE' });
        toast('College score deleted');
        refreshScoreboard();
      } catch {
        toast('Failed to delete score');
      }
    }
  };

  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);

  return (
    <div>
      <div className="admin-form-card">
        <h4 className="admin-form-title">Add / Update College Score</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '14px' }}>
          Approved coordinator submissions automatically add scores to colleges. You can also manually adjust or add teams below.
        </p>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">College / Team Name *</label>
            <input className="form-input" value={collegeName} onChange={e => setCollegeName(e.target.value)} placeholder="College Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Score (points)</label>
            <input type="number" className="form-input" value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 500" />
          </div>
        </div>
        <button className="btn-admin-save" onClick={handleAdd} style={{ marginTop: '12px' }}>
          <Save size={16} /> Save Score
        </button>
      </div>

      <div className="admin-scoreboard-table">
        <div className="admin-score-header">
          <span>Rank</span>
          <span>College / Team</span>
          <span>Score</span>
          <span>Action</span>
        </div>
        {sorted.map((entry, idx) => (
          <div className="admin-score-row" key={entry.id || idx}>
            <div className="admin-rank">#{idx + 1}</div>
            <div className="admin-college-name">{entry.collegeName}</div>
            <div className="admin-score-val">{entry.score} pts</div>
            <div className="admin-list-actions">
              <button className="btn-delete" onClick={() => handleDelete(entry.id || entry._id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 8. CREW TEAM MANAGER
// ==========================================
function TeamManager({ toast }) {
  const { teamMembers, setTeamMembers } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', category: 'organizer', org: '', photo: '' });

  const resetForm = () => {
    setForm({ name: '', role: '', category: 'organizer', org: '', photo: '' });
    setEditing(null);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setTeamMembers(prev => prev.map(m => m.id === editing ? { ...form, id: editing } : m));
      toast('Team member updated!');
    } else {
      setTeamMembers(prev => [...prev, { ...form, id: Date.now().toString() }]);
      toast('Team member added!');
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete team member?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      toast('Team member deleted');
    }
  };

  return (
    <div>
      <div className="admin-form-card">
        <h4 className="admin-form-title">{editing ? 'Edit Member' : 'Add Member'}</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Vice Chancellor" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="organizer">Organizer</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Organization</label>
            <input className="form-input" value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} placeholder="GM University" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-admin-save" onClick={handleSave}><Save size={16} /> Save</button>
          {editing && <button className="btn-admin-cancel" onClick={resetForm}><X size={16} /> Cancel</button>}
        </div>
      </div>

      <div className="admin-list">
        {teamMembers.map(m => (
          <div className="admin-list-item" key={m.id}>
            <div className="admin-list-info">
              <div className="admin-list-name">{m.name}</div>
              <div className="admin-list-meta">
                <span>{m.role}</span>
                <span>{m.category}</span>
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="btn-delete" onClick={() => handleDelete(m.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 9. COUNTDOWN MANAGER
// ==========================================
function CountdownManager({ toast }) {
  const { countdown, setCountdown } = useApp();
  const [val, setVal] = useState(countdown);

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Countdown Target Date</h4>
      <input type="datetime-local" className="form-input" value={val} onChange={e => setVal(e.target.value)} />
      <button className="btn-admin-save" style={{ marginTop: '12px' }} onClick={() => { setCountdown(val); toast('Countdown updated!'); }}>
        <Save size={16} /> Save Countdown
      </button>
    </div>
  );
}

// ==========================================
// 10. BROCHURE LINK MANAGER
// ==========================================
function BrochureManager({ toast }) {
  const { brochureLink, setBrochureLink } = useApp();
  const [val, setVal] = useState(brochureLink);

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Event Brochure Link</h4>
      <input type="text" className="form-input" value={val} onChange={e => setVal(e.target.value)} placeholder="https://..." />
      <button className="btn-admin-save" style={{ marginTop: '12px' }} onClick={() => { setBrochureLink(val); toast('Brochure link updated!'); }}>
        <Save size={16} /> Save Brochure Link
      </button>
    </div>
  );
}

// ====================================================
// MAIN SUPER ADMIN DASHBOARD COMPONENT
// ====================================================
export default function AdminDashboard() {
  const { currentUser, adminLogout, apiFetch } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [stats, setStats] = useState(null);

  // Authentication Guard
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin');
    } else if (currentUser.role === 'coordinator') {
      navigate('/coordinator/dashboard');
    }
  }, [currentUser, navigate]);

  // Load Overview Stats
  const loadStats = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    try {
      const res = await apiFetch('/api/overview/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [apiFetch, currentUser]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Master Overview', icon: <BarChart3 size={18} /> },
    { id: 'approvals', label: 'Result Approvals', icon: <Shield size={18} />, badge: stats?.pendingSubmissions },
    { id: 'coordinators', label: 'Event Coordinators', icon: <UserPlus size={18} /> },
    { id: 'allteams', label: 'Registered Teams', icon: <Users size={18} /> },
    { id: 'auditlogs', label: 'Activity & Audit Logs', icon: <Activity size={18} /> },
    { id: 'events', label: 'Events & Rules', icon: <Calendar size={18} /> },
    { id: 'scoreboard', label: 'Scoreboard Standings', icon: <Trophy size={18} /> },
    { id: 'team', label: 'Organizers / Crew', icon: <Users size={18} /> },
    { id: 'countdown', label: 'Countdown Timer', icon: <Clock size={18} /> },
    { id: 'brochure', label: 'Brochure Link', icon: <Link size={18} /> },
  ];

  if (currentUser?.role === 'superadmin' && !stats) {
    return <Loader text="Loading Super Admin Portal..." fullScreen />;
  }

  return (
    <div className="admin-dashboard">
      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg('')} />}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/gmu_logo.png" alt="GMU" className="sidebar-gmu-logo" />
          <div className="sidebar-brand-text">
            <div className="sidebar-title">IGNITRON 2K26</div>
            <div className="sidebar-sub">SUPER ADMIN CONTROL</div>
          </div>
        </div>

        <div className="sidebar-status-pill">
          <span className="status-dot-pulse" />
          <span>SUPER ADMIN ACTIVE</span>
        </div>

        <div className="sidebar-section-label">MANAGEMENT CONSOLE</div>

        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
            >
              <div className="sidebar-link-left">
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={14} className="sidebar-link-arrow" />
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="btn-sidebar-site" target="_blank" rel="noreferrer">
            <Globe size={16} /> View Website
          </a>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="admin-topbar-title">Super Admin Portal</h1>
              <p className="admin-topbar-sub">Master Control · Ignitron 2K26 GMU</p>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-badge-live">Live System</span>
          </div>
        </div>

        <div className="admin-sections" style={{ padding: '24px' }}>
          {activeTab === 'overview' && <OverviewPanel stats={stats} onSelectTab={setActiveTab} />}
          {activeTab === 'approvals' && <ResultApprovalManager toast={showToast} onRefreshStats={loadStats} />}
          {activeTab === 'coordinators' && <CoordinatorManager toast={showToast} onRefreshStats={loadStats} />}
          {activeTab === 'allteams' && <AllTeamsViewer toast={showToast} />}
          {activeTab === 'auditlogs' && <AuditLogsViewer toast={showToast} />}
          {activeTab === 'events' && <EventsManager toast={showToast} />}
          {activeTab === 'scoreboard' && <ScoreboardManager toast={showToast} />}
          {activeTab === 'team' && <TeamManager toast={showToast} />}
          {activeTab === 'countdown' && <CountdownManager toast={showToast} />}
          {activeTab === 'brochure' && <BrochureManager toast={showToast} />}
        </div>
      </main>
    </div>
  );
}
