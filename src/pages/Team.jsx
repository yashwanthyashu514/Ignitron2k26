import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Star, Camera } from 'lucide-react';

const CATEGORIES = [
  { key: 'student_affairs', label: 'Student Affairs', emoji: '🎓', color: '#00E676' },
  { key: 'core', label: 'Core', emoji: '⚡', color: '#00D9FF' },
  { key: 'media', label: 'Media', emoji: '📸', color: '#F59E0B' },
];

const DEFAULT_MEMBERS = {
  student_affairs: [
    { id: 'sa1', name: 'Arjun Sharma', role: 'Head – Student Affairs', photo: '' },
    { id: 'sa2', name: 'Priya Mehta', role: 'Co-ordinator', photo: '' },
    { id: 'sa3', name: 'Rahul Verma', role: 'Co-ordinator', photo: '' },
    { id: 'sa4', name: 'Sneha Patel', role: 'Co-ordinator', photo: '' },
  ],
  core: [
    { id: 'c1', name: 'Vikram Singh', role: 'Core Lead', photo: '' },
    { id: 'c2', name: 'Ananya Rao', role: 'Core Member', photo: '' },
    { id: 'c3', name: 'Karan Joshi', role: 'Core Member', photo: '' },
    { id: 'c4', name: 'Divya Nair', role: 'Core Member', photo: '' },
    { id: 'c5', name: 'Rohan Gupta', role: 'Core Member', photo: '' },
  ],
  media: [
    { id: 'm1', name: 'Ishaan Kapoor', role: 'Media Head', photo: '' },
    { id: 'm2', name: 'Meera Iyer', role: 'Photographer', photo: '' },
    { id: 'm3', name: 'Aditya Kumar', role: 'Videographer', photo: '' },
    { id: 'm4', name: 'Tanvi Shah', role: 'Social Media', photo: '' },
  ],
};

function MemberCard({ member, color }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="tmember-card" style={{ '--accent': color }}>
      <div className="tmember-avatar" style={{ borderColor: color + '88' }}>
        {member.photo ? (
          <img src={member.photo} alt={member.name} />
        ) : (
          <div className="tmember-initials" style={{ background: color + '22', color }}>
            {initials}
          </div>
        )}
        <div className="tmember-glow" style={{ background: color + '33' }} />
      </div>
      <div className="tmember-info">
        <h3 className="tmember-name">{member.name}</h3>
        <p className="tmember-role" style={{ color }}>{member.role}</p>
      </div>
    </div>
  );
}

export default function Team() {
  const [activeCategory, setActiveCategory] = useState('student_affairs');
  const { teamMembers } = useApp();

  const contextByCategory = {};
  (teamMembers || []).forEach(m => {
    const cat = (m.category || '').toLowerCase().replace(/\s+/g, '_');
    if (!contextByCategory[cat]) contextByCategory[cat] = [];
    contextByCategory[cat].push(m);
  });

  const getMembers = (key) => {
    const ctx = contextByCategory[key] || [];
    return ctx.length > 0 ? ctx : DEFAULT_MEMBERS[key] || [];
  };

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="team-page">
      {/* Hero */}
      <div className="page-hero team-hero">
        <div className="hero-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
          ))}
        </div>
        <div className="page-hero-content">
          <div className="section-badge">
            <Users size={14} /> Ignitron 2K26
          </div>
          <h1 className="page-hero-title">Meet My Team</h1>
          <p className="page-hero-sub">The passionate people powering Ignitron 2K26</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="team-tabs-wrapper">
        <div className="team-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`team-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              style={activeCategory === cat.key ? {
                borderColor: cat.color,
                color: cat.color,
                boxShadow: `0 0 18px ${cat.color}44`,
                background: cat.color + '18',
              } : {}}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="team-members-section">
        <div className="section-header">
          <div className="section-badge" style={{ color: activeCat?.color, borderColor: activeCat?.color + '44' }}>
            {activeCat?.emoji} {activeCat?.label}
          </div>
          <h2 className="section-title">{activeCat?.label} Team</h2>
          <p className="section-sub">The amazing people behind {activeCat?.label}</p>
        </div>
        <div className="tmembers-grid">
          {getMembers(activeCategory).map(member => (
            <MemberCard key={member.id} member={member} color={activeCat?.color || '#00E676'} />
          ))}
        </div>
      </div>
    </div>
  );
}
