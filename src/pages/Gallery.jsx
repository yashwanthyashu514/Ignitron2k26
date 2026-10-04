import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

const GALLERY_DATA = [
  {
    year: '2K24',
    label: 'Ignitron 2K24',
    color: '#00E676',
    photos: [
      { src: '/2k24 (1).jpg', caption: 'Ignitron 2K24 Highlights' },
      { src: '/2k24 (2).jpg', caption: 'Ignitron 2K24 Highlights' },
      { src: '/2k24 (3).jpg', caption: 'Ignitron 2K24 Highlights' },
      { src: '/2k24 (4).jpg', caption: 'Ignitron 2K24 Highlights' },
      { src: '/2k24 (5).jpg', caption: 'Ignitron 2K24 Highlights' },
      { src: '/2k24 (6).jpg', caption: 'Ignitron 2K24 Highlights' },
    ],
  },
  {
    year: '2K25',
    label: 'Ignitron 2K25',
    color: '#00D9FF',
    photos: [
      { src: '/2k25 (1).jpg', caption: 'Ignitron 2K25 Highlights' },
      { src: '/2k25 (2).jpg', caption: 'Ignitron 2K25 Highlights' },
      { src: '/2k25 (3).jpg', caption: 'Ignitron 2K25 Highlights' },
      { src: '/2k25 (4).jpg', caption: 'Ignitron 2K25 Highlights' },
      { src: '/2k25 (5).jpg', caption: 'Ignitron 2K25 Highlights' },
      { src: '/2k25 (6).jpg', caption: 'Ignitron 2K25 Highlights' },
    ],
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null); // { sectionIdx, photoIdx }

  const allPhotos = lightbox !== null
    ? GALLERY_DATA[lightbox.sectionIdx].photos
    : [];

  const openLightbox = (sectionIdx, photoIdx) => setLightbox({ sectionIdx, photoIdx });
  const closeLightbox = () => setLightbox(null);

  const prevPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      photoIdx: (prev.photoIdx - 1 + allPhotos.length) % allPhotos.length,
    }));
  };

  const nextPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      photoIdx: (prev.photoIdx + 1) % allPhotos.length,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <div className="gallery-page">
      {/* Hero */}
      <div className="page-hero gallery-hero">
        <div className="hero-particles">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
          ))}
        </div>
        <div className="page-hero-content">
          <div className="section-badge">
            <Images size={14} /> Memories
          </div>
          <h1 className="page-hero-title">Gallery</h1>
          <p className="page-hero-sub">Reliving the magic of past Ignitron editions</p>
        </div>
      </div>

      {/* Sections */}
      {GALLERY_DATA.map((section, sectionIdx) => (
        <section key={section.year} className="gallery-section">
          <div className="section-header">
            <div className="section-badge" style={{ color: section.color, borderColor: section.color + '44' }}>
              📸 {section.label}
            </div>
            <h2 className="section-title" style={{ '--accent': section.color }}>
              {section.label}
            </h2>
            <div className="gallery-year-bar" style={{ background: section.color }} />
          </div>

          <div className="gallery-grid">
            {section.photos.map((photo, photoIdx) => (
              <div
                key={photoIdx}
                className="gallery-item"
                style={{ '--hover-color': section.color }}
                onClick={() => openLightbox(sectionIdx, photoIdx)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openLightbox(sectionIdx, photoIdx)}
                aria-label={`View ${photo.caption}`}
              >
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <div className="gallery-item-overlay">
                  <span className="gallery-zoom-icon">🔍</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="gallery-lightbox"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="gallery-lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lb-close" onClick={closeLightbox} aria-label="Close">
              <X size={24} />
            </button>
            <button className="lb-prev" onClick={prevPhoto} aria-label="Previous">
              <ChevronLeft size={28} />
            </button>
            <img
              className="lb-image"
              src={allPhotos[lightbox.photoIdx]?.src}
              alt={allPhotos[lightbox.photoIdx]?.caption}
            />
            <button className="lb-next" onClick={nextPhoto} aria-label="Next">
              <ChevronRight size={28} />
            </button>
            <div className="lb-caption">
              {allPhotos[lightbox.photoIdx]?.caption}
              <span className="lb-counter"> ({lightbox.photoIdx + 1}/{allPhotos.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
