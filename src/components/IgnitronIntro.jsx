import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ChevronDown, ArrowRight, Zap, Shield, Trophy } from 'lucide-react';

/**
 * Ignitron 2K26 High-Impact Introduction Screen
 * - Interactive particle canvas forming "IGNITRON 2K26"
 * - Particle dispersion on scroll or button click
 * - Background asset preloading for 3D avatar & gallery
 * - Inspiring typography & registration call to action
 */
export default function IgnitronIntro({ onEnter, forceShow = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [preloadProgress, setPreloadProgress] = useState(15);
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [isDispersing, setIsDispersing] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // --------------------------------------------------------------------------
  // 1. ASSET PRELOADING (3D Avatar Model, Logos, Gallery Images)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const assetsToPreload = [
      '/models/MeshEntity.glb',
      '/ignitron_title_logo.png',
      '/gmu_logo.png',
      '/gmu_logo.jpg',
      '/2k24 (1).jpg',
      '/2k24 (2).jpg',
      '/2k25 (1).jpg',
      '/2k25 (2).jpg',
    ];

    let loadedCount = 0;
    const totalAssets = assetsToPreload.length;

    const updateProgress = () => {
      loadedCount++;
      const pct = Math.min(100, Math.round(20 + (loadedCount / totalAssets) * 80));
      setPreloadProgress(pct);
      if (loadedCount >= totalAssets) {
        setIsAssetsReady(true);
      }
    };

    assetsToPreload.forEach((src) => {
      if (src.endsWith('.glb')) {
        // Fetch 3D GLB file into browser HTTP cache
        fetch(src, { mode: 'cors' })
          .then(() => updateProgress())
          .catch(() => updateProgress());
      } else {
        // Preload image
        const img = new Image();
        img.src = src;
        img.onload = updateProgress;
        img.onerror = updateProgress;
      }
    });

    // Fallback: If network is slow, unlock within 2.5s anyway so user is never stuck
    const safetyTimer = setTimeout(() => {
      setPreloadProgress(100);
      setIsAssetsReady(true);
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, []);

  // --------------------------------------------------------------------------
  // 2. INTERACTIVE PARTICLE SYSTEM: SPELLS "IGNITRON 2K26"
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: -9999, y: -9999, radius: 90 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      const height = canvas.height;

      // Offscreen canvas to render text and sample pixel coordinates
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.clearRect(0, 0, width, height);

      // Responsive font sizing
      const isMobile = width < 768;
      const fontSize = isMobile ? Math.min(width * 0.14, 52) : Math.min(width * 0.1, 105);

      offCtx.font = `900 ${fontSize}px 'Oxanium', 'Michroma', sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';

      const centerY = height * 0.42;

      if (isMobile) {
        // 2 lines on mobile
        offCtx.fillText('IGNITRON', width / 2, centerY - fontSize * 0.6);
        offCtx.fillText('2K26', width / 2, centerY + fontSize * 0.6);
      } else {
        // Single line on desktop
        offCtx.fillText('IGNITRON 2K26', width / 2, centerY);
      }

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const step = isMobile ? 4 : 5; // Sampling density

      // Palette of futuristic Ignitron colors
      const colors = ['#00D9FF', '#00E676', '#FFFFFF', '#38BDF8', '#00FFA3'];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = imgData[index + 3];

          if (alpha > 130) {
            // Spawn random starting position across the universe
            const startAngle = Math.random() * Math.PI * 2;
            const startDist = Math.random() * Math.max(width, height) * 0.8 + 200;

            particles.push({
              x: width / 2 + Math.cos(startAngle) * startDist,
              y: height / 2 + Math.sin(startAngle) * startDist,
              targetX: x,
              targetY: y,
              vx: 0,
              vy: 0,
              radius: Math.random() * 1.8 + 1.2,
              color: colors[Math.floor(Math.random() * colors.length)],
              alpha: Math.random() * 0.5 + 0.5,
              originalAlpha: Math.random() * 0.5 + 0.5,
              mass: Math.random() * 0.8 + 0.2,
            });
          }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse / Touch interaction
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave);

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dispersing = isDispersingRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (dispersing) {
          // Explode outwards into deep space
          const dx = p.x - canvas.width / 2;
          const dy = p.y - canvas.height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / dist) * 1.8;
          p.vy += (dy / dist) * 1.8;
          p.x += p.vx * 1.15;
          p.y += p.vy * 1.15;
          p.alpha = Math.max(0, p.alpha - 0.022);
        } else {
          // Physics attraction to target positions (text coordinates)
          const dxTarget = p.targetX - p.x;
          const dyTarget = p.targetY - p.y;

          p.vx = (p.vx + dxTarget * 0.055) * 0.84;
          p.vy = (p.vy + dyTarget * 0.055) * 0.84;

          // Mouse repelling physics
          const dxMouse = mouse.x - p.x;
          const dyMouse = mouse.y - p.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < mouse.radius) {
            const force = (mouse.radius - distMouse) / mouse.radius;
            const angle = Math.atan2(dyMouse, dxMouse);
            p.vx -= Math.cos(angle) * force * 14;
            p.vy -= Math.sin(angle) * force * 14;
          }

          // Gentle ambient cosmic float
          p.x += p.vx + Math.sin(time + i * 0.05) * 0.35;
          p.y += p.vy + Math.cos(time + i * 0.05) * 0.35;
        }

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // Keep ref updated for loop access
  const isDispersingRef = useRef(isDispersing);
  useEffect(() => {
    isDispersingRef.current = isDispersing;
  }, [isDispersing]);

  // --------------------------------------------------------------------------
  // 3. DISPERSE & ENTER TRANSITION
  // --------------------------------------------------------------------------
  const handleTriggerEnter = useCallback(() => {
    if (isDispersing || hasEntered) return;
    setIsDispersing(true);

    // Give particle explosion 700ms to burst across the screen before unmounting
    setTimeout(() => {
      setHasEntered(true);
      sessionStorage.setItem('ignitron_intro_seen', 'true');
      if (onEnter) onEnter();
    }, 750);
  }, [isDispersing, hasEntered, onEnter]);

  // Scroll or Swipe to Enter Listener
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e) => {
      if (e.deltaY > 20) {
        handleTriggerEnter();
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const delta = touchStartY - e.changedTouches[0].clientY;
        if (delta > 35) {
          handleTriggerEnter();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        handleTriggerEnter();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTriggerEnter]);

  if (hasEntered && !forceShow) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`ignitron-intro-overlay ${isDispersing ? 'intro-dispersing' : ''}`}
    >
      {/* Deep Space Starfield & Ambient Glow */}
      <div className="intro-cosmic-bg" />
      <div className="intro-aurora-glow glow-cyan" />
      <div className="intro-aurora-glow glow-emerald" />

      {/* Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="intro-particles-canvas" />

      {/* Header Info Pill & Instant Skip Button */}
      <header className="intro-topbar">
        <div className="intro-college-badge">
          <img src="/gmu_logo.png" alt="GMU" className="intro-gmu-crest" />
          <div className="intro-college-text">
            <span className="college-org">GM UNIVERSITY, DAVANAGERE</span>
            <span className="college-sub">DEPARTMENT OF EVENT OPERATIONS</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerEnter}
          className="btn-intro-skip"
          title="Instant Access"
        >
          <span>Skip Intro</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Narrative Content Container */}
      <div className="intro-narrative-container">
        {/* Event Announcement Badge */}
        <div className="intro-badge-row">
          <div className="intro-badge-pill">
            <Zap size={14} className="intro-badge-icon" />
            <span>NATIONAL LEVEL MEGA TECH REVOLUTION</span>
          </div>
          <div className="intro-date-pill">
            <span>DECEMBER 03–05, 2026</span>
          </div>
        </div>

        {/* Holographic Particle Prompt Instructions */}
        <p className="intro-canvas-hint">
          <span>✦ Interactive Cyberfield · Move Cursor / Touch To Warp Particles</span>
        </p>

        {/* Inspiring Participant Motivation Block */}
        <div className="intro-manifesto-card">
          <h2 className="intro-manifesto-quote">
            "Where Code Becomes Legacy. Engineering Meets Supremacy."
          </h2>

          <p className="intro-manifesto-sub">
            Prepare for 3 days of relentless engineering, adrenaline-fueled hackathons,
            autonomous robotics, and next-gen gaming. Over <strong>50+ Top Universities</strong>,
            <strong> 29 Championship Arenas</strong>, and <strong>₹ Lakhs in Bounties</strong>.
          </p>

          <div className="intro-highlights-row">
            <div className="intro-highlight-item">
              <Trophy size={16} color="#f59e0b" />
              <span>₹ Lakhs in Cash & Awards</span>
            </div>
            <div className="intro-highlight-item">
              <Shield size={16} color="#00D9FF" />
              <span>National Accreditation</span>
            </div>
            <div className="intro-highlight-item">
              <Sparkles size={16} color="#00E676" />
              <span>29 Arenas Open</span>
            </div>
          </div>
        </div>

        {/* Enter Arena Action Area & Asset Preload Telemetry */}
        <div className="intro-cta-wrapper">
          <button
            type="button"
            onClick={handleTriggerEnter}
            className="btn-intro-enter"
          >
            <span className="btn-enter-glow" />
            <span className="btn-enter-text">ENTER FESTIVAL ARENA</span>
            <ArrowRight size={18} className="btn-enter-arrow" />
          </button>

          {/* Asset Telemetry Progress Meter */}
          <div className="intro-telemetry-block">
            <div className="intro-telemetry-header">
              <span className="telemetry-sys-label">
                {isAssetsReady ? '✓ 3D CORE & NEURAL ASSETS SYNCED' : 'INITIALIZING 3D AVATAR & FESTIVAL ASSETS...'}
              </span>
              <span className="telemetry-pct">{preloadProgress}%</span>
            </div>
            <div className="intro-telemetry-bar">
              <div
                className="intro-telemetry-fill"
                style={{ width: `${preloadProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator Trigger */}
      <div className="intro-scroll-indicator" onClick={handleTriggerEnter}>
        <div className="intro-mouse-icon">
          <div className="intro-mouse-wheel" />
        </div>
        <span className="intro-scroll-text">SCROLL DOWN OR CLICK TO ENTER</span>
        <ChevronDown size={18} className="intro-scroll-arrow" />
      </div>
    </div>
  );
}
