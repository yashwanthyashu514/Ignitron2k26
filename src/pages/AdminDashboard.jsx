import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LogOut, Plus, Trash2, Edit3, Save, X, Upload,
  Calendar, Users, Trophy, Clock, Link, FileText,
  Settings, ChevronDown, ChevronUp, CheckCircle, Menu, ChevronRight, Globe, Folder
} from 'lucide-react';

// ========================
// REUSABLE TOAST
// ========================
function Toast({ msg, onClose }) {
  return (
    <div className="toast-msg">
      <CheckCircle size={16} />
      {msg}
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

// ========================
// EVENTS MANAGER
// ========================
function EventsManager({ toast }) {
  const { events, setEvents } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', time: '', day: 'Day 1', rulebookLink: '', registrationLink: '',
    description: '', category: 'Technical', maxTeamSize: '',
  });

  const resetForm = () => {
    setForm({ name: '', time: '', day: 'Day 1', rulebookLink: '', registrationLink: '', description: '', category: 'Technical', maxTeamSize: '' });
    setEditing(null);
  };

  const startEdit = (ev) => {
    setEditing(ev.id);
    setForm({ ...ev });
    document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setEvents(prev => prev.map(e => e.id === editing ? { ...form, id: editing } : e));
      toast('Event updated successfully!');
    } else {
      setEvents(prev => [...prev, { ...form, id: Date.now().toString() }]);
      toast('Event added successfully!');
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this event?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
      toast('Event deleted.');
    }
  };

  return (
    <div>
      {/* Event Form */}
      <div id="event-form" className="admin-form-card">
        <h4 className="admin-form-title">{editing ? 'Edit Event' : 'Add Event'}</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hackathon" />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 09:00 AM" />
          </div>
          <div className="form-group">
            <label className="form-label">Day</label>
            <select className="form-input" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
              <option>Day 1</option>
              <option>Day 2</option>
              <option>Day 3</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Technical</option>
              <option>Robotics</option>
              <option>AI/ML</option>
              <option>Design</option>
              <option>Management</option>
              <option>Cultural</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rulebook (Drive Link)</label>
            <input className="form-input" value={form.rulebookLink} onChange={e => setForm({ ...form, rulebookLink: e.target.value })} placeholder="https://drive.google.com/..." />
          </div>
          <div className="form-group">
            <label className="form-label">Registration (Unstop Link)</label>
            <input className="form-input" value={form.registrationLink} onChange={e => setForm({ ...form, registrationLink: e.target.value })} placeholder="https://unstop.com/..." />
          </div>
          <div className="form-group">
            <label className="form-label">Max Team Size</label>
            <input className="form-input" type="number" value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: e.target.value })} placeholder="e.g. 4" />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description..." rows={3} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-admin-save" onClick={handleSave}>
            <Save size={15} /> {editing ? 'Update Event' : 'Add Event'}
          </button>
          {editing && (
            <button className="btn-admin-cancel" onClick={resetForm}>
              <X size={15} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="admin-list">
        {events.map(ev => (
          <div className="admin-list-item" key={ev.id}>
            <div className="admin-list-info">
              <div className="admin-list-name">{ev.name}</div>
              <div className="admin-list-meta">
                <span><Clock size={12} /> {ev.time}</span>
                <span><Calendar size={12} /> {ev.day}</span>
                <span><Folder size={12} /> {ev.category}</span>
              </div>
            </div>
            <div className="admin-list-actions">
              <button className="btn-edit" onClick={() => startEdit(ev)}><Edit3 size={15} /></button>
              <button className="btn-delete" onClick={() => handleDelete(ev.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="admin-empty">No events yet. Add one above.</p>}
      </div>
    </div>
  );
}

// ========================
// CREW TEAM MANAGER
// ========================
function TeamManager({ toast }) {
  const { teamMembers, setTeamMembers } = useApp();
  const [form, setForm] = useState({ name: '', role: '', photo: '' });
  const fileRef = useRef();

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.name) return;
    setTeamMembers(prev => [...prev, { ...form, id: Date.now().toString() }]);
    setForm({ name: '', role: '', photo: '' });
    toast('Team member added!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this team member?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      toast('Team member removed.');
    }
  };

  return (
    <div>
      <div className="admin-form-card">
        <h4 className="admin-form-title">Add Team Member</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Position</label>
            <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Event Coordinator" />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Photo</label>
            <div className="photo-upload-area" onClick={() => fileRef.current.click()}>
              {form.photo ? (
                <img src={form.photo} alt="Preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <Upload size={24} />
                  <span>Click to upload photo</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>
        </div>
        <button className="btn-admin-save" onClick={handleAdd}>
          <Plus size={15} /> Add Member
        </button>
      </div>

      <div className="team-admin-grid">
        {teamMembers.map(m => (
          <div className="team-admin-card" key={m.id}>
            <div className="team-admin-avatar">
              {m.photo ? <img src={m.photo} alt={m.name} /> : <div className="team-avatar-placeholder">{m.name.charAt(0)}</div>}
            </div>
            <div className="team-admin-info">
              <div className="admin-list-name">{m.name}</div>
              <div className="admin-list-meta">{m.role}</div>
            </div>
            <button className="btn-delete" onClick={() => handleDelete(m.id)}><Trash2 size={15} /></button>
          </div>
        ))}
        {teamMembers.length === 0 && <p className="admin-empty">No team members yet.</p>}
      </div>
    </div>
  );
}

// ========================
// COUNTDOWN MANAGER
// ========================
function CountdownManager({ toast }) {
  const { countdown, setCountdown } = useApp();
  const [val, setVal] = useState(countdown);

  const handleSave = () => {
    setCountdown(val);
    toast('Countdown updated!');
  };

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Countdown Target</h4>
      <div className="form-group">
        <label className="form-label">Event Date & Time</label>
        <input
          type="datetime-local"
          className="form-input"
          value={val}
          onChange={e => setVal(e.target.value)}
        />
        <p className="form-hint">Current: {new Date(countdown).toLocaleString('en-IN')}</p>
      </div>
      <button className="btn-admin-save" onClick={handleSave}>
        <Save size={15} /> Update Countdown
      </button>
    </div>
  );
}

// ========================
// TIMELINE MANAGER
// ========================
function TimelineManager({ toast }) {
  const { timeline, setTimeline } = useApp();
  const [activeDay, setActiveDay] = useState('day1');
  const [items, setItems] = useState(timeline[activeDay] || []);

  const switchDay = (day) => {
    setActiveDay(day);
    setItems(timeline[day] || []);
  };

  const handleChange = (i, field, value) => {
    const updated = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    setItems(updated);
  };

  const handleAdd = () => setItems(prev => [...prev, { time: '', event: '' }]);

  const handleRemove = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    setTimeline(prev => ({ ...prev, [activeDay]: items }));
    toast(`Timeline for ${activeDay.replace('day', 'Day ')} updated!`);
  };

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Timeline</h4>
      <div className="day-tab-group">
        {['day1', 'day2', 'day3'].map(d => (
          <button key={d} className={`day-tab-btn ${activeDay === d ? 'active' : ''}`} onClick={() => switchDay(d)}>
            {d.replace('day', 'Day ')}
          </button>
        ))}
      </div>

      <div className="timeline-edit-list">
        {items.map((item, i) => (
          <div className="timeline-edit-row" key={i}>
            <input
              className="form-input timeline-time-input"
              value={item.time}
              onChange={e => handleChange(i, 'time', e.target.value)}
              placeholder="09:00 AM"
            />
            <input
              className="form-input timeline-event-input"
              value={item.event}
              onChange={e => handleChange(i, 'event', e.target.value)}
              placeholder="Event name"
            />
            <button className="btn-delete" onClick={() => handleRemove(i)}><X size={14} /></button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn-admin-outline" onClick={handleAdd}>
          <Plus size={15} /> Add Row
        </button>
        <button className="btn-admin-save" onClick={handleSave}>
          <Save size={15} /> Save Timeline
        </button>
      </div>
    </div>
  );
}

// ========================
// BROCHURE MANAGER
// ========================
function BrochureManager({ toast }) {
  const { brochureLink, setBrochureLink } = useApp();
  const [val, setVal] = useState(brochureLink);

  return (
    <div className="admin-form-card">
      <h4 className="admin-form-title">Update Brochure Link</h4>
      <div className="form-group">
        <label className="form-label">Google Drive Link</label>
        <input className="form-input" value={val} onChange={e => setVal(e.target.value)} placeholder="https://drive.google.com/file/..." />
      </div>
      <button className="btn-admin-save" onClick={() => { setBrochureLink(val); toast('Brochure link updated!'); }}>
        <Save size={15} /> Update Brochure
      </button>
    </div>
  );
}

// ========================
// SCOREBOARD MANAGER
// ========================
function ScoreboardManager({ toast }) {
  const { scoreboard, setScoreboard } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ collegeName: '', score: '' });
  const [newForm, setNewForm] = useState({ collegeName: '', score: '' });

  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);

  const handleAdd = () => {
    if (!newForm.collegeName) return;
    setScoreboard(prev => [...prev, { ...newForm, score: Number(newForm.score) || 0, id: Date.now().toString() }]);
    setNewForm({ collegeName: '', score: '' });
    toast('College added to scoreboard!');
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({ collegeName: entry.collegeName, score: String(entry.score) });
  };

  const saveEdit = () => {
    setScoreboard(prev => prev.map(e => e.id === editingId ? { ...e, ...editForm, score: Number(editForm.score) || 0 } : e));
    setEditingId(null);
    toast('Score updated!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove from scoreboard?')) {
      setScoreboard(prev => prev.filter(e => e.id !== id));
      toast('Removed from scoreboard.');
    }
  };

  return (
    <div>
      {/* Add New */}
      <div className="admin-form-card">
        <h4 className="admin-form-title">Add College / Team</h4>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">College / Team Name *</label>
            <input className="form-input" value={newForm.collegeName} onChange={e => setNewForm({ ...newForm, collegeName: e.target.value })} placeholder="College Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Score</label>
            <input className="form-input" type="number" value={newForm.score} onChange={e => setNewForm({ ...newForm, score: e.target.value })} placeholder="0" />
          </div>
        </div>
        <button className="btn-admin-save" onClick={handleAdd}>
          <Plus size={15} /> Add to Scoreboard
        </button>
      </div>

      {/* Scoreboard Table */}
      <div className="admin-scoreboard-table">
        <div className="admin-score-header">
          <span>Rank</span>
          <span>College / Team</span>
          <span>Score</span>
          <span>Actions</span>
        </div>
        {sorted.map((entry, i) => (
          <div className="admin-score-row" key={entry.id}>
            <div className="admin-rank">
              #{String(i + 1).padStart(2, '0')}
            </div>
            {editingId === entry.id ? (
              <>
                <input className="form-input score-edit-input" value={editForm.collegeName} onChange={e => setEditForm({ ...editForm, collegeName: e.target.value })} />
                <input className="form-input score-edit-input" type="number" value={editForm.score} onChange={e => setEditForm({ ...editForm, score: e.target.value })} />
                <div className="admin-list-actions">
                  <button className="btn-save-small" onClick={saveEdit}><Save size={14} /></button>
                  <button className="btn-cancel-small" onClick={() => setEditingId(null)}><X size={14} /></button>
                </div>
              </>
            ) : (
              <>
                <div className="admin-college-name">{entry.collegeName}</div>
                <div className="admin-score-val">{entry.score} pts</div>
                <div className="admin-list-actions">
                  <button className="btn-edit" onClick={() => startEdit(entry)}><Edit3 size={15} /></button>
                  <button className="btn-delete" onClick={() => handleDelete(entry.id)}><Trash2 size={15} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {sorted.length === 0 && <p className="admin-empty">No scores yet.</p>}
      </div>
    </div>
  );
}

// ========================
// MAIN DASHBOARD
// ========================
export default function AdminDashboard() {
  const { adminLogout, isAdminLoggedIn } = useApp();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdminLoggedIn) {
    navigate('/admin');
    return null;
  }

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const sidebarItems = [
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'team', label: 'Crew Team', icon: <Users size={18} /> },
    { id: 'countdown', label: 'Countdown', icon: <Clock size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <FileText size={18} /> },
    { id: 'brochure', label: 'Brochure', icon: <Link size={18} /> },
    { id: 'scoreboard', label: 'Scoreboard', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="admin-dashboard">
      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg('')} />}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left-Side Sidebar Menu */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/gmu_logo.png" alt="GMU" className="sidebar-gmu-logo" />
          <div className="sidebar-brand-text">
            <div className="sidebar-title">IGNITRON</div>
            <div className="sidebar-sub">2K26 CONTROL CENTER</div>
          </div>
        </div>

        <div className="sidebar-status-pill">
          <span className="status-dot-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        <div className="sidebar-section-label">MAIN NAVIGATION</div>

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
              <ChevronRight size={14} className="sidebar-link-arrow" />
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

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="admin-topbar-title">Admin Dashboard</h1>
              <p className="admin-topbar-sub">Ignitron 2K26 · GMU Management Panel</p>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-badge-live">Live</span>
            <button className="btn-logout-top" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="admin-sections">
          {activeTab === 'events' && (
            <div id="events" className="admin-tab-pane">
              <Section title="Event Management" icon={<Calendar size={18} />} defaultOpen>
                <EventsManager toast={showToast} />
              </Section>
            </div>
          )}

          {activeTab === 'team' && (
            <div id="team" className="admin-tab-pane">
              <Section title="Crew Team" icon={<Users size={18} />} defaultOpen>
                <TeamManager toast={showToast} />
              </Section>
            </div>
          )}

          {activeTab === 'countdown' && (
            <div id="countdown" className="admin-tab-pane">
              <Section title="Countdown" icon={<Clock size={18} />} defaultOpen>
                <CountdownManager toast={showToast} />
              </Section>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div id="timeline" className="admin-tab-pane">
              <Section title="Timeline" icon={<Calendar size={18} />} defaultOpen>
                <TimelineManager toast={showToast} />
              </Section>
            </div>
          )}

          {activeTab === 'brochure' && (
            <div id="brochure" className="admin-tab-pane">
              <Section title="Brochure" icon={<FileText size={18} />} defaultOpen>
                <BrochureManager toast={showToast} />
              </Section>
            </div>
          )}

          {activeTab === 'scoreboard' && (
            <div id="scoreboard" className="admin-tab-pane">
              <Section title="Scoreboard" icon={<Trophy size={18} />} defaultOpen>
                <ScoreboardManager toast={showToast} />
              </Section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
