import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { SkeletonKPI, SkeletonTable, SkeletonCards, CyberErrorState } from '../components/CyberSkeleton';
import {
  LogOut, Plus, Trash2, Edit3, Save, X, Upload,
  Calendar, Users, Trophy, Clock, Link, FileText,
  Settings, ChevronDown, ChevronUp, CheckCircle, Menu, ChevronRight, Globe, Folder,
  Shield, Check, AlertTriangle, XCircle, Search, Download, Eye, KeyRound, RefreshCw,
  BarChart3, UserPlus, Sliders, Activity, Filter, Hotel
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
function OverviewPanel({ stats, loading, isError, onRetry, onSelectTab }) {
  if (loading && !stats) {
    return (
      <div>
        <SkeletonKPI count={6} />
        <div className="admin-overview-grid" style={{ marginTop: '20px' }}>
          <div className="cyber-skeleton-card" style={{ minHeight: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="cyber-skeleton-line" style={{ width: '40%', height: '20px', borderRadius: '4px' }} />
              <div className="cyber-skeleton-line" style={{ width: '20%', height: '16px', borderRadius: '4px' }} />
            </div>
            {[1, 2, 3, 4].map(k => (
              <div key={k} className="cyber-skeleton-line" style={{ width: '100%', height: '42px', borderRadius: '8px', marginBottom: '10px' }} />
            ))}
          </div>
          <div className="cyber-skeleton-card" style={{ minHeight: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="cyber-skeleton-line" style={{ width: '45%', height: '20px', borderRadius: '4px' }} />
              <div className="cyber-skeleton-line" style={{ width: '20%', height: '16px', borderRadius: '4px' }} />
            </div>
            {[1, 2, 3, 4].map(k => (
              <div key={k} className="cyber-skeleton-line" style={{ width: '100%', height: '42px', borderRadius: '8px', marginBottom: '10px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <CyberErrorState
        title="Operations Telemetry Offline"
        message="Unable to fetch overview metrics from the live server. Please verify your connection."
        onRetry={onRetry}
      />
    );
  }

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
  const queryClient = useQueryClient();

  // Score details modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Reject / Request Correction modal
  const [rejectingSub, setRejectingSub] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isCorrectionRequest, setIsCorrectionRequest] = useState(false);

  const {
    data: submissions = [],
    isLoading: loading,
    isError,
    error,
    refetch: fetchSubmissions,
  } = useQuery({
    queryKey: ['admin', 'submissions'],
    queryFn: async () => {
      const res = await apiFetch('/api/submissions');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch score submissions');
      }
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
        <button onClick={() => fetchSubmissions()} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <SkeletonCards count={4} />
      ) : isError ? (
        <CyberErrorState
          title="Submission Telemetry Offline"
          message={error?.message || 'Failed to stream score evaluations from database server.'}
          onRetry={fetchSubmissions}
        />
      ) : submissions.length === 0 ? (
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
  const queryClient = useQueryClient();

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

  const {
    data: coordinators = [],
    isLoading: loading,
    isError,
    error,
    refetch: loadData,
  } = useQuery({
    queryKey: ['admin', 'coordinators'],
    queryFn: async () => {
      const res = await apiFetch('/api/coordinators');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch coordinators');
      }
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

  const { data: eventsList = [] } = useQuery({
    queryKey: ['admin', 'events-list'],
    queryFn: async () => {
      const res = await apiFetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin', 'coordinators'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
        queryClient.invalidateQueries({ queryKey: ['admin', 'coordinators'] });
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
        queryClient.invalidateQueries({ queryKey: ['admin', 'coordinators'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      {isError ? (
        <CyberErrorState message={error?.message || 'Failed to load coordinator telemetry'} onRetry={loadData} />
      ) : loading ? (
        <SkeletonTable
          rows={6}
          cols={7}
          headers={['Coordinator Name', 'Username / ID', 'Assigned Event', 'Department', 'Contact', 'Status', 'Actions']}
        />
      ) : (
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
      )}

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
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: teams = [],
    isLoading: loading,
    isError,
    error,
    refetch: loadTeams,
  } = useQuery({
    queryKey: ['admin', 'teams', selectedEvent],
    queryFn: async () => {
      const url = selectedEvent !== 'all' ? `/api/teams?event=${encodeURIComponent(selectedEvent)}` : '/api/teams';
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch registered teams');
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

  const { data: eventsList = [] } = useQuery({
    queryKey: ['admin', 'events-list'],
    queryFn: async () => {
      const res = await apiFetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

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

      {isError ? (
        <CyberErrorState message={error?.message || 'Failed to load teams telemetry'} onRetry={loadTeams} />
      ) : loading ? (
        <SkeletonCards count={6} />
      ) : (
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
      )}
    </div>
  );
}

// ====================================================
// 5. COORDINATOR ACTIVITY LOGS (Audit Log System)
// ====================================================
function AuditLogsViewer({ toast }) {
  const { apiFetch, currentUser } = useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const {
    data: auditData = { logs: [], total: 0, totalPages: 1, availableActions: [] },
    isLoading: loading,
    isError,
    error,
    refetch: loadLogs,
  } = useQuery({
    queryKey: ['admin', 'audit-logs', page, search, selectedAction],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (selectedAction !== 'all') params.append('action', selectedAction);

      const res = await apiFetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit telemetry');
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
    placeholderData: (prev) => prev,
  });

  const logs = auditData.logs || [];
  const total = auditData.total || 0;
  const totalPages = auditData.totalPages || 1;
  const availableActions = auditData.availableActions || [];

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
      {isError ? (
        <CyberErrorState message={error?.message || 'Failed to load audit telemetry'} onRetry={loadLogs} />
      ) : (loading && logs.length === 0) ? (
        <SkeletonTable
          rows={8}
          cols={7}
          headers={['Log ID', 'Timestamp', 'User / Coordinator', 'Assigned Event', 'Action', 'Description', 'IP']}
        />
      ) : (
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
      )}

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
// 8. CREW TEAM MANAGER (Connected to MongoDB & Cloudinary)
// ==========================================
function TeamManager({ toast }) {
  const { teamMembers, refreshTeamMembers, apiFetch } = useApp();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({
    name: '',
    role: '',
    category: 'organizer',
    org: 'GM University',
    photo: '',
    cloudinaryPublicId: '',
  });

  const resetForm = () => {
    setForm({ name: '', role: '', category: 'organizer', org: 'GM University', photo: '', cloudinaryPublicId: '' });
    setEditing(null);
  };

  const startEdit = (m) => {
    setForm({
      name: m.name || '',
      role: m.role || '',
      category: m.category === 'core' ? 'core' : 'organizer',
      org: m.org || 'GM University',
      photo: m.photo || '',
      cloudinaryPublicId: m.cloudinaryPublicId || '',
    });
    setEditing(m.id || m._id);
    document.getElementById('team-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast('Image file exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await apiFetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: reader.result,
            folder: 'ignitron/team',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            photo: data.url,
            cloudinaryPublicId: data.publicId || '',
          }));
          toast('Photo uploaded successfully!');
        } else {
          setForm(prev => ({ ...prev, photo: reader.result }));
          toast('Photo attached locally (fallback)');
        }
      } catch {
        setForm(prev => ({ ...prev, photo: reader.result }));
        toast('Photo attached locally (fallback)');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast('Please enter both name and role');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await apiFetch(`/api/team/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast('Team member updated in database & synced across all devices!');
        } else {
          const errData = await res.json();
          toast(`Error: ${errData.error || 'Failed to update'}`);
        }
      } else {
        const res = await apiFetch('/api/team', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast('Team member added to database & synced across all devices!');
        } else {
          const errData = await res.json();
          toast(`Error: ${errData.error || 'Failed to add'}`);
        }
      }
      await refreshTeamMembers();
      resetForm();
    } catch {
      toast('Failed to save team member to central database');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete team member "${name}" from central database?`)) {
      try {
        const res = await apiFetch(`/api/team/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast(`Deleted "${name}" successfully across all devices`);
          await refreshTeamMembers();
        } else {
          toast('Failed to delete team member');
        }
      } catch {
        toast('Network error deleting team member');
      }
    }
  };

  const filteredMembers = (teamMembers || []).filter(m => {
    if (filterCat === 'all') return true;
    return m.category === filterCat;
  });

  return (
    <div>
      <div className="admin-form-card" id="team-form-card">
        <h4 className="admin-form-title">{editing ? 'Edit Team Member' : 'Add Team Member'}</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Vice Chancellor / Core Team" />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="organizer">Organizer</option>
              <option value="core">Core Member</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Organization</label>
            <input className="form-input" value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} placeholder="GM University" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Photo / Image</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: '220px' }}
                value={form.photo}
                onChange={e => setForm({ ...form, photo: e.target.value })}
                placeholder="Image URL or local path (/team/photo.png)"
              />
              <label
                htmlFor="team-photo-upload"
                className="btn-admin-cancel"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, padding: '8px 14px' }}
              >
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="team-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>
            {form.photo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <img
                  src={form.photo}
                  alt="Preview"
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00D9FF' }}
                />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {form.cloudinaryPublicId ? '✓ Cloudinary Hosted' : 'Photo Attached'}
                </span>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, photo: '', cloudinaryPublicId: '' }))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                >
                  Clear Image
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button className="btn-admin-save" onClick={handleSave} disabled={saving || uploading}>
            <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Member'}
          </button>
          {editing && <button className="btn-admin-cancel" onClick={resetForm}><X size={16} /> Cancel</button>}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 12px' }}>
        {['all', 'organizer', 'core'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`btn-admin-filter ${filterCat === cat ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: filterCat === cat ? 'rgba(0, 217, 255, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: filterCat === cat ? '#00D9FF' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {cat === 'all' ? 'All Members' : cat === 'core' ? 'Core Members' : 'Organizers'}
          </button>
        ))}
      </div>

      <div className="admin-list">
        {filteredMembers.map(m => (
          <div className="admin-list-item" key={m.id || m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {m.photo ? (
                <img
                  src={m.photo}
                  alt={m.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                  {(m.name || '').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="admin-list-info">
                <div className="admin-list-name">{m.name}</div>
                <div className="admin-list-meta">
                  <span>{m.role}</span>
                  <span style={{ textTransform: 'capitalize', color: m.category === 'core' ? '#38bdf8' : '#34d399', fontWeight: 600 }}>
                    {m.category === 'core' ? 'Core Member' : 'Organizer'}
                  </span>
                  {m.org && <span style={{ color: '#64748b' }}>({m.org})</span>}
                </div>
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="btn-edit" onClick={() => startEdit(m)} title="Edit Member"><Edit3 size={15} /></button>
              <button className="btn-delete" onClick={() => handleDelete(m.id || m._id, m.name)} title="Delete Member"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 9. COUNTDOWN MANAGER (MongoDB Sync)
// ==========================================
function CountdownManager({ toast }) {
  const { countdown, setCountdown } = useApp();
  const [val, setVal] = useState(countdown);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVal(countdown);
  }, [countdown]);

  const handleSave = async () => {
    setSaving(true);
    await setCountdown(val);
    setSaving(false);
    toast('Countdown target date updated and synchronized across all devices!');
  };

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Countdown Target Date</h4>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
        Changes are stored in the central MongoDB database and revalidated across all connected devices in real time.
      </p>
      <input type="datetime-local" className="form-input" value={val} onChange={e => setVal(e.target.value)} />
      <button className="btn-admin-save" style={{ marginTop: '14px' }} onClick={handleSave} disabled={saving}>
        <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Countdown'}
      </button>
    </div>
  );
}

// ==========================================
// 10. BROCHURE LINK MANAGER (MongoDB Sync)
// ==========================================
function BrochureManager({ toast }) {
  const { brochureLink, setBrochureLink } = useApp();
  const [val, setVal] = useState(brochureLink);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVal(brochureLink);
  }, [brochureLink]);

  const handleSave = async () => {
    setSaving(true);
    await setBrochureLink(val);
    setSaving(false);
    toast('Event brochure link updated and synchronized across all devices!');
  };

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Event Brochure Link</h4>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
        Central database driven link for the brochure button in the header and mobile drawer.
      </p>
      <input type="text" className="form-input" value={val} onChange={e => setVal(e.target.value)} placeholder="https://..." />
      <button className="btn-admin-save" style={{ marginTop: '14px' }} onClick={handleSave} disabled={saving}>
        <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Brochure Link'}
      </button>
    </div>
  );
}

// ==========================================
// 11. ACCOMMODATION PORTAL MANAGER (MongoDB Sync)
// ==========================================
function AccommodationManager({ toast }) {
  const { accommodationLink, setAccommodationLink } = useApp();
  const [val, setVal] = useState(accommodationLink || 'https://accomadation.vercel.app/');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (accommodationLink) setVal(accommodationLink);
  }, [accommodationLink]);

  const handleSave = async () => {
    setSaving(true);
    await setAccommodationLink(val);
    setSaving(false);
    toast('Accommodation booking URL saved to database and live across all devices!');
  };

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Book My Accommodation Portal</h4>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
        Configure the official redirect destination for the &quot;Book Accommodation&quot; buttons on the navbar and mobile menu.
      </p>
      <div className="form-group">
        <label className="form-label">Accommodation Website URL *</label>
        <input
          type="text"
          className="form-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="https://accomadation.vercel.app/"
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
        <button className="btn-admin-save" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Accommodation Link'}
        </button>
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-admin-cancel"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Globe size={14} /> Test Portal Link
        </a>
      </div>
    </div>
  );
}

// ==========================================
// 12. GALLERY MANAGER (Cloudinary & Database Sync)
// ==========================================
function GalleryManager({ toast }) {
  const { gallery, refreshGallery, apiFetch } = useApp();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    caption: '',
    year: '2K25',
    src: '',
    cloudinaryPublicId: '',
    isHomeFeatured: false,
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast('Image exceeds 15MB limit.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await apiFetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: reader.result,
            folder: 'ignitron/gallery',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            src: data.url,
            cloudinaryPublicId: data.publicId || '',
          }));
          toast('Gallery photo uploaded!');
        } else {
          setForm(prev => ({ ...prev, src: reader.result }));
          toast('Photo attached locally (fallback)');
        }
      } catch {
        setForm(prev => ({ ...prev, src: reader.result }));
        toast('Photo attached locally (fallback)');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async () => {
    if (!form.src) {
      toast('Please upload an image or provide a valid photo URL');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch('/api/gallery', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast('Photo added to gallery and synced across all devices!');
        setForm({ caption: '', year: '2K25', src: '', cloudinaryPublicId: '', isHomeFeatured: false });
        await refreshGallery();
      } else {
        const errData = await res.json();
        toast(`Error: ${errData.error || 'Failed to add photo'}`);
      }
    } catch {
      toast('Failed to save gallery photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (id, caption) => {
    if (window.confirm(`Delete photo "${caption}" from gallery?`)) {
      try {
        const res = await apiFetch(`/api/gallery/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast('Photo deleted and removed across all devices');
          await refreshGallery();
        } else {
          toast('Failed to delete photo');
        }
      } catch {
        toast('Network error deleting photo');
      }
    }
  };

  return (
    <div>
      <div className="admin-form-card">
        <h4 className="admin-form-title">Add Photo to Gallery</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Caption / Description</label>
            <input
              className="form-input"
              value={form.caption}
              onChange={e => setForm({ ...form, caption: e.target.value })}
              placeholder="e.g. Hackathon Grand Finale Winner"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Event Year</label>
            <select
              className="form-input"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
            >
              <option value="2K25">Ignitron 2K25</option>
              <option value="2K26">Ignitron 2K26</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Photo Source (Upload or Image URL)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: '220px' }}
                value={form.src}
                onChange={e => setForm({ ...form, src: e.target.value })}
                placeholder="https://... or /gallery/photo.jpg"
              />
              <label
                htmlFor="gallery-file-upload"
                className="btn-admin-cancel"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, padding: '8px 14px' }}
              >
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="gallery-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>
            {form.src && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <img
                  src={form.src}
                  alt="Preview"
                  style={{ width: '60px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #00D9FF' }}
                />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {form.cloudinaryPublicId ? '✓ Uploaded to Cloudinary' : 'Image Ready'}
                </span>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, src: '', cloudinaryPublicId: '' }))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <button className="btn-admin-save" onClick={handleAddPhoto} disabled={saving || uploading}>
            <Plus size={16} /> {saving ? 'Adding to Gallery...' : 'Add Photo to Gallery'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
          Uploaded Database Photos ({Array.isArray(gallery) ? gallery.length : 0})
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {(gallery || []).map(p => (
            <div
              key={p._id || p.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={p.src}
                alt={p.caption}
                style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.caption || 'Ignitron 2K25'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: 700 }}>
                    {p.year || '2K25'}
                  </span>
                  <button
                    onClick={() => handleDeletePhoto(p._id || p.id, p.caption)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. TIMELINE SCHEDULE MANAGER (MongoDB Sync)
// ==========================================
function TimelineManager({ toast }) {
  const { timeline, refreshTimeline, apiFetch } = useApp();
  const [selectedDay, setSelectedDay] = useState('day1');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    day: 'day1',
    time: '',
    event: '',
    tagline: '',
    venue: '',
    club: '',
    rulebookLink: '',
    registrationLink: '',
  });

  const resetForm = () => {
    setForm({
      day: selectedDay,
      time: '',
      event: '',
      tagline: '',
      venue: '',
      club: '',
      rulebookLink: '',
      registrationLink: '',
    });
    setEditing(null);
  };

  const startEdit = (item) => {
    setEditing(item._id || item.id);
    setForm({
      day: item.day || selectedDay,
      time: item.time || '',
      event: item.event || '',
      tagline: item.tagline || '',
      venue: item.venue || '',
      club: item.club || '',
      rulebookLink: item.rulebookLink || '',
      registrationLink: item.registrationLink || '',
    });
    document.getElementById('timeline-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.time.trim() || !form.event.trim()) {
      toast('Please enter both Event Title and Time');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await apiFetch(`/api/timeline/${editing}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, day: selectedDay }),
        });
        if (res.ok) {
          toast('Timeline schedule item updated and synced across all devices!');
        } else {
          toast('Failed to update timeline item');
        }
      } else {
        const res = await apiFetch('/api/timeline', {
          method: 'POST',
          body: JSON.stringify({ ...form, day: selectedDay }),
        });
        if (res.ok) {
          toast('New timeline event added to central schedule!');
        } else {
          toast('Failed to add timeline event');
        }
      }
      await refreshTimeline();
      resetForm();
    } catch {
      toast('Network error saving timeline item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, eventTitle) => {
    if (window.confirm(`Delete "${eventTitle}" from timeline schedule?`)) {
      try {
        const res = await apiFetch(`/api/timeline/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast(`Deleted "${eventTitle}" from schedule across all devices`);
          await refreshTimeline();
        } else {
          toast('Failed to delete timeline event');
        }
      } catch {
        toast('Network error deleting timeline event');
      }
    }
  };

  const currentEvents = timeline?.[selectedDay] || [];

  return (
    <div>
      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'day1', label: 'Day 1 · Dec 03' },
          { key: 'day2', label: 'Day 2 · Dec 04' },
          { key: 'day3', label: 'Day 3 · Dec 05' },
        ].map(d => (
          <button
            key={d.key}
            onClick={() => { setSelectedDay(d.key); setForm(prev => ({ ...prev, day: d.key })); setEditing(null); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: selectedDay === d.key ? 'rgba(0, 217, 255, 0.18)' : 'rgba(15, 23, 42, 0.6)',
              color: selectedDay === d.key ? '#00D9FF' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="admin-form-card" id="timeline-form-card">
        <h4 className="admin-form-title">{editing ? 'Edit Timeline Event' : `Add Event to ${selectedDay.toUpperCase()}`}</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input className="form-input" value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} placeholder="e.g. Code Rush – 24 Hours Hackathon" />
          </div>
          <div className="form-group">
            <label className="form-label">Time Slot *</label>
            <input className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 02:00 PM – 05:00 PM" />
          </div>
          <div className="form-group">
            <label className="form-label">Venue</label>
            <input className="form-input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Central Library / Auditorium" />
          </div>
          <div className="form-group">
            <label className="form-label">Club / Department</label>
            <input className="form-input" value={form.club} onChange={e => setForm({ ...form, club: e.target.value })} placeholder="e.g. Computer Science / Robotics" />
          </div>
          <div className="form-group">
            <label className="form-label">Tagline / Short Summary</label>
            <input className="form-input" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Brief 1-line event summary" />
          </div>
          <div className="form-group">
            <label className="form-label">Rulebook Link (Google Drive)</label>
            <input className="form-input" value={form.rulebookLink} onChange={e => setForm({ ...form, rulebookLink: e.target.value })} placeholder="https://drive.google.com/..." />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Unstop / Registration Link</label>
            <input className="form-input" value={form.registrationLink} onChange={e => setForm({ ...form, registrationLink: e.target.value })} placeholder="https://unstop.com/p/..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button className="btn-admin-save" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Timeline Event'}
          </button>
          {editing && <button className="btn-admin-cancel" onClick={resetForm}><X size={16} /> Cancel</button>}
        </div>
      </div>

      <div className="admin-list" style={{ marginTop: '20px' }}>
        {currentEvents.map((item, idx) => (
          <div className="admin-list-item" key={item._id || item.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div className="admin-list-info">
              <div className="admin-list-name" style={{ color: '#f8fafc' }}>{item.event}</div>
              <div className="admin-list-meta">
                <span style={{ color: '#00D9FF', fontWeight: 600 }}>{item.time}</span>
                {item.venue && <span>📍 {item.venue}</span>}
                {item.club && <span style={{ color: '#34d399' }}>[{item.club}]</span>}
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="btn-edit" onClick={() => startEdit(item)} title="Edit Event"><Edit3 size={15} /></button>
              <button className="btn-delete" onClick={() => handleDelete(item._id || item.id, item.event)} title="Delete Event"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
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
  // Authentication Guard
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin');
    } else if (currentUser.role === 'coordinator') {
      navigate('/coordinator/dashboard');
    }
  }, [currentUser, navigate]);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: loadStats,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiFetch('/api/overview/stats');
      if (!res.ok) throw new Error('Failed to load overview telemetry');
      return res.json();
    },
    enabled: !!currentUser && currentUser.role === 'superadmin',
  });

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
    { id: 'timeline', label: 'Timeline Schedule', icon: <Clock size={18} /> },
    { id: 'gallery', label: 'Gallery Management', icon: <Folder size={18} /> },
    { id: 'accommodation', label: 'Accommodation Link', icon: <Hotel size={18} /> },
    { id: 'countdown', label: 'Countdown Timer', icon: <Clock size={18} /> },
    { id: 'brochure', label: 'Brochure Link', icon: <Link size={18} /> },
  ];

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
          {activeTab === 'overview' && (
            <OverviewPanel
              stats={stats}
              loading={statsLoading}
              isError={statsError}
              onRetry={loadStats}
              onSelectTab={setActiveTab}
            />
          )}
          {activeTab === 'approvals' && <ResultApprovalManager toast={showToast} onRefreshStats={loadStats} />}
          {activeTab === 'coordinators' && <CoordinatorManager toast={showToast} onRefreshStats={loadStats} />}
          {activeTab === 'allteams' && <AllTeamsViewer toast={showToast} />}
          {activeTab === 'auditlogs' && <AuditLogsViewer toast={showToast} />}
          {activeTab === 'events' && <EventsManager toast={showToast} />}
          {activeTab === 'scoreboard' && <ScoreboardManager toast={showToast} />}
          {activeTab === 'team' && <TeamManager toast={showToast} />}
          {activeTab === 'timeline' && <TimelineManager toast={showToast} />}
          {activeTab === 'gallery' && <GalleryManager toast={showToast} />}
          {activeTab === 'accommodation' && <AccommodationManager toast={showToast} />}
          {activeTab === 'countdown' && <CountdownManager toast={showToast} />}
          {activeTab === 'brochure' && <BrochureManager toast={showToast} />}
        </div>
      </main>
    </div>
  );
}
