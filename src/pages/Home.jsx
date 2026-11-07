import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import Countdown from '../components/Countdown';
import Hero3D from '../components/Hero3D';
import Gallery from '../components/Gallery';
import IntroLoader from '../components/IntroLoader';
import { ChevronDown, Zap, Images, UserPlus, Sparkles } from 'lucide-react';

export default function Home() {
  const { events } = useApp();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('All');
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('ignitron_intro_seen');
    } catch {
      return true;
    }
  });

  const galleryImages = [
    '/2k24 (1).jpg',
    '/2k25 (2).jpg',
    '/2k24 (3).jpg',
    '/2k25 (4).jpg',
    '/2k24 (5).jpg',
    '/2k25 (6).jpg',
    '/2k24 (2).jpg',
  ];

  const filteredEvents = activeDay === 'All' ? events : events.filter(e => e.day === activeDay);

  return (
    <div className="home-page">
      {/* Kinetic Typography & Particle Intro Loader */}
      {showIntro && (
        <IntroLoader
          ready={true}
          images={galleryImages}
          onFinish={() => {
            setShowIntro(false);
            try {
              sessionStorage.setItem('ignitron_intro_seen', 'true');
            } catch {}
          }}
          onRegister={() => {
            navigate('/events');
          }}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section hero-section--split">
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

        <div className="hero-split-container">
          {/* LEFT — IGNITRON 2K26 Title & Hero Content */}
          <div className="hero-content hero-content--left">
            <div className="hero-badge">
              <Zap size={14} />
              NATIONAL LEVEL TECH FEST
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
              December 03–05, 2026 · GMU Campus
            </p>

            <div className="hero-cta-group">
              <a href="#events-section" className="btn-hero-primary">
                Explore Events
                <ChevronDown size={18} />
              </a>
              <Link to="/events" className="btn-hero-register">
                <UserPlus size={18} />
                Register Now
              </Link>
              <button
                type="button"
                onClick={() => setShowIntro(true)}
                className="btn-replay-intro"
                title="Replay kinetic typography and particle intro"
              >
                <Sparkles size={14} />
                Intro
              </button>
            </div>
          </div>

          {/* RIGHT — Large 3D Interactive Model */}
          <div className="hero-3d-wrapper">
            <Hero3D />
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
          <div className="section-badge">Competitions</div>
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

      {/* 3D Motion Gallery */}
      <Gallery />

      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '-15px' }}>
        <Link to="/gallery" className="btn-hero-secondary" style={{ display: 'inline-flex' }}>
          <Images size={16} /> View Full Photo Gallery
        </Link>
      </div>
    </div>
  );
}
