import React, { useState, useEffect } from 'react';

/**
 * Branded Ignitron 2K26 Futuristic Cyber HUD Loader
 * Features rotating quantum orbital rings, GMU insignia badge, and Oxanium telemetry status.
 */
export default function CyberLoader({
  text = 'INITIALIZING TELEMETRY STREAM...',
  subtext = 'Ignitron 2K26 · GM University Central Operations',
  fullScreen = false,
  size = 'default', // 'small' | 'default' | 'large'
}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`cyber-hud-loader-wrapper ${fullScreen ? 'cyber-hud-fullscreen' : ''} size-${size}`}>
      {/* Ambient Aurora Glow Aura */}
      <div className="cyber-hud-aura" />

      {/* Cyber Brackets HUD Frame */}
      <div className="cyber-hud-frame">
        <span className="hud-corner top-left" />
        <span className="hud-corner top-right" />
        <span className="hud-corner bottom-left" />
        <span className="hud-corner bottom-right" />

        {/* Orbital Neon Rings */}
        <div className="cyber-orbital-container">
          <div className="orbital-ring orbital-outer" />
          <div className="orbital-ring orbital-inner" />
          <div className="orbital-particles" />

          {/* Central GMU Shield */}
          <div className="cyber-hud-crest">
            <img src="/gmu_logo.png" alt="GMU" className="cyber-hud-gmu-img" />
          </div>
        </div>

        {/* Telemetry Typography */}
        <div className="cyber-hud-text-block">
          <div className="cyber-hud-title">
            <span className="telemetry-bracket">[</span>
            <span className="telemetry-label">{text}</span>
            <span className="telemetry-dots">{dots}</span>
            <span className="telemetry-bracket">]</span>
          </div>
          {subtext && <div className="cyber-hud-subtitle">{subtext}</div>}

          {/* Micro Telemetry Bar */}
          <div className="cyber-hud-meter">
            <div className="cyber-hud-meter-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

