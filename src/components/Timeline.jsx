import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, BookOpen, ExternalLink } from 'lucide-react';

export default function Timeline() {
  const { timeline } = useApp();
  const [selectedDay, setSelectedDay] = useState('all');

  const days = [
    { key: 'day1', label: 'Day 1', date: 'December 04, 2026', color: '#00D9FF', icon: '' },
    { key: 'day2', label: 'Day 2', date: 'December 05, 2026', color: '#00E676', icon: '' },
    { key: 'day3', label: 'Day 3', date: 'December 06, 2026', color: '#f59e0b', icon: '' },
  ];

  const visibleDays = selectedDay === 'all' ? days : days.filter(d => d.key === selectedDay);

  return (
    <div className="timeline-section" id="timeline-section">
      <div className="section-header">
        <div className="section-badge">Official Schedule</div>
        <h2 className="section-title">Event Timeline</h2>
        <p className="section-sub">
          December 04 – 06, 2026 · Three days of non-stop innovation, hackathons, and competitions
        </p>
      </div>

      {/* Filter Tabs for Easy Exploration */}
      <div className="timeline-filter-tabs">
        <button
          className={`timeline-tab-btn ${selectedDay === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedDay('all')}
        >
          Full 3-Day Schedule
        </button>
        {days.map(({ key, label, date }) => (
          <button
            key={key}
            className={`timeline-tab-btn ${selectedDay === key ? 'active' : ''}`}
            onClick={() => setSelectedDay(key)}
          >
            {label} ({date.replace(', 2026', '')})
          </button>
        ))}
      </div>

      {/* Timeline Days Grid */}
      <div className={`timeline-days-grid ${selectedDay !== 'all' ? 'timeline-days-grid--single' : ''}`}>
        {visibleDays.map(({ key, label, date, color, icon }) => {
          const eventsList = timeline[key] || [];

          return (
            <div className="timeline-day-card" key={key} style={{ '--day-color': color }}>
              <div className="timeline-day-header">
                <span className="timeline-day-icon">{icon}</span>
                <div className="timeline-day-info">
                  <h3 className="timeline-day-title">{label}</h3>
                  <span className="timeline-day-date">{date}</span>
                </div>
              </div>

              <div className="timeline-events">
                {eventsList.map((item, i) => (
                  <div className="timeline-event-item" key={i}>
                    <div className="timeline-dot" />
                    <div className="timeline-event-content">
                      <div className="timeline-event-meta-top">
                        <span className="timeline-event-time">
                          <Clock size={12} />
                          {item.time}
                        </span>
                        {item.club && (
                          <span className="timeline-event-club">
                            {item.club}
                          </span>
                        )}
                      </div>

                      <span className="timeline-event-name">{item.event}</span>

                      {item.tagline && (
                        <span className="timeline-event-tagline">
                          "{item.tagline}"
                        </span>
                      )}

                      <div className="timeline-event-bottom">
                        {item.venue && (
                          <span className="timeline-event-venue">
                            <MapPin size={12} />
                            {item.venue}
                          </span>
                        )}

                        {(item.rulebookLink || item.registrationLink) && (
                          <div className="timeline-event-links">
                            {item.rulebookLink && (
                              <a
                                href={item.rulebookLink}
                                target="_blank"
                                rel="noreferrer"
                                className="timeline-link-info"
                                title="Download Brochure / Rulebook"
                              >
                                <BookOpen size={11} /> Info
                              </a>
                            )}
                            {item.registrationLink && (
                              <a
                                href={item.registrationLink}
                                target="_blank"
                                rel="noreferrer"
                                className="timeline-link-register"
                                title="Register on Unstop / Form"
                              >
                                <ExternalLink size={11} /> Register
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {eventsList.length === 0 && (
                  <p className="timeline-empty">Schedule coming soon...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
