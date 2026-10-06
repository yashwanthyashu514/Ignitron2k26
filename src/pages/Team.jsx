import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Star, Camera } from 'lucide-react';

const CATEGORIES = [
  { key: 'organizer', label: 'Organization', icon: Star, color: '#00E676' },
  { key: 'core', label: 'Core', icon: Users, color: '#00D9FF' },
  { key: 'media', label: 'Media', icon: Camera, color: '#F59E0B' },
];

const DEFAULT_MEMBERS = {
  organizer: [
    {
      id: 'org1',
      name: 'Dr. S. R. Shankapal',
      role: 'Vice Chancellor',
      org: 'GM University',
      photo: '/team/dr_s_r_shankapal.png',
    },
    {
      id: 'org2',
      name: 'Prof. Dr. M. Venu Gopala Rao',
      role: 'Pro Vice Chancellor',
      org: 'GM University',
      photo: '/team/dr_m_venu_gopala_rao.png',
    },
    {
      id: 'org3',
      name: 'Dr. Sunil Kumar B. S',
      role: 'Registrar',
      org: 'GM University',
      photo: '/team/dr_sunil_kumar_b_s.png',
    },
    {
      id: 'org4',
      name: 'Dr. Kiran Kumar H S',
      role: 'Director, Students Affairs',
      org: 'GM University',
      photo: '/team/dr_kiran_kumar_h_s.png',
    },
    {
      id: 'org5',
      name: 'Mr. Imran Khan',
      role: 'Assistant Director',
      org: 'Technical Clubs, GM University',
      photo: '/team/mr_imran_khan.png',
    },
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
  const [imgError, setImgError] = useState(false);
  const cleanName = member.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/gi, '').trim();
  const initials = cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || member.name.slice(0, 2).toUpperCase();

  return (
    <div className="tmember-card" style={{ '--accent': color }}>
      <div className="tmember-avatar" style={{ borderColor: color + '88' }}>
        {member.photo && !imgError ? (
          <img src={member.photo} alt={member.name} onError={() => setImgError(true)} />
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
        {member.org && <p className="tmember-org">{member.org}</p>}
      </div>
    </div>
  );
}

export default function Team() {
  const [activeCategory, setActiveCategory] = useState('organizer');
  const { teamMembers } = useApp();

  const contextByCategory = {};
  (teamMembers || []).forEach(m => {
    const cat = (m.category || '').toLowerCase().replace(/\s+/g, '_');
    if (!contextByCategory[cat]) contextByCategory[cat] = [];
    contextByCategory[cat].push(m);
  });

  const getMembers = (key) => {
    const rawCtx = contextByCategory[key] || (key === 'organizer' ? contextByCategory['organization'] : null) || [];
    const filteredCtx = rawCtx.filter(
      m => !['Dr. Ramesh Kumar', 'Arjun Sharma', 'Priya Mehta', 'Rahul Verma'].includes(m.name)
    );
    return filteredCtx.length > 0 ? filteredCtx : DEFAULT_MEMBERS[key] || [];
  };

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);
  const ActiveIcon = activeCat?.icon;

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
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
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
                {Icon && <Icon size={14} />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Grid */}
      <div className="team-members-section">
        <div className="section-header">
          <div className="section-badge" style={{ color: activeCat?.color, borderColor: activeCat?.color + '44' }}>
            {ActiveIcon && <ActiveIcon size={14} />} {activeCat?.label}
          </div>
          <h2 className="section-title">{activeCat?.label} Team</h2>
          <p className="section-sub">
            {activeCategory === 'organizer'
              ? 'The esteemed leadership and organization team behind Ignitron 2K26'
              : `The amazing people behind ${activeCat?.label}`}
          </p>
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
