import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
  X,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function Timeline() {
  const { timeline } = useApp();
  const [selectedDay, setSelectedDay] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('stream'); // 'stream' or 'columns'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const dayMetadata = [
    {
      key: 'day1',
      label: 'Day 1',
      date: 'December 04, 2026',
      shortDate: 'Dec 04',
      themeColor: '#00D9FF',
      themeColorRgb: '0, 217, 255',
      tagline: 'Inauguration, Hackathons & Grand Opening',
    },
    {
      key: 'day2',
      label: 'Day 2',
      date: 'December 05, 2026',
      shortDate: 'Dec 05',
      themeColor: '#00E676',
      themeColorRgb: '0, 230, 118',
      tagline: 'Robotics, Coding Sprints & Core Competitions',
    },
    {
      key: 'day3',
      label: 'Day 3',
      date: 'December 06, 2026',
      shortDate: 'Dec 06',
      themeColor: '#f59e0b',
      themeColorRgb: '245, 158, 11',
      tagline: 'Championship Finals, Valedictory & Celebrations',
    },
  ];

  // Compile day data with day indicators
  const allEventsGrouped = useMemo(() => {
    return dayMetadata.map(meta => {
      const rawEvents = timeline[meta.key] || [];
      const withMeta = rawEvents.map((item, idx) => ({
        ...item,
        id: `${meta.key}-${idx}`,
        dayKey: meta.key,
        dayLabel: meta.label,
        dayDate: meta.date,
        dayColor: meta.themeColor,
        dayColorRgb: meta.themeColorRgb,
      }));
      return {
        ...meta,
        events: withMeta,
      };
    });
  }, [timeline]);

  // Total count
  const totalEventsCount = useMemo(() => {
    return allEventsGrouped.reduce((sum, g) => sum + g.events.length, 0);
  }, [allEventsGrouped]);

  // Filtered by selected day and search query
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allEventsGrouped
      .filter(g => selectedDay === 'all' || g.key === selectedDay)
      .map(group => {
        let items = group.events;
        if (q) {
          items = items.filter(ev => {
            const matchName = (ev.event || '').toLowerCase().includes(q);
            const matchClub = (ev.club || '').toLowerCase().includes(q);
            const matchVenue = (ev.venue || '').toLowerCase().includes(q);
            const matchTagline = (ev.tagline || '').toLowerCase().includes(q);
            const matchTime = (ev.time || '').toLowerCase().includes(q);
            return matchName || matchClub || matchVenue || matchTagline || matchTime;
          });
        }
        return {
          ...group,
          events: items,
        };
      })
      .filter(g => selectedDay === 'all' || g.key === selectedDay);
  }, [allEventsGrouped, selectedDay, search]);

  const totalFilteredCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.events.length, 0);
  }, [filteredGroups]);

  return (
    <div className="timeline-page">
      {/* ===== HERO SECTION ===== */}
      <section className="page-hero timeline-page-hero">
        <div className="hero-particles">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${(i * 19) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${(i * 0.4) % 4}s`,
                animationDuration: `${3.5 + ((i * 0.7) % 3)}s`,
              }}
            />
          ))}
        </div>

        <div className="page-hero-content">
          <div className="section-badge">
            <Calendar size={14} /> Official Festival Schedule
          </div>
          <h1 className="page-hero-title">Event Timeline</h1>
          <p className="page-hero-sub">
            December 04 – 06, 2026 · Three days of non-stop engineering, robotics, and competitions
          </p>

          {/* Quick Metrics Bar */}
          <div className="timeline-hero-stats">
            <div className="timeline-stat-chip">
              <Sparkles size={14} className="stat-chip-icon stat-icon-cyan" />
              <span>
                <strong>3 Days</strong> of Action
              </span>
            </div>
            <div className="timeline-stat-chip">
              <Zap size={14} className="stat-chip-icon stat-icon-emerald" />
              <span>
                <strong>{totalEventsCount}+</strong> Scheduled Sessions
              </span>
            </div>
            <div className="timeline-stat-chip">
              <MapPin size={14} className="stat-chip-icon stat-icon-amber" />
              <span>
                <strong>GMU Campus</strong> Davanagere
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTROLS & NAVIGATION BAR ===== */}
      <div className="timeline-controls-wrapper">
        <div className="timeline-controls-inner">
          {/* Day Tabs */}
          <div className="timeline-day-nav">
            <button
              className={`timeline-nav-tab ${selectedDay === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedDay('all')}
            >
              <Layers size={14} />
              <span>All 3 Days</span>
              <span className="timeline-tab-count">{totalEventsCount}</span>
            </button>

            {dayMetadata.map(d => {
              const count = (timeline[d.key] || []).length;
              return (
                <button
                  key={d.key}
                  className={`timeline-nav-tab ${selectedDay === d.key ? 'active' : ''}`}
                  onClick={() => setSelectedDay(d.key)}
                  style={{
                    '--tab-color': d.themeColor,
                  }}
                >
                  <span
                    className="timeline-tab-dot"
                    style={{ background: d.themeColor, boxShadow: `0 0 10px ${d.themeColor}` }}
                  />
                  <span>{d.label}</span>
                  <span className="timeline-tab-date">({d.shortDate})</span>
                  <span className="timeline-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="timeline-filter-row">
            <div className="timeline-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search schedule by event, club, venue..."
                className="timeline-search-input"
              />
              {search && (
                <button
                  className="timeline-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="timeline-view-switcher">
              <button
                className={`timeline-switch-btn ${viewMode === 'stream' ? 'active' : ''}`}
                onClick={() => setViewMode('stream')}
                title="Continuous Chronological Stream"
              >
                Chronological
              </button>
              <button
                className={`timeline-switch-btn ${viewMode === 'columns' ? 'active' : ''}`}
                onClick={() => setViewMode('columns')}
                title="Day Cards View"
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN TIMELINE CONTENT AREA ===== */}
      <main className="timeline-main-content">
        {totalFilteredCount === 0 ? (
          <div className="timeline-no-results">
            <div className="no-results-icon-wrap">
              <Search size={32} />
            </div>
            <h3>No events found</h3>
            <p>
              We couldn't find any sessions matching &ldquo;{search}&rdquo;. Try another keyword.
            </p>
            <button className="btn-timeline-reset" onClick={() => setSearch('')}>
              Reset Search
            </button>
          </div>
        ) : viewMode === 'stream' ? (
          /* ======================================================== */
          /* CHRONOLOGICAL STREAM WITH SMOOTH LASER SPINE & GLOW NODES */
          /* ======================================================== */
          <div className="timeline-stream-container">
            {filteredGroups.map(group => {
              if (group.events.length === 0) return null;

              return (
                <section
                  key={group.key}
                  id={`day-section-${group.key}`}
                  className="timeline-stream-day-section"
                  style={{ '--day-accent': group.themeColor, '--day-accent-rgb': group.themeColorRgb }}
                >
                  {/* Day Header Milestone */}
                  <div className="timeline-day-milestone">
                    <div className="milestone-badge" style={{ borderColor: group.themeColor + '66' }}>
                      <span className="milestone-dot" style={{ background: group.themeColor }} />
                      <span className="milestone-day">{group.label}</span>
                      <span className="milestone-sep">·</span>
                      <span className="milestone-date">{group.date}</span>
                    </div>
                    <p className="milestone-sub">{group.tagline}</p>
                    <div className="milestone-counter">
                      {group.events.length} Event{group.events.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Vertical Animated Spine & Nodes */}
                  <div className="timeline-stream-track">
                    <div className="timeline-glowing-spine" />

                    <div className="timeline-stream-nodes">
                      {group.events.map((item, idx) => (
                        <div
                          key={item.id}
                          className="timeline-node-row"
                          style={{
                            animationDelay: `${idx * 0.05}s`,
                          }}
                        >
                          {/* Glowing Event Point */}
                          <div className="timeline-node-point-wrapper">
                            <div className="timeline-pulse-ring" />
                            <div
                              className="timeline-node-core"
                              style={{
                                background: group.themeColor,
                                boxShadow: `0 0 16px ${group.themeColor}, 0 0 32px ${group.themeColor}aa`,
                              }}
                            />
                            <div className="timeline-node-arm" />
                          </div>

                          {/* Time Column */}
                          <div className="timeline-time-col">
                            <span
                              className="timeline-time-pill"
                              style={{
                                borderColor: group.themeColor + '44',
                                color: group.themeColor,
                              }}
                            >
                              <Clock size={12} />
                              {item.time}
                            </span>
                          </div>

                          {/* Interactive Event Card */}
                          <div className="timeline-card-interactive">
                            <div className="timeline-card-glow" />

                            <div className="timeline-card-header">
                              <div className="timeline-card-badges">
                                <span
                                  className="timeline-day-pill"
                                  style={{
                                    background: group.themeColor + '20',
                                    color: group.themeColor,
                                    borderColor: group.themeColor + '40',
                                  }}
                                >
                                  {group.label}
                                </span>
                                {item.club && (
                                  <span className="timeline-club-pill">
                                    <Sparkles size={11} />
                                    {item.club}
                                  </span>
                                )}
                              </div>
                            </div>

                            <h3 className="timeline-card-title">{item.event}</h3>

                            {item.tagline && (
                              <p className="timeline-card-tagline">
                                &ldquo;{item.tagline}&rdquo;
                              </p>
                            )}

                            <div className="timeline-card-meta-bottom">
                              {item.venue && (
                                <div className="timeline-card-venue">
                                  <MapPin size={13} />
                                  <span>{item.venue}</span>
                                </div>
                              )}

                              {(item.rulebookLink || item.registrationLink) && (
                                <div className="timeline-card-actions">
                                  {item.rulebookLink && (
                                    <a
                                      href={item.rulebookLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-timeline-action btn-timeline-info"
                                    >
                                      <BookOpen size={12} />
                                      Rulebook
                                    </a>
                                  )}
                                  {item.registrationLink && (
                                    <a
                                      href={item.registrationLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-timeline-action btn-timeline-reg"
                                    >
                                      <ExternalLink size={12} />
                                      Register
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* GRID VIEW: SIDE-BY-SIDE DAY COLUMNS FOR SCANNING */
          /* ======================================================== */
          <div className="timeline-grid-view">
            {filteredGroups.map(group => (
              <div
                key={group.key}
                className="timeline-grid-column"
                style={{ '--col-accent': group.themeColor }}
              >
                <div className="timeline-col-header">
                  <div
                    className="col-header-badge"
                    style={{ background: group.themeColor + '20', color: group.themeColor }}
                  >
                    {group.label}
                  </div>
                  <h3 className="col-header-title">{group.date}</h3>
                  <p className="col-header-count">{group.events.length} Events Scheduled</p>
                </div>

                <div className="timeline-col-events-list">
                  {group.events.map(item => (
                    <div key={item.id} className="timeline-col-item">
                      <div className="col-item-header">
                        <span className="col-item-time" style={{ color: group.themeColor }}>
                          <Clock size={11} /> {item.time}
                        </span>
                        {item.club && (
                          <span className="col-item-club">{item.club}</span>
                        )}
                      </div>

                      <h4 className="col-item-title">{item.event}</h4>

                      {item.tagline && (
                        <p className="col-item-tagline">&ldquo;{item.tagline}&rdquo;</p>
                      )}

                      <div className="col-item-footer">
                        {item.venue && (
                          <span className="col-item-venue">
                            <MapPin size={11} /> {item.venue}
                          </span>
                        )}

                        <div className="col-item-btns">
                          {item.rulebookLink && (
                            <a
                              href={item.rulebookLink}
                              target="_blank"
                              rel="noreferrer"
                              className="col-btn-info"
                              title="Rulebook"
                            >
                              <BookOpen size={11} /> Info
                            </a>
                          )}
                          {item.registrationLink && (
                            <a
                              href={item.registrationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="col-btn-reg"
                              title="Register"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {group.events.length === 0 && (
                    <div className="col-empty">No matching events</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
