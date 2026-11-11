import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, currentUser, authToken } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken && currentUser) {
      if (currentUser.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === 'coordinator') {
        navigate('/coordinator/dashboard', { replace: true });
      }
    }
  }, [authToken, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminLogin(username, password);
    setLoading(false);

    if (result && result.success) {
      if (result.user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result?.error || 'Invalid credentials. Please verify your username and password.');
    }
  };

  return (
    <div className="admin-login-page">
      {/* Aurora Ambient Glow Orbs */}
      <div className="login-aurora-orb orb-1" />
      <div className="login-aurora-orb orb-2" />

      {/* Floating Starfield Particles */}
      <div className="login-particles">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 19 + 7) % 96}%`,
              top: `${(i * 23 + 11) % 94}%`,
              animationDelay: `${(i * 0.35) % 4}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Main Glassmorphic Cyber Login Card */}
      <div className="login-card">
        {/* Subtle holographic corner highlight */}
        <div className="login-card-glow" />

        {/* Institution Brand Badge */}
        <div className="login-logo-container">
          <div className="login-logo-ring">
            <img src="/gmu_logo.png" alt="GM University Logo" className="login-gmu-logo" />
          </div>
        </div>

        {/* Clean, Modern Header without cluttered badges */}
        <div className="login-header">
          <h1 className="login-title">IGNITRON 2K26</h1>
          <p className="login-subtitle">Sign In</p>
        </div>

        {/* Interactive Authentication Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username / ID</label>
            <div className="input-icon-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username or coordinator ID"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="login-loading">
                <span className="spinner" /> Authenticating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>Sign In to Dashboard</span>
                <Sparkles size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="login-back">
            <ArrowLeft size={14} /> Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
