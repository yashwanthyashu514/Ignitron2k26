import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, User, Eye, EyeOff, Zap } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate auth
    const ok = adminLogin(username, password);
    setLoading(false);
    if (ok) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
      </div>

      <div className="login-card">
        <div className="login-logo">
          <img src="/gmu_logo.png" alt="GMU" className="login-gmu-logo" />
        </div>

        <div className="login-header">
          <div className="login-icon-wrap">
            <Zap size={28} className="login-icon" />
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Ignitron 2K26 · GMU</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-icon-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
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
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <Lock size={14} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="login-loading">
                <span className="spinner" /> Authenticating...
              </span>
            ) : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="login-back">← Back to website</a>
        </div>
      </div>
    </div>
  );
}
