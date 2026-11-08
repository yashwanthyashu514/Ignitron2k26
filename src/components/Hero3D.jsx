import React, { Suspense, useRef, useState, useEffect, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import IgnitronModel from './IgnitronModel';

/**
 * Three.js lights tailored for IGNITRON 2K26 cyan & emerald theme
 * Local and high-performance, no external network HDR dependencies
 */
function SceneLights({ isHovered }) {
  return (
    <>
      {/* Deep ambient fill */}
      <ambientLight intensity={0.5} color="#051525" />

      {/* Futuristic cyan & emerald hemisphere lighting */}
      <hemisphereLight
        skyColor="#00D9FF"
        groundColor="#00E676"
        intensity={0.65}
      />

      {/* Main key light */}
      <directionalLight
        position={[6, 8, 6]}
        intensity={1.5}
        color="#ffffff"
      />

      {/* Tech Cyan rim light */}
      <pointLight
        position={[-5, 2.5, 4]}
        intensity={isHovered ? 4.5 : 3.2}
        color="#00D9FF"
        distance={14}
        decay={2}
      />

      {/* Emerald fill light */}
      <pointLight
        position={[5, -1.5, 3]}
        intensity={isHovered ? 4.0 : 2.8}
        color="#00E676"
        distance={12}
        decay={2}
      />

      {/* Back silhouette glow accent */}
      <pointLight
        position={[0, -3.5, -4]}
        intensity={1.4}
        color="#00a8cc"
        distance={10}
        decay={2}
      />
    </>
  );
}

/**
 * Clean fallback loader
 */
function ModelLoader() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 0.9, 32]} />
      <meshBasicMaterial color="#00D9FF" wireframe />
    </mesh>
  );
}

/**
 * Error boundary for WebGL rendering
 */
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('WebGL render recovered:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00D9FF' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(0, 217, 255, 0.3)', animation: 'spin 4s linear infinite' }} />
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Hero3D canvas component with WebGL context loss protection,
 * full mobile touch & desktop drag 360-degree rotation, and momentum physics
 */
export default function Hero3D() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [contextKey, setContextKey] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause WebGL render loop when Hero is scrolled out of viewport (frees 100% GPU for smooth scrolling)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '120px' }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Rotation and momentum physics refs passed to IgnitronModel (no React re-renders during 60fps drag)
  const dragRotRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastX = 0;
    let lastY = 0;
    let startX = 0;
    let startY = 0;
    let isTouchActive = false;
    let isHorizontalGesture = false;

    // --- MOBILE TOUCH LISTENERS (Native Scroll Pass-Through & Buttery Smooth 360 Rotation) ---
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
        startX = touch.clientX;
        startY = touch.clientY;
        isTouchActive = true;
        isHorizontalGesture = false;
        isDraggingRef.current = false;
        velocityRef.current = { x: 0, y: 0 };
      }
    };

    const handleTouchMove = (e) => {
      if (!isTouchActive || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastX;
      const dy = touch.clientY - lastY;
      lastX = touch.clientX;
      lastY = touch.clientY;

      const totalX = Math.abs(touch.clientX - startX);
      const totalY = Math.abs(touch.clientY - startY);

      // If user touch intent is vertical scroll, immediately release touch control to browser
      if (!isHorizontalGesture && totalY > 7 && totalY > totalX) {
        isTouchActive = false;
        isDraggingRef.current = false;
        setIsHovered(false);
        return; // Native buttery smooth browser scrolling!
      }

      // If user drags horizontally on model, activate 3D model rotation
      if (!isHorizontalGesture && totalX > 8 && totalX >= totalY) {
        isHorizontalGesture = true;
        isDraggingRef.current = true;
        setIsHovered(true);
        setHasInteracted(true);
      }

      if (isHorizontalGesture) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const sensitivity = 0.009;
        dragRotRef.current.y += dx * sensitivity;
        dragRotRef.current.x = Math.max(-0.25, Math.min(0.25, dragRotRef.current.x + dy * (sensitivity * 0.5)));

        velocityRef.current = {
          y: dx * sensitivity,
          x: dy * (sensitivity * 0.5),
        };
      }
    };

    const handleTouchEnd = () => {
      isTouchActive = false;
      isDraggingRef.current = false;
      setIsHovered(false);
    };

    // --- DESKTOP MOUSE / POINTER DRAG ---
    let isPointerDown = false;

    const handlePointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      isPointerDown = true;
      isDraggingRef.current = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityRef.current = { x: 0, y: 0 };
      setIsHovered(true);
      setHasInteracted(true);
      try {
        container.setPointerCapture(e.pointerId);
      } catch (err) {}
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      if (isPointerDown) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        const sensitivity = 0.008;
        dragRotRef.current.y += dx * sensitivity;
        dragRotRef.current.x = Math.max(-0.35, Math.min(0.35, dragRotRef.current.x + dy * (sensitivity * 0.7)));

        velocityRef.current = {
          y: dx * sensitivity,
          x: dy * (sensitivity * 0.7),
        };
      }
    };

    const handlePointerUp = (e) => {
      if (e.pointerType === 'touch') return;
      if (isPointerDown) {
        isPointerDown = false;
        isDraggingRef.current = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    };

    // Global desktop mouse move (for gentle hover parallax tilt, zero re-renders)
    const handleGlobalMouseMove = (e) => {
      if (isMobile) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseRef.current.x = Math.max(-1.5, Math.min(1.5, (e.clientX - centerX) / (rect.width / 2)));
      mouseRef.current.y = Math.max(-1.5, Math.min(1.5, (e.clientY - centerY) / (rect.height / 2)));

      const hovered =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!isPointerDown) setIsHovered(hovered);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);

      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="hero-3d-container"
      aria-hidden="true"
    >
      {/* Outer ambient glow halo */}
      <div className={`hero-3d-glow ${isHovered ? 'hero-3d-glow--active' : ''}`} />

      {/* Interactive touch / drag hint pill */}
      <div className={`hero-3d-hint ${hasInteracted ? 'hero-3d-hint--hidden' : ''}`}>
        <span className="hero-3d-hint-icon">✦</span>
        <span>Touch & Drag to Rotate</span>
      </div>

      <WebGLErrorBoundary>
        <Canvas
          key={`${contextKey}-${isMobile ? 'm' : 'd'}`}
          frameloop={isInView ? 'always' : 'demand'}
          camera={{
            position: [0, 0.02, isMobile ? 3.65 : 4.2],
            fov: isMobile ? 47 : 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            // Prevent browser from discarding context on heavy HMR reload
            gl.domElement.addEventListener(
              'webglcontextlost',
              (event) => {
                event.preventDefault();
                console.info('WebGL context lost, auto-recovering...');
              },
              false
            );

            gl.domElement.addEventListener(
              'webglcontextrestored',
              () => {
                console.info('WebGL context restored successfully.');
                setContextKey((k) => k + 1);
              },
              false
            );
          }}
          style={{ background: 'transparent' }}
        >
          <SceneLights isHovered={isHovered} />

          <Suspense fallback={<ModelLoader />}>
            <IgnitronModel
              mouseRef={mouseRef}
              isHovered={isHovered}
              dragRotRef={dragRotRef}
              velocityRef={velocityRef}
              isDraggingRef={isDraggingRef}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
