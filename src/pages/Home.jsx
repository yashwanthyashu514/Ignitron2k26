import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import Countdown from '../components/Countdown';
import Timeline from '../components/Timeline';
import { ChevronDown, Zap, Images } from 'lucide-react';

const GALLERY_PREVIEW = [
  { src: '/2k24 (1).jpg', year: '2K24' },
  { src: '/2k24 (3).jpg', year: '2K24' },
  { src: '/2k24 (5).jpg', year: '2K24' },
  { src: '/2k25 (2).jpg', year: '2K25' },
  { src: '/2k25 (4).jpg', year: '2K25' },
  { src: '/2k25 (6).jpg', year: '2K25' },
];

export default function Home() {
  const { events } = useApp();
  const [activeDay, setActiveDay] = useState('All');

  const filteredEvents = activeDay === 'All' ? events : events.filter(e => e.day === activeDay);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            GMU's Premier Tech Fest
          </div>
          <h1 className="hero-title">
            <img
              src="/ignitron_title_logo.png"
              alt="IGNITRON 2K26"
              className="hero-title-img"
            />
            <span className="sr-only">IGNITRON 2K26</span>
          </h1>
          <p className="hero-subtitle">
            Ignite your potential. Compete. Innovate. Conquer.
          </p>
          <p className="hero-tagline">
            April 15–17, 2026 · George Mason University
          </p>

          <div className="hero-cta-group">
            <a href="#events-section" className="btn-hero-primary">
              Explore Events
              <ChevronDown size={18} />
            </a>
            <Link to="/gallery" className="btn-hero-secondary">
              <Images size={16} />
              Gallery
            </Link>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <ChevronDown size={20} className="bounce" />
        </div>
      </section>


      {/* Countdown */}
      <Countdown />

      {/* Events List */}
      <section className="events-section" id="events-section">
        <div className="section-header">
          <div className="section-badge">🎯 Competitions</div>
          <h2 className="section-title">Events</h2>
          <p className="section-sub">Choose your battlefield</p>
        </div>

        <div className="day-filter">
          {['All', 'Day 1', 'Day 2', 'Day 3'].map(day => (
            <button
              key={day}
              className={`day-filter-btn ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="events-grid">
          {filteredEvents.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
          {filteredEvents.length === 0 && (
            <div className="no-events">No events for {activeDay}</div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <Timeline />

      {/* Gallery Section */}
      <section className="home-gallery-section">
        <div className="section-header">
          <div className="section-badge"><Images size={14} /> Memories</div>
          <h2 className="section-title">Gallery</h2>
          <p className="section-sub">Reliving the magic of Ignitron 2K24 &amp; 2K25</p>
        </div>
        <div className="home-gallery-grid">
          {GALLERY_PREVIEW.map((item, i) => (
            <div key={i} className={`home-gallery-item year-${item.year.toLowerCase()}`}>
              <img src={item.src} alt={`Ignitron ${item.year}`} loading="lazy" />
              <div className="home-gallery-year-badge">{item.year}</div>
              <div className="home-gallery-overlay" />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/gallery" className="btn-hero-secondary" style={{ display: 'inline-flex' }}>
            <Images size={16} /> View Full Gallery
          </Link>
        </div>
      </section>
    </div>
  );
}
