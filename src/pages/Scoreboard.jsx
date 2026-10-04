import { useApp } from '../context/AppContext';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Scoreboard() {
  const { scoreboard } = useApp();

  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);

  const rankIcon = (rank) => {
    if (rank === 1) return <Trophy size={22} className="rank-gold" />;
    if (rank === 2) return <Medal size={22} className="rank-silver" />;
    if (rank === 3) return <Award size={22} className="rank-bronze" />;
    return <span className="rank-number">{String(rank).padStart(2, '0')}</span>;
  };

  const rankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  return (
    <div className="scoreboard-page">
      <div className="page-hero scoreboard-hero">
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
          <div className="section-badge">🏆 Rankings</div>
          <h1 className="page-hero-title">Scoreboard</h1>
          <p className="page-hero-sub">Live standings — Ignitron 2K26</p>
        </div>
      </div>

      <div className="scoreboard-content">
        {/* Top 3 Podium */}
        {sorted.length >= 3 && (
          <div className="podium-section">
            <div className="podium-grid">
              {/* 2nd Place */}
              <div className="podium-card podium-2">
                <div className="podium-avatar silver">2</div>
                <div className="podium-college">{sorted[1]?.collegeName}</div>
                <div className="podium-score">{sorted[1]?.score} pts</div>
                <div className="podium-base podium-base-2">2nd</div>
              </div>
              {/* 1st Place */}
              <div className="podium-card podium-1">
                <div className="podium-crown">👑</div>
                <div className="podium-avatar gold">1</div>
                <div className="podium-college">{sorted[0]?.collegeName}</div>
                <div className="podium-score">{sorted[0]?.score} pts</div>
                <div className="podium-base podium-base-1">1st</div>
              </div>
              {/* 3rd Place */}
              <div className="podium-card podium-3">
                <div className="podium-avatar bronze">3</div>
                <div className="podium-college">{sorted[2]?.collegeName}</div>
                <div className="podium-score">{sorted[2]?.score} pts</div>
                <div className="podium-base podium-base-3">3rd</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="rankings-table-container">
          <h3 className="rankings-title">Full Rankings</h3>
          <div className="rankings-table">
            <div className="rankings-header">
              <span>Rank</span>
              <span>College / Team</span>
              <span>Score</span>
            </div>
            {sorted.map((entry, i) => (
              <div className={`rankings-row ${rankClass(i + 1)}`} key={entry.id}>
                <div className="rankings-rank">{rankIcon(i + 1)}</div>
                <div className="rankings-college">
                  <span className="college-name">{entry.collegeName}</span>
                </div>
                <div className="rankings-score">
                  <span className="score-badge">{entry.score}</span>
                  <span className="score-label">pts</span>
                </div>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="no-scores">Scores will be updated during the event</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
