import { Clock, BookOpen, ExternalLink, Calendar, MapPin, Users } from 'lucide-react';

const categoryColors = {
  Technical: '#00D9FF',
  Robotics: '#38bdf8',
  'AI / Robotics': '#00E676',
  'AI / Technology': '#00E676',
  'AI/ML': '#00E676',
  'AI / Prototyping': '#06b6d4',
  'Coding & Development': '#00D9FF',
  'Coding / Hackathon': '#6366f1',
  'Coding / Collaboration': '#00D9FF',
  'Cyber Security': '#38bdf8',
  Cybersecurity: '#38bdf8',
  'Research & Technical': '#a78bfa',
  'Research / Presentation': '#a78bfa',
  'Knowledge / Presentation': '#a78bfa',
  'Management & Finance': '#f59e0b',
  'Finance / Business': '#f59e0b',
  'Debate & Literary': '#ec4899',
  'Communication / Debate': '#ec4899',
  'Law & Moot Court': '#f97316',
  'Law / Debate': '#f97316',
  'Cloud / Technology': '#38bdf8',
  'Pharma / Life Sciences': '#10b981',
  'Biotech / Life Sciences': '#10b981',
  'Pharma / Quiz': '#14b8a6',
  'Design / Technology': '#ec4899',
  'Eco-Innovation': '#10b981',
  'Sustainability / Engineering': '#10b981',
  Gaming: '#8b5cf6',
  'Gaming / E-Sports': '#8b5cf6',
  Innovation: '#06b6d4',
  'Innovation / Entrepreneurship': '#06b6d4',
  Electronics: '#eab308',
  'Electronics / Engineering': '#eab308',
  Engineering: '#eab308',
  'Electrical / Engineering': '#f59e0b',
  'Engineering / Design': '#a855f7',
  'Food Technology': '#f43f5e',
  default: '#00D9FF',
};

export default function EventCard({ event, index }) {
  const color = categoryColors[event.category] || categoryColors.default;
  const dayColors = { 'Day 1': '#00D9FF', 'Day 2': '#00E676', 'Day 3': '#f59e0b' };

  return (
    <div className="event-card" style={{ '--event-color': color, animationDelay: `${index * 0.08}s` }}>
      <div className="event-card-glow" />
      <div className="event-card-header">
        <div className="event-category-badge" style={{ background: color + '22', color }}>
          {event.category || 'Event'}
        </div>
        <div className="event-day-badge" style={{ background: (dayColors[event.day] || '#8b5cf6') + '22', color: dayColors[event.day] || '#8b5cf6' }}>
          <Calendar size={12} />
          {event.day}
        </div>
      </div>

      <h3 className="event-card-title">{event.name}</h3>
      <p className="event-card-desc">{event.description}</p>

      <div className="event-card-meta">
        <div className="event-meta-item">
          <Clock size={14} />
          <span>{event.time}</span>
        </div>
        {event.venue && (
          <div className="event-meta-item">
            <MapPin size={14} />
            <span>{event.venue}</span>
          </div>
        )}
        {event.maxTeamSize && (
          <div className="event-meta-item">
            <Users size={14} />
            <span>Team: {event.maxTeamSize}</span>
          </div>
        )}
      </div>

      <div className="event-card-actions">
        {event.rulebookLink && (
          <a href={event.rulebookLink} target="_blank" rel="noreferrer" className="btn-rulebook">
            <BookOpen size={14} />
            Info
          </a>
        )}
        {event.registrationLink && (
          <a href={event.registrationLink} target="_blank" rel="noreferrer" className="btn-register-event">
            <ExternalLink size={14} />
            Register
          </a>
        )}
      </div>

      <div className="event-card-border" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}
