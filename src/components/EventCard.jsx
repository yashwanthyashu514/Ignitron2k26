import { Link } from 'react-router-dom';
import { Clock, BookOpen, ExternalLink, Calendar } from 'lucide-react';

const categoryColors = {
  Technical: '#00D9FF',
  Robotics: '#38bdf8',
  'AI/ML': '#00E676',
  Design: '#f59e0b',
  default: '#00D9FF',
};

export default function EventCard({ event, index }) {
  const color = categoryColors[event.category] || categoryColors.default;
  const dayColors = { 'Day 1': '#00D9FF', 'Day 2': '#00E676', 'Day 3': '#f59e0b' };

  return (
    <div className="event-card" style={{ '--event-color': color, animationDelay: `${index * 0.1}s` }}>
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
        {event.maxTeamSize && (
          <div className="event-meta-item">
            <span>👥</span>
            <span>Team: {event.maxTeamSize}</span>
          </div>
        )}
        {event.prize && (
          <div className="event-meta-item prize">
            <span>🏆</span>
            <span>{event.prize}</span>
          </div>
        )}
      </div>

      <div className="event-card-actions">
        {event.rulebookLink && (
          <a href={event.rulebookLink} target="_blank" rel="noreferrer" className="btn-rulebook">
            <BookOpen size={14} />
            Rulebook
          </a>
        )}
        {event.registrationLink && (
          <a href={event.registrationLink} target="_blank" rel="noreferrer" className="btn-register-event">
            <ExternalLink size={14} />
            Register on Unstop
          </a>
        )}
      </div>

      <div className="event-card-border" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}
