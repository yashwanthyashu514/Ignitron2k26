import { useState } from 'react';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import { Search } from 'lucide-react';

export default function Events() {
  const { events } = useApp();
  const [search, setSearch] = useState('');
  const [activeDay, setActiveDay] = useState('All');

  const filtered = events.filter(e => {
    const matchDay = activeDay === 'All' || e.day === activeDay;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(search.toLowerCase());
    return matchDay && matchSearch;
  });

  return (
    <div className="events-page">
      <div className="page-hero events-hero">
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
          <div className="section-badge">🎯 Ignitron 2K26</div>
          <h1 className="page-hero-title">All Events</h1>
          <p className="page-hero-sub">Find your event and register on Unstop</p>
        </div>
      </div>

      <div className="events-controls">
        {/* Search */}
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Day Tabs */}
        <div className="events-day-tabs">
          {['All', 'Day 1', 'Day 2', 'Day 3'].map(day => (
            <button
              key={day}
              className={`events-day-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day === 'All' ? '🗓 All Days' : day}
            </button>
          ))}
        </div>
      </div>

      <div className="events-page-content">
        <p className="events-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
        <div className="events-grid">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="no-events">
              <span>🔍</span>
              <p>No events match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
