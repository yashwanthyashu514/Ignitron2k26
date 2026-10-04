import { useApp } from '../context/AppContext';

export default function Timeline() {
  const { timeline } = useApp();

  const days = [
    { key: 'day1', label: 'Day 1', color: '#00D9FF', icon: '🚀' },
    { key: 'day2', label: 'Day 2', color: '#00E676', icon: '⚡' },
    { key: 'day3', label: 'Day 3', color: '#f59e0b', icon: '🏆' },
  ];

  return (
    <div className="timeline-section">
      <div className="section-header">
        <div className="section-badge">📅 Schedule</div>
        <h2 className="section-title">Event Timeline</h2>
        <p className="section-sub">Three days of innovation, competition, and glory</p>
      </div>

      <div className="timeline-days-grid">
        {days.map(({ key, label, color, icon }) => (
          <div className="timeline-day-card" key={key} style={{ '--day-color': color }}>
            <div className="timeline-day-header">
              <span className="timeline-day-icon">{icon}</span>
              <h3 className="timeline-day-title">{label}</h3>
            </div>
            <div className="timeline-events">
              {(timeline[key] || []).map((item, i) => (
                <div className="timeline-event-item" key={i}>
                  <div className="timeline-dot" />
                  <div className="timeline-event-content">
                    <span className="timeline-event-time">{item.time}</span>
                    <span className="timeline-event-name">{item.event}</span>
                  </div>
                </div>
              ))}
              {(!timeline[key] || timeline[key].length === 0) && (
                <p className="timeline-empty">Schedule coming soon...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
