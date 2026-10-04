import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Gallery.css";

const galleryData = [
  {
    id: 1,
    image: "/2k24 (1).jpg",
    title: "Ignitron 2K24",
    year: "2K24",
  },
  {
    id: 2,
    image: "/2k25 (2).jpg",
    title: "Ignitron 2K25",
    year: "2K25",
  },
  {
    id: 3,
    image: "/2k24 (3).jpg",
    title: "Ignitron 2K24",
    year: "2K24",
  },
  {
    id: 4,
    image: "/2k25 (4).jpg",
    title: "Ignitron 2K25",
    year: "2K25",
  },
  {
    id: 5,
    image: "/2k24 (5).jpg",
    title: "Ignitron 2K24",
    year: "2K24",
  },
  {
    id: 6,
    image: "/2k25 (6).jpg",
    title: "Ignitron 2K25",
    year: "2K25",
  },
  {
    id: 7,
    image: "/2k24 (2).jpg",
    title: "Ignitron 2K24",
    year: "2K24",
  },
];

export default function Gallery() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  /*
    Automatic movement
  */
  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % galleryData.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [paused]);

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

  return (
    <section
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
          <span> 2K24 &amp; 2K25</span>
        </h2>

        <p>
          Reliving the electric energy, innovation and unforgettable moments from our previous editions.
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
                  x: position * 310,
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
                <div className="gallery-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                  />
                  <div className="gallery-card-overlay">
                    <span>MEMORIES · {item.year}</span>
                    <h3>{item.title}</h3>
                  </div>
                </div>
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
