import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download, Calendar, Users, Home, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { brochureLink } = useApp();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/events', label: 'Events', icon: <Calendar size={16} /> },
    { to: '/timeline', label: 'Timeline', icon: <Clock size={16} /> },
    { to: '/team', label: 'Team', icon: <Users size={16} /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo Left */}
        <Link to="/" className="nav-logo">
          <img src="/gmu_logo.png" alt="GMU Logo" className="gmu-logo-img" />
          <div className="logo-text">
            <span className="logo-main">IGNITRON</span>
            <span className="logo-sub">2K26</span>
          </div>
        </Link>

        {/* Desktop Nav Center */}
        <ul className="nav-links-desktop">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`}>
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="nav-right">
          <a
            href={brochureLink}
            target="_blank"
            rel="noreferrer"
            className="btn-brochure"
          >
            <Download size={16} />
            Brochure
          </a>
          <a
            href="/events#register"
            className="btn-register"
          >
            Register Now
          </a>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <a href={brochureLink} target="_blank" rel="noreferrer" className="mobile-link" onClick={() => setMenuOpen(false)}>
            <Download size={16} /> Download Brochure
          </a>
          <Link to="/events#register" className="mobile-link highlight" onClick={() => setMenuOpen(false)}>
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}
