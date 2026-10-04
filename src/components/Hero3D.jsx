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
 * Hero3D canvas component with WebGL context loss protection
 */
export default function Hero3D() {
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [contextKey, setContextKey] = useState(0);

  // Track mouse smoothly across the screen or container
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center of 3D container, clamped to -1.5..1.5
      const x = Math.max(-1.5, Math.min(1.5, (e.clientX - centerX) / (rect.width / 2)));
      const y = Math.max(-1.5, Math.min(1.5, (e.clientY - centerY) / (rect.height / 2)));

      setMouse({ x, y });

      const hovered =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setIsHovered(hovered);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-3d-container"
      aria-hidden="true"
    >
      {/* Outer ambient glow halo */}
      <div className={`hero-3d-glow ${isHovered ? 'hero-3d-glow--active' : ''}`} />

      <WebGLErrorBoundary>
        <Canvas
          key={contextKey}
          camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
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
              mouseX={mouse.x}
              mouseY={mouse.y}
              isHovered={isHovered}
            />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
