import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users,
  Trophy,
  Plus,
  Edit,
  Trash2,
  FileText,
  Send,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  LogOut,
  Sparkles,
  Award,
  Calendar,
  Building,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Save,
  Check,
  Layers,
  MapPin,
  Flame,
  User as UserIcon,
  Shield,
  Activity,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { generateCoordinatorReportPDF } from '../utils/pdfGenerator';
import { SkeletonCards, SkeletonTable, CyberErrorState } from '../components/CyberSkeleton';

export default function CoordinatorDashboard() {
  const { currentUser, authToken, adminLogout, apiFetch } = useApp();
  const navigate = useNavigate();

  // Instant synchronous guard — completely blocks rendering if unauthenticated
  if (!authToken || !currentUser) {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser.role === 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'scoring', 'history'
  const [teams, setTeams] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state for Team Registration
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    leaderName: '',
    leaderUsn: '',
    leaderCollege: '',
    leaderMobile: '',
    participants: [{ name: '', usn: '' }],
  });
  const [teamFormError, setTeamFormError] = useState('');

  // Local state for inline scores entry per team (in scoring tab)
  const [teamScoresState, setTeamScoresState] = useState({});
  const [teamRemarksState, setTeamRemarksState] = useState({});
  const [teamJudgesState, setTeamJudgesState] = useState({});
  const [savingTeamId, setSavingTeamId] = useState(null);
  const [hackathonRound, setHackathonRound] = useState('round1'); // 'round1' | 'round2'

  // Submit confirmation modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check auth
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin');
    } else if (currentUser.role === 'superadmin') {
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  const assignedEvent = currentUser?.assignedEvent || '';

  // Toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load event details, teams, submission status, and logs concurrently in parallel
  const loadDashboardData = useCallback(async () => {
    if (!assignedEvent) return;
    try {
      setLoading(true);
      setLoadError(null);

      const [evRes, teamsRes, subRes, logsRes] = await Promise.all([
        apiFetch(`/api/events/${encodeURIComponent(assignedEvent)}`),
        apiFetch(`/api/teams?event=${encodeURIComponent(assignedEvent)}`),
        apiFetch(`/api/submissions`),
        apiFetch(`/api/audit-logs/my-logs`),
      ]);

      if (evRes.ok) {
        const ev = await evRes.json();
        setEventData(ev);
      }

      if (teamsRes.ok) {
        const tms = await teamsRes.json();
        setTeams(tms);

        // Pre-populate inline scores state
        const initialScores = {};
        const initialRemarks = {};
        const initialJudges = {};
        tms.forEach(t => {
          const s = t.scores ? (typeof t.scores.get === 'function' ? Object.fromEntries(t.scores) : t.scores) : {};
          initialScores[t._id] = s;
          initialRemarks[t._id] = t.remarks || '';
          initialJudges[t._id] = t.judgeName || '';
        });
        setTeamScoresState(initialScores);
        setTeamRemarksState(initialRemarks);
        setTeamJudgesState(initialJudges);
      }

      if (subRes.ok) {
        const subs = await subRes.json();
        const evSub = subs.find(s => s.eventName === assignedEvent);
        setSubmission(evSub || null);
      }

      if (logsRes.ok) {
        const logs = await logsRes.json();
        setActivityLogs(logs);
      }
    } catch (err) {
      console.error('Failed to load coordinator data:', err);
      setLoadError(err.message || 'Failed to fetch coordinator telemetry');
    } finally {
      setLoading(false);
    }
  }, [assignedEvent, apiFetch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Logout
  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin');
  };

  // Check if locked
  const isLocked = submission?.status === 'pending' || submission?.status === 'approved';

  // Criteria list helper
  const isHackathonEvent = eventData?.isHackathon || (assignedEvent && assignedEvent.toLowerCase().includes('code rush'));
  const criteriaList = eventData?.scoringCriteria && eventData.scoringCriteria.length > 0
    ? eventData.scoringCriteria
    : (isHackathonEvent
        ? [
            { key: 'round1', name: 'Round 1', maxMarks: 50 },
            { key: 'round2', name: 'Round 2', maxMarks: 50 },
          ]
        : [
            { key: 'marks', name: 'Score', maxMarks: 100 },
          ]
      );

  // Open Add Team Modal
  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setTeamForm({
      teamName: '',
      leaderName: '',
      leaderUsn: '',
      leaderCollege: '',
      leaderMobile: '',
      participants: [{ name: '', usn: '' }],
    });
    setTeamFormError('');
    setShowTeamModal(true);
  };

  // Open Edit Team Modal
  const handleOpenEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      teamName: team.teamName,
      leaderName: team.leaderName,
      leaderUsn: team.leaderUsn,
      leaderCollege: team.leaderCollege,
      leaderMobile: team.leaderMobile || '',
      participants: team.participants && team.participants.length > 0
        ? team.participants.map(p => ({ name: p.name, usn: p.usn }))
        : [{ name: '', usn: '' }],
    });
    setTeamFormError('');
    setShowTeamModal(true);
  };

  // Add Dynamic Participant
  const handleAddParticipant = () => {
    setTeamForm(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', usn: '' }],
    }));
  };

  // Remove Dynamic Participant
  const handleRemoveParticipant = (index) => {
    setTeamForm(prev => ({
      ...prev,
      participants: prev.participants.filter((_, idx) => idx !== index),
    }));
  };

  // Update Dynamic Participant
  const handleParticipantChange = (index, field, value) => {
    setTeamForm(prev => {
      const nextParticipants = [...prev.participants];
      nextParticipants[index] = { ...nextParticipants[index], [field]: value };
      return { ...prev, participants: nextParticipants };
    });
  };

  // Save Team (Create or Edit)
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setTeamFormError('');

    if (!teamForm.teamName.trim() || !teamForm.leaderName.trim() || !teamForm.leaderUsn.trim() || !teamForm.leaderCollege.trim()) {
      setTeamFormError('Please fill out all required team and leader fields.');
      return;
    }

    try {
      const payload = {
        eventId: eventData?.id || assignedEvent,
        eventName: assignedEvent,
        teamName: teamForm.teamName,
        leaderName: teamForm.leaderName,
        leaderUsn: teamForm.leaderUsn,
        leaderCollege: teamForm.leaderCollege,
        leaderMobile: teamForm.leaderMobile,
        participants: teamForm.participants.filter(p => p.name.trim() && p.usn.trim()),
      };

      const url = editingTeam ? `/api/teams/${editingTeam._id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setTeamFormError(data.error || 'Failed to save team registration');
        return;
      }

      setShowTeamModal(false);
      triggerToast(editingTeam ? `Team "${payload.teamName}" updated successfully` : `Team "${payload.teamName}" registered successfully!`);
      loadDashboardData();
    } catch {
      setTeamFormError('An error occurred while saving the team.');
    }
  };

  // Delete Team
  const handleDeleteTeam = async (team) => {
    if (isLocked) {
      triggerToast('Cannot remove team: results have already been submitted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove team "${team.teamName}"?`)) return;

    try {
      const res = await apiFetch(`/api/teams/${team._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to delete team');
        return;
      }
      triggerToast(`Team "${team.teamName}" removed`);
      loadDashboardData();
    } catch {
      triggerToast('Network error while deleting team');
    }
  };

  // Handle Score Change for a team in the dedicated score page
  const handleScoreChange = (teamId, critKey, value, maxMarks) => {
    const num = value === '' ? '' : Math.max(0, Math.min(maxMarks, Number(value)));
    setTeamScoresState(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [critKey]: num,
      },
    }));
  };

  // Calculate live total score for a team
  const getTeamTotalLive = (teamId) => {
    const scores = teamScoresState[teamId] || {};
    return criteriaList.reduce((sum, crit) => sum + (Number(scores[crit.key]) || 0), 0);
  };

  // Save Score Draft for a single team
  const handleSaveTeamScoreDraft = async (team) => {
    if (isLocked) {
      triggerToast('Scores are locked: results already submitted or approved.');
      return;
    }

    setSavingTeamId(team._id);
    const scores = teamScoresState[team._id] || {};
    const remarks = teamRemarksState[team._id] || '';
    const judgeName = teamJudgesState[team._id] || '';

    try {
      const res = await apiFetch(`/api/teams/${team._id}/score`, {
        method: 'POST',
        body: JSON.stringify({ scores, remarks, judgeName }),
      });

      const data = await res.json();
      setSavingTeamId(null);

      if (!res.ok) {
        alert(data.error || 'Failed to save score draft');
        return;
      }

      triggerToast(`Score draft saved for "${team.teamName}" (${getTeamTotalLive(team._id)} pts)`);
      loadDashboardData();
    } catch {
      setSavingTeamId(null);
      alert('Failed to save score draft. Please check your connection.');
    }
  };

  // Validate Completeness before Submission
  const handleInitiateSubmit = () => {
    if (teams.length === 0) {
      triggerToast('No teams registered. Register teams first.');
      return;
    }

    const unscored = teams.filter(t => t.scoreStatus === 'Not Scored' || t.totalScore === undefined || t.totalScore === null);
    if (unscored.length > 0) {
      alert(`Cannot submit results yet!\n\nThe following ${unscored.length} team(s) do not have scores saved:\n${unscored.map(t => `• ${t.teamName}`).join('\n')}\n\nPlease enter and save scores for all teams before final submission.`);
      return;
    }

    setShowConfirmSubmit(true);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/submissions/submit', {
        method: 'POST',
        body: JSON.stringify({ eventName: assignedEvent }),
      });

      const data = await res.json();
      setSubmitting(false);
      setShowConfirmSubmit(false);

      if (!res.ok) {
        alert(data.error || 'Failed to submit final results');
        return;
      }

      triggerToast('Final results submitted successfully! Pending Super Admin approval.');
      loadDashboardData();

      // Automatically offer PDF download
      handleDownloadPDF();
    } catch {
      setSubmitting(false);
      alert('Network error while submitting final results');
    }
  };

  // Download PDF Report
  const handleDownloadPDF = () => {
    if (teams.length === 0) {
      triggerToast('No team data available for PDF report.');
      return;
    }

    generateCoordinatorReportPDF({
      eventName: assignedEvent,
      coordinatorName: currentUser?.name || 'Assigned Coordinator',
      submissionDate: submission?.submittedAt || new Date(),
      teams,
      scoringCriteria: criteriaList,
      status: submission?.status || 'Draft',
    });
    triggerToast('Downloading official PDF report...');
  };

  // Filtered teams
  const filteredTeams = teams.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.leaderName.toLowerCase().includes(q) ||
      t.leaderUsn.toLowerCase().includes(q) ||
      t.leaderCollege.toLowerCase().includes(q) ||
      (t.registrationNo && t.registrationNo.toLowerCase().includes(q))
    );
  });

  const scoredTeamsCount = teams.filter(t => t.scoreStatus !== 'Not Scored').length;
  const isAllScored = teams.length > 0 && scoredTeamsCount === teams.length;
  const progressPercent = teams.length > 0 ? Math.round((scoredTeamsCount / teams.length) * 100) : 0;

  return (
    <div className="coord-dashboard-root">

      {/* Atmospheric Background Aurora Glow Orbs */}
      <div style={{
        position: 'fixed',
        top: '-150px',
        left: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, rgba(0, 217, 255, 0.03) 50%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        top: '30%',
        right: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 12px 35px rgba(0, 230, 118, 0.35)',
          zIndex: 99999,
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <CheckCircle2 size={20} color="#fff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="coord-container">

        {/* ======================================================== */}
        {/* 1. TOP HERO BANNER (Cyber Glassmorphism) */}
        {/* ======================================================== */}
        <div className="coord-hero">
          {/* Subtle Corner Accent Glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle at top right, rgba(0, 217, 255, 0.15), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="coord-hero-header">
            <div className="coord-hero-left">
              {/* Event & Dept Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(0, 230, 118, 0.15)',
                  border: '1px solid rgba(0, 230, 118, 0.4)',
                  color: '#00E676',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase',
                }}>
                  <Flame size={14} color="#00E676" /> IGNITRON 2K26 EVENT PORTAL
                </span>

                <span style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '16px',
                }}>
                  {currentUser?.department || 'Department Coordinator'}
                </span>

                {eventData?.day && (
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#f59e0b',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <Calendar size={13} /> {eventData.day}
                  </span>
                )}
              </div>

              {/* Event Big Heading */}
              <h1 className="coord-hero-title">
                {assignedEvent || 'Event Coordinator Panel'}
              </h1>

              {/* Coordinator ID and Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={16} color="#00E676" />
                  Coordinator: <strong style={{ color: '#fff' }}>{currentUser?.name}</strong>
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#94a3b8' }}>
                  User ID: <code style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{currentUser?.username}</code>
                </span>
                {eventData?.venue && (
                  <>
                    <span style={{ color: '#475569' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                      <MapPin size={15} color="#f59e0b" /> {eventData.venue}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="coord-hero-actions">
              <button
                type="button"
                onClick={handleDownloadPDF}
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(14, 165, 233, 0.25))',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  color: '#38bdf8',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.15)',
                  transition: 'all 0.25s ease',
                }}
              >
                <Download size={17} /> Download Official PDF Report
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Submission Status Alert Ribbon */}
          {submission && (
            <div style={{
              marginTop: '24px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: submission.status === 'approved'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 78, 59, 0.25))'
                : submission.status === 'rejected'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(127, 29, 29, 0.25))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(30, 58, 138, 0.25))',
              border: `1px solid ${
                submission.status === 'approved' ? 'rgba(16, 185, 129, 0.5)' : submission.status === 'rejected' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {submission.status === 'approved' ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : submission.status === 'rejected' ? (
                  <XCircle size={24} color="#ef4444" />
                ) : (
                  <Clock size={24} color="#60a5fa" />
                )}
                <div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Status: <span style={{ textTransform: 'uppercase', color: submission.status === 'approved' ? '#34d399' : submission.status === 'rejected' ? '#f87171' : '#60a5fa' }}>{submission.status.replace('_', ' ')}</span>
                  </div>
                  {submission.approvedBy && (
                    <div style={{ color: '#86efac', fontSize: '0.85rem', marginTop: '3px' }}>
                      Approved by Super Admin ({submission.approvedBy}) · Live public scoreboard updated with college points!
                    </div>
                  )}
                  {submission.rejectionRemarks && (
                    <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '3px' }}>
                      <strong>Remarks:</strong> "{submission.rejectionRemarks}"
                    </div>
                  )}
                </div>
              </div>

              {submission.status === 'pending' && (
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Awaiting Super Admin Review · Scores Locked
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. STATS & KPI METRICS GRID */}
        {/* ======================================================== */}
        <div className="coord-stats-grid">
          {/* Card 1: Registered Teams */}
          <div className="coord-stat-card" style={{
            border: '1px solid rgba(56, 189, 248, 0.25)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Total Registered Teams</span>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Users size={20} color="#38bdf8" />
              </div>
            </div>
            <div className="coord-stat-num" style={{ color: '#f8fafc' }}>
              {teams.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '6px', fontWeight: 600 }}>
              Active student delegations
            </div>
          </div>

          {/* Card 2: Scoring Progress */}
          <div className="coord-stat-card" style={{
            border: `1px solid ${isAllScored ? 'rgba(0, 230, 118, 0.35)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Scoring Completion</span>
              <div style={{ background: isAllScored ? 'rgba(0, 230, 118, 0.15)' : 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Trophy size={20} color={isAllScored ? '#00E676' : '#f59e0b'} />
              </div>
            </div>
            <div className="coord-stat-num" style={{ color: isAllScored ? '#00E676' : '#f59e0b' }}>
              {scoredTeamsCount} <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/ {teams.length}</span>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: isAllScored ? 'linear-gradient(90deg, #10b981, #00E676)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: isAllScored ? '#00E676' : '#f59e0b', marginTop: '8px', fontWeight: 600 }}>
              {isAllScored ? '✓ 100% Evaluated — Ready to Submit' : `${teams.length - scoredTeamsCount} teams pending marks`}
            </div>
          </div>

          {/* Card 3: Event Format */}
          <div className="coord-stat-card" style={{
            border: '1px solid rgba(168, 85, 247, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Evaluation Scheme</span>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Layers size={20} color="#c084fc" />
              </div>
            </div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>
              {isHackathonEvent ? '2-Stage Hackathon' : 'Direct Score (100 pts)'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
              {isHackathonEvent ? 'Round 1 (50) + Round 2 (50)' : 'Single criteria — marks out of 100'}
            </div>
          </div>

          {/* Card 4: Scoreboard Link Status */}
          <div className="coord-stat-card" style={{
            border: '1px solid rgba(0, 230, 118, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Public Scoreboard Sync</span>
              <div style={{ background: 'rgba(0, 230, 118, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Activity size={20} color="#00E676" />
              </div>
            </div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {submission?.status === 'approved' ? 'Points Published' : 'Auto-Sync on Review'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#00E676', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E676', display: 'inline-block' }} />
              1st: 100pts · 2nd: 75pts · 3rd: 50pts
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. NAVIGATION TABS & ACTION BAR */}
        {/* ======================================================== */}
        <div className="coord-nav-bar">
          {/* Tab Buttons */}
          <div className="coord-nav-tabs">
            <button
              type="button"
              className="coord-nav-tab-btn"
              onClick={() => setActiveTab('teams')}
              style={{
                background: activeTab === 'teams' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35))' : 'transparent',
                border: activeTab === 'teams' ? '1px solid #f59e0b' : '1px solid transparent',
                color: activeTab === 'teams' ? '#f59e0b' : '#94a3b8',
                padding: '10px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'teams' ? '0 4px 15px rgba(245, 158, 11, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Users size={17} /> Registered Teams
              <span style={{
                background: activeTab === 'teams' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'teams' ? '#0f172a' : '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {teams.length}
              </span>
            </button>

            <button
              type="button"
              className="coord-nav-tab-btn"
              onClick={() => setActiveTab('scoring')}
              style={{
                background: activeTab === 'scoring' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.35))' : 'transparent',
                border: activeTab === 'scoring' ? '1px solid #38bdf8' : '1px solid transparent',
                color: activeTab === 'scoring' ? '#38bdf8' : '#94a3b8',
                padding: '10px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'scoring' ? '0 4px 15px rgba(56, 189, 248, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Trophy size={17} /> Score Evaluation
              <span style={{
                background: isAllScored ? 'rgba(0, 230, 118, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isAllScored ? '#00E676' : '#f59e0b',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                border: `1px solid ${isAllScored ? '#00E676' : '#f59e0b'}`,
              }}>
                {scoredTeamsCount}/{teams.length}
              </span>
            </button>

            <button
              type="button"
              className="coord-nav-tab-btn"
              onClick={() => setActiveTab('history')}
              style={{
                background: activeTab === 'history' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: activeTab === 'history' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                color: activeTab === 'history' ? '#fff' : '#94a3b8',
                padding: '10px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Clock size={17} /> Activity History
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="coord-nav-actions">
            {!isLocked && (
              <button
                type="button"
                onClick={handleOpenAddTeam}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                }}
              >
                <Plus size={16} /> Register New Team
              </button>
            )}

            {!isLocked && (
              <button
                type="button"
                onClick={handleInitiateSubmit}
                style={{
                  background: isAllScored
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(51, 65, 85, 0.6)',
                  color: isAllScored ? '#fff' : '#94a3b8',
                  border: isAllScored ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isAllScored ? 'pointer' : 'not-allowed',
                  boxShadow: isAllScored ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                <Send size={16} /> Submit Final Results
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REGISTERED TEAMS (Modern Interactive Cards) */}
        {/* ======================================================== */}
        {activeTab === 'teams' && (
          <div>
            {/* Search Bar & Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '10px 18px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              }}>
                <Search size={18} color="#38bdf8" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  placeholder="Search teams by name, leader, USN, college..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.92rem',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Displaying <strong style={{ color: '#00E676' }}>{filteredTeams.length}</strong> of <strong style={{ color: '#fff' }}>{teams.length}</strong> delegations
              </div>
            </div>

            {/* Team Cards Grid */}
            {loadError ? (
              <CyberErrorState message={loadError} onRetry={loadDashboardData} />
            ) : loading ? (
              <SkeletonCards count={6} />
            ) : filteredTeams.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(8, 17, 36, 0.6))',
                borderRadius: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
              }}>
                <Users size={52} color="#475569" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ color: '#cbd5e1', fontSize: '1.25rem', marginBottom: '8px', fontFamily: "'Oxanium', sans-serif" }}>
                  {searchQuery ? 'No Teams Matching Query' : 'No Teams Registered Yet'}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 24px auto' }}>
                  {searchQuery
                    ? 'Try searching with different terms such as USN, student name, or college name.'
                    : 'Click "Register New Team" to add the participating delegations for this event.'}
                </p>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={handleOpenAddTeam}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '12px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 18px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    + Register First Team
                  </button>
                )}
              </div>
            ) : (
              <div className="coord-teams-grid">
                {filteredTeams.map((team, idx) => (
                  <div
                    key={team._id}
                    className="coord-team-card"
                    style={{
                      border: team.scoreStatus === 'Approved'
                        ? '1px solid rgba(0, 230, 118, 0.45)'
                        : team.scoreStatus === 'Draft' || team.scoreStatus === 'Submitted'
                        ? '1px solid rgba(56, 189, 248, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Card Header: RegNo Badge & Status Pill */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#38bdf8',
                            fontFamily: "'Oxanium', monospace",
                            letterSpacing: '1px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}>
                            {team.registrationNo || `IGN-T${idx + 1}`}
                          </span>
                          <h3 style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            color: '#fff',
                            margin: '8px 0 0 0',
                          }}>
                            {team.teamName}
                          </h3>
                        </div>

                        {/* Status Pill */}
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: team.scoreStatus === 'Approved'
                            ? 'rgba(0, 230, 118, 0.18)'
                            : team.scoreStatus === 'Draft'
                            ? 'rgba(245, 158, 11, 0.18)'
                            : 'rgba(148, 163, 184, 0.12)',
                          color: team.scoreStatus === 'Approved'
                            ? '#00E676'
                            : team.scoreStatus === 'Draft'
                            ? '#f59e0b'
                            : '#94a3b8',
                          border: `1px solid ${
                            team.scoreStatus === 'Approved' ? 'rgba(0, 230, 118, 0.45)' : team.scoreStatus === 'Draft' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(148, 163, 184, 0.25)'
                          }`,
                        }}>
                          {team.scoreStatus}
                        </span>
                      </div>

                      {/* Leader & College Box */}
                      <div style={{
                        background: 'rgba(3, 7, 18, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '14px',
                        borderRadius: '12px',
                        marginBottom: '14px',
                        fontSize: '0.88rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserIcon size={14} color="#38bdf8" /> Leader: <strong style={{ color: '#f8fafc' }}>{team.leaderName}</strong>
                          </span>
                          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                            {team.leaderUsn}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem' }}>
                          <Building size={14} color="#00E676" />
                          <span>College: <strong style={{ color: '#cbd5e1' }}>{team.leaderCollege}</strong></span>
                        </div>
                        {team.leaderMobile && (
                          <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                            Tel: {team.leaderMobile}
                          </div>
                        )}
                      </div>

                      {/* Participants Badges */}
                      {team.participants && team.participants.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                            Members ({team.participants.length}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {team.participants.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                style={{
                                  fontSize: '0.75rem',
                                  background: 'rgba(30, 41, 59, 0.6)',
                                  color: '#e2e8f0',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                }}
                              >
                                {p.name} <span style={{ color: '#94a3b8' }}>({p.usn})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Score Status Badge */}
                      {team.scoreStatus !== 'Not Scored' ? (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.18))',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Trophy size={16} /> Total Score:
                          </span>
                          <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '1.4rem', color: '#f59e0b', fontWeight: 800 }}>
                            {team.totalScore} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>pts</span>
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          background: 'rgba(148, 163, 184, 0.04)',
                          border: '1px dashed rgba(148, 163, 184, 0.2)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          marginBottom: '16px',
                          fontSize: '0.82rem',
                          color: '#94a3b8',
                          textAlign: 'center',
                        }}>
                          Pending score evaluation on event day
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '16px',
                      marginTop: '8px',
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditTeam(team)}
                            title="Edit Team Registration"
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              padding: '7px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <Edit size={13} /> Edit
                          </button>
                        )}

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(team)}
                            title="Delete Team Registration"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              padding: '7px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Go to Score Management Page */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('scoring')}
                        style={{
                          background: team.scoreStatus === 'Not Scored'
                            ? 'linear-gradient(135deg, #00E676, #00b359)'
                            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.3))',
                          border: team.scoreStatus === 'Not Scored'
                            ? 'none'
                            : '1px solid rgba(56, 189, 248, 0.4)',
                          color: team.scoreStatus === 'Not Scored' ? '#030712' : '#38bdf8',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: team.scoreStatus === 'Not Scored' ? '0 4px 15px rgba(0, 230, 118, 0.3)' : 'none',
                        }}
                      >
                        <Trophy size={14} />
                        {team.scoreStatus === 'Not Scored' ? 'Add Marks' : 'Edit Marks'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SCORE MANAGEMENT & EVALUATION */}
        {/* ======================================================== */}
        {activeTab === 'scoring' && (
          <div>
            {/* Top Score Control Bar */}
            <div className="coord-scoring-header">
              <div>
                <h2 style={{
                  fontFamily: "'Oxanium', sans-serif",
                  color: '#f8fafc',
                  fontSize: '1.45rem',
                  margin: '0 0 6px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Trophy size={22} color="#f59e0b" /> Score Management & Evaluation
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  Enter marks for each team. Click <strong>"Save Draft"</strong> on each card. Once all teams are evaluated, click <strong>"Submit Final Results"</strong> to forward to Super Admin.
                </p>
              </div>

              {/* Action buttons */}
              <div className="coord-scoring-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: isAllScored ? 'rgba(0, 230, 118, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isAllScored ? '#00E676' : '#f59e0b',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: `1px solid ${isAllScored ? 'rgba(0, 230, 118, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Check size={16} /> {scoredTeamsCount} of {teams.length} Evaluated
                </span>

                {!isLocked && (
                  <button
                    type="button"
                    onClick={handleInitiateSubmit}
                    disabled={!isAllScored}
                    style={{
                      background: isAllScored
                        ? 'linear-gradient(135deg, #10b981, #00E676)'
                        : 'rgba(51, 65, 85, 0.5)',
                      color: isAllScored ? '#030712' : '#64748b',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: isAllScored ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isAllScored ? '0 4px 20px rgba(0, 230, 118, 0.4)' : 'none',
                    }}
                  >
                    <Send size={16} /> Submit Final Results
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    padding: '11px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={16} /> PDF Report
                </button>
              </div>
            </div>

            {/* Hackathon Separate Round Selector (Round 1 vs Round 2) */}
            {isHackathonEvent && (
              <div style={{
                display: 'flex',
                gap: '14px',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(8, 17, 36, 0.85), rgba(4, 10, 24, 0.95))',
                backdropFilter: 'blur(16px)',
                padding: '16px 22px',
                borderRadius: '16px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', width: '100%' }}>
                  <span style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#38bdf8" /> Hackathon Evaluation Stage:
                  </span>
                  <div className="coord-stage-buttons" style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setHackathonRound('round1')}
                      style={{
                        background: hackathonRound === 'round1' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.35))' : 'rgba(30, 41, 59, 0.6)',
                        border: hackathonRound === 'round1' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: hackathonRound === 'round1' ? '#38bdf8' : '#94a3b8',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: hackathonRound === 'round1' ? '0 4px 15px rgba(56, 189, 248, 0.25)' : 'none',
                      }}
                    >
                      <Layers size={16} /> Round 1: Pitch & Prototype (Max 50)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHackathonRound('round2')}
                      style={{
                        background: hackathonRound === 'round2' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35))' : 'rgba(30, 41, 59, 0.6)',
                        border: hackathonRound === 'round2' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: hackathonRound === 'round2' ? '#f59e0b' : '#94a3b8',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: hackathonRound === 'round2' ? '0 4px 15px rgba(245, 158, 11, 0.25)' : 'none',
                      }}
                    >
                      <Trophy size={16} /> Round 2: Final Defense & Code (Max 50)
                    </button>
                  </div>
                </div>

                <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '6px' }}>
                  {hackathonRound === 'round1'
                    ? 'Currently evaluating Round 1 — scores saved into Round 1 marks.'
                    : 'Currently evaluating Round 2 — final cumulative score combines R1 + R2.'}
                </div>
              </div>
            )}

            {/* Score Cards for all teams */}
            {loadError ? (
              <CyberErrorState message={loadError} onRetry={loadDashboardData} />
            ) : loading ? (
              <SkeletonTable
                rows={6}
                cols={6}
                headers={['Rank & Delegation', 'College', 'Stage Criteria', 'Judges', 'Total Score', 'Save Action']}
              />
            ) : teams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px' }}>
                <Users size={44} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ color: '#cbd5e1' }}>No Teams Registered</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Register teams in the "Registered Teams" tab first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {teams.map((team, idx) => {
                  const currentTotal = getTeamTotalLive(team._id);
                  const isScored = team.scoreStatus !== 'Not Scored';

                  return (
                    <div
                      key={team._id}
                      className="coord-scoring-card"
                      style={{
                        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 17, 36, 0.95) 100%)',
                        backdropFilter: 'blur(16px)',
                        border: isScored ? '1px solid rgba(0, 230, 118, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '18px',
                        padding: '26px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {/* Team Row Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontFamily: "'Oxanium', monospace",
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                            }}>
                              #{idx + 1} · {team.registrationNo}
                            </span>
                            <h3 style={{
                              fontFamily: "'Oxanium', sans-serif",
                              color: '#fff',
                              fontSize: '1.35rem',
                              fontWeight: 700,
                              margin: 0,
                            }}>
                              {team.teamName}
                            </h3>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
                            Leader: <strong style={{ color: '#f8fafc' }}>{team.leaderName}</strong> ({team.leaderUsn}) · College: <strong style={{ color: '#38bdf8' }}>{team.leaderCollege}</strong>
                          </div>
                        </div>

                        {/* Status & Live Total */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            padding: '5px 12px',
                            borderRadius: '12px',
                            background: team.scoreStatus === 'Approved'
                              ? 'rgba(0, 230, 118, 0.18)'
                              : isScored
                              ? 'rgba(245, 158, 11, 0.18)'
                              : 'rgba(148, 163, 184, 0.12)',
                            color: team.scoreStatus === 'Approved'
                              ? '#00E676'
                              : isScored
                              ? '#f59e0b'
                              : '#94a3b8',
                            border: `1px solid ${isScored ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                          }}>
                            {isScored ? `Draft: ${team.totalScore} pts` : 'Not Scored'}
                          </span>

                          <div style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))',
                            border: '1px solid #f59e0b',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            textAlign: 'right',
                          }}>
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'block', fontWeight: 600 }}>Total Calculated</span>
                            <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '1.45rem', color: '#f59e0b', fontWeight: 800 }}>{currentTotal} pts</span>
                          </div>
                        </div>
                      </div>

                      {/* Criteria Inputs Grid */}
                      <div
                        className="coord-criteria-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isHackathonEvent && hackathonRound === 'round2' ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '14px',
                          marginBottom: '20px',
                          background: 'rgba(3, 7, 18, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '18px',
                          borderRadius: '12px',
                        }}
                      >
                        {isHackathonEvent ? (
                          hackathonRound === 'round1' ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>
                                  Round 1: Pitch & Prototype
                                </label>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Max 50 pts</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  disabled={isLocked}
                                  placeholder="0"
                                  value={teamScoresState[team._id]?.round1 !== undefined ? teamScoresState[team._id]?.round1 : ''}
                                  onChange={e => handleScoreChange(team._id, 'round1', e.target.value, 50)}
                                  style={{
                                    width: '100%',
                                    background: '#0a1122',
                                    border: '1px solid rgba(56, 189, 248, 0.4)',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    color: '#38bdf8',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    fontFamily: "'Oxanium', monospace",
                                  }}
                                />
                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>/ 50</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{
                                background: 'rgba(56, 189, 248, 0.08)',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Round 1 Score (Pitch & Prototype)</span>
                                <span style={{ fontFamily: "'Oxanium', monospace", fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                                  {teamScoresState[team._id]?.round1 !== undefined ? teamScoresState[team._id]?.round1 : 0} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 50 pts</span>
                                </span>
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <label style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 700 }}>
                                    Round 2: Final Defense & Code
                                  </label>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Max 50 pts</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    disabled={isLocked}
                                    placeholder="0"
                                    value={teamScoresState[team._id]?.round2 !== undefined ? teamScoresState[team._id]?.round2 : ''}
                                    onChange={e => handleScoreChange(team._id, 'round2', e.target.value, 50)}
                                    style={{
                                      width: '100%',
                                      background: '#0a1122',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      color: '#f59e0b',
                                      fontWeight: 800,
                                      fontSize: '1.1rem',
                                      textAlign: 'center',
                                      fontFamily: "'Oxanium', monospace",
                                    }}
                                  />
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>/ 50</span>
                                </div>
                              </div>
                            </>
                          )
                        ) : (
                          criteriaList.map((crit) => {
                            const val = teamScoresState[team._id]?.[crit.key];
                            return (
                              <div key={crit.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <label style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}>
                                    {crit.name}
                                  </label>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Max {crit.maxMarks}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={crit.maxMarks}
                                    disabled={isLocked}
                                    placeholder="0"
                                    value={val !== undefined ? val : ''}
                                    onChange={e => handleScoreChange(team._id, crit.key, e.target.value, crit.maxMarks)}
                                    style={{
                                      width: '100%',
                                      background: '#0a1122',
                                      border: '1px solid rgba(0, 230, 118, 0.35)',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      color: '#00E676',
                                      fontWeight: 800,
                                      fontSize: '1.1rem',
                                      textAlign: 'center',
                                      fontFamily: "'Oxanium', monospace",
                                    }}
                                  />
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>/{crit.maxMarks}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Remarks & Save Row */}
                      <div className="coord-remarks-row" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="Judge Name (Optional)"
                            value={teamJudgesState[team._id] || ''}
                            onChange={e => setTeamJudgesState({ ...teamJudgesState, [team._id]: e.target.value })}
                            style={{
                              width: '100%',
                              background: '#0a1122',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              color: '#f8fafc',
                              fontSize: '0.88rem',
                            }}
                          />
                        </div>

                        <div style={{ flex: 2, minWidth: '280px' }}>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="Evaluation feedback / judge remarks..."
                            value={teamRemarksState[team._id] || ''}
                            onChange={e => setTeamRemarksState({ ...teamRemarksState, [team._id]: e.target.value })}
                            style={{
                              width: '100%',
                              background: '#0a1122',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              color: '#f8fafc',
                              fontSize: '0.88rem',
                            }}
                          />
                        </div>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleSaveTeamScoreDraft(team)}
                            disabled={savingTeamId === team._id}
                            style={{
                              background: 'linear-gradient(135deg, #00E676, #00b359)',
                              border: 'none',
                              color: '#030712',
                              padding: '11px 22px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 4px 15px rgba(0, 230, 118, 0.3)',
                            }}
                          >
                            <Save size={15} />
                            {savingTeamId === team._id
                              ? 'Saving...'
                              : isHackathonEvent
                              ? (hackathonRound === 'round1' ? 'Save Round 1 Draft' : 'Save Round 2 Draft')
                              : 'Save Score Draft'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ACTIVITY HISTORY (Timeline View) */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(8, 17, 36, 0.95))',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '28px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
          }}>
            <h3 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '1.3rem', color: '#f8fafc', marginBottom: '20px' }}>
              Your Activity History & Action Log
            </h3>
            {loadError ? (
              <CyberErrorState message={loadError} onRetry={loadDashboardData} />
            ) : loading ? (
              <SkeletonTable
                rows={5}
                cols={3}
                headers={['Action', 'Telemetry Description', 'Recorded Timestamp']}
              />
            ) : activityLogs.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No recorded activities yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activityLogs.map((log) => (
                  <div
                    key={log._id || log.logId}
                    style={{
                      background: 'rgba(3, 7, 18, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        marginRight: '12px',
                        fontSize: '0.78rem',
                      }}>
                        {log.action}
                      </span>
                      <span style={{ color: '#e2e8f0' }}>{log.description}</span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT REGISTERED TEAM */}
      {/* ======================================================== */}
      {showTeamModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0b1329 0%, #060c1d 100%)',
            border: '1px solid rgba(0, 230, 118, 0.35)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 230, 118, 0.15)',
          }}>
            <h2 style={{ fontFamily: "'Oxanium', sans-serif", color: '#f8fafc', fontSize: '1.6rem', margin: '0 0 6px 0' }}>
              {editingTeam ? 'Edit Registered Team' : 'Register New Team'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
              Event: <strong style={{ color: '#00E676' }}>{assignedEvent}</strong>
            </p>

            {teamFormError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '18px',
              }}>
                {teamFormError}
              </div>
            )}

            <form onSubmit={handleSaveTeam}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CyberKnights"
                  value={teamForm.teamName}
                  onChange={e => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#040918',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Team Leader Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Leader full name"
                    value={teamForm.leaderName}
                    onChange={e => setTeamForm({ ...teamForm, leaderName: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#040918',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Leader USN / Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4GM24CS001"
                    value={teamForm.leaderUsn}
                    onChange={e => setTeamForm({ ...teamForm, leaderUsn: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#040918',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    College / Institute *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GM University"
                    value={teamForm.leaderCollege}
                    onChange={e => setTeamForm({ ...teamForm, leaderCollege: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#040918',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Leader Mobile (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={teamForm.leaderMobile}
                    onChange={e => setTeamForm({ ...teamForm, leaderMobile: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#040918',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Participants Section with (+) Button */}
              <div style={{
                background: 'rgba(3, 7, 18, 0.75)',
                padding: '18px',
                borderRadius: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                    Team Participants
                  </span>
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    style={{
                      background: 'rgba(0, 230, 118, 0.15)',
                      border: '1px solid #00E676',
                      color: '#00E676',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Plus size={14} /> Add Participant (+)
                  </button>
                </div>

                {teamForm.participants.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', width: '28px', fontWeight: 700 }}>
                      P{idx + 2}:
                    </span>
                    <input
                      type="text"
                      placeholder={`Participant ${idx + 2} Name`}
                      value={p.name}
                      onChange={e => handleParticipantChange(idx, 'name', e.target.value)}
                      style={{
                        flex: 1,
                        background: '#0a1122',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`Participant ${idx + 2} USN`}
                      value={p.usn}
                      onChange={e => handleParticipantChange(idx, 'usn', e.target.value)}
                      style={{
                        flex: 1,
                        background: '#0a1122',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                      }}
                    />
                    {teamForm.participants.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          color: '#ef4444',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94a3b8',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #00E676, #00b359)',
                    border: 'none',
                    color: '#030712',
                    padding: '12px 26px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(0, 230, 118, 0.35)',
                  }}
                >
                  {editingTeam ? 'Save Changes' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FINAL SUBMISSION CONFIRMATION */}
      {/* ======================================================== */}
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0b1329 0%, #060c1d 100%)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 230, 118, 0.2)',
          }}>
            <ShieldAlert size={52} color="#00E676" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontFamily: "'Oxanium', sans-serif", color: '#f8fafc', fontSize: '1.5rem', margin: '0 0 10px 0' }}>
              Confirm Final Result Submission
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
              You are about to submit the final scores for <strong style={{ color: '#00E676' }}>{assignedEvent}</strong> ({teams.length} teams evaluated).
              <br /><br />
              Once submitted, all team scores will be <strong style={{ color: '#f87171' }}>locked</strong> and forwarded to the Super Admin for official approval. Upon approval, points will automatically update the public scoreboard for each respective college.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#94a3b8',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                style={{
                  background: 'linear-gradient(135deg, #00E676, #00b359)',
                  border: 'none',
                  color: '#030712',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 230, 118, 0.4)',
                }}
              >
                {submitting ? 'Submitting...' : 'Yes, Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
