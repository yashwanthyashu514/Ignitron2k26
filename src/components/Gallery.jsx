import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Gallery.css";

const galleryData = Array.from({ length: 19 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: i + 1,
    image: `/gallery/${num}.jpg`,
    title: "Ignitron 2K25",
    year: "2K25",
  };
});

function GalleryCardImage({ item }) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(item.image);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // If lowercase .jpg failed, try uppercase .JPG as fallback
    if (currentSrc.endsWith('.jpg')) {
      setCurrentSrc(currentSrc.replace(/\.jpg$/, '.JPG'));
    } else if (currentSrc.endsWith('.JPG')) {
      setCurrentSrc(currentSrc.replace(/\.JPG$/, '.jpg'));
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="gallery-image-wrapper">
      {!loaded && !hasError && (
        <div className="gallery-skeleton-shimmer">
          <div className="gallery-loader-spinner" />
          <span className="gallery-loader-text">Loading 2K25...</span>
        </div>
      )}
      <img
        src={currentSrc}
        alt={item.title}
        draggable="false"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`gallery-card-img ${loaded ? 'is-loaded' : 'is-loading'}`}
      />
      <div className="gallery-card-overlay">
        <span>MEMORIES · {item.year}</span>
        <h3>{item.title}</h3>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  const sectionRef = React.useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause carousel animation when scrolled out of view to save mobile GPU/CPU
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { rootMargin: '100px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
    Automatic movement (only when visible)
  */
  useEffect(() => {
    if (paused || !isInView) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % galleryData.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [paused, isInView]);

  /*
    Calculate card position relative
    to the currently active card.
  */
  const getPosition = (index) => {
    let diff = index - active;
    const total = galleryData.length;

    if (diff > total / 2) {
      diff -= total;
    }

    if (diff < -total / 2) {
      diff += total;
    }

    return diff;
  };

  const xSpacing = isMobile ? 180 : 310;

  return (
    <section
      ref={sectionRef}
      className="gallery-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="gallery-header">
        <span className="gallery-small-title">
          MEMORIES &amp; FLASHBACKS
        </span>

        <h2>
          Ignitron
          <span> 2K25 Flashbacks</span>
        </h2>

        <p>
          Reliving the electric energy, innovation and unforgettable moments from Ignitron 2K25.
        </p>
      </div>

      <div className="gallery-stage">
        <div className="gallery-track">
          {galleryData.map((item, index) => {
            const position = getPosition(index);
            const isCenter = position === 0;

            return (
              <motion.div
                key={item.id}
                className={`gallery-card ${
                  isCenter ? "gallery-card-active" : ""
                }`}
                animate={{
                  x: position * xSpacing,
                  scale:
                    position === 0
                      ? 1
                      : Math.abs(position) === 1
                      ? 0.88
                      : 0.72,
                  rotateY:
                    position === 0
                      ? 0
                      : position < 0
                      ? 35
                      : -35,
                  rotateZ:
                    position === 0
                      ? 0
                      : position < 0
                      ? -3
                      : 3,
                  opacity:
                    Math.abs(position) > 2
                      ? 0
                      : Math.abs(position) === 2
                      ? 0.45
                      : 1,
                  z: 100 - Math.abs(position) * 20,
                  zIndex: 100 - Math.abs(position) * 10,
                }}
                transition={{
                  duration: 1.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => setActive(index)}
                whileHover={{
                  scale: isCenter ? 1.04 : 0.94,
                  y: -12,
                }}
              >
                <GalleryCardImage item={item} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="gallery-navigation">
        <button
          onClick={() =>
            setActive(
              (active - 1 + galleryData.length) % galleryData.length
            )
          }
          aria-label="Previous image"
        >
          ←
        </button>

        <div className="gallery-counter">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <div className="counter-line" />
          <span>{String(galleryData.length).padStart(2, "0")}</span>
        </div>

        <button
          onClick={() =>
            setActive((active + 1) % galleryData.length)
          }
          aria-label="Next image"
        >
          →
        </button>
      </div>
    </section>
  );
}
