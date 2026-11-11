import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images, ZoomIn } from 'lucide-react';

const PHOTOS_2K25 = [
  "DSC_0006.JPG",
  "DSC_0020.JPG",
  "DSC_0121.JPG",
  "DSC_0633.JPG",
  "DSC_0634.JPG",
  "DSC_0646.JPG",
  "DSC_0713.JPG",
  "DSC_0718.JPG",
  "DSC_0753.JPG",
  "DSC_4105.JPG",
  "IMG_1490.JPG",
  "IMG_1519.JPG",
  "IMG_1537.JPG",
  "IMG_1539.JPG",
  "IMG_2169.JPG",
  "IMG_2262.JPG",
  "IMG_2358.JPG",
  "IMG_2374.JPG",
  "IMG_2377.JPG",
  "IMG_2667.JPG",
  "IMG_3695.JPG",
  "IMG_3906.JPG",
  "IMG_3909.JPG",
  "IMG_3922.JPG",
  "IMG_3935.JPG",
  "IMG_3957.JPG",
  "IMG_3959.JPG",
  "IMG_3960.JPG",
  "IMG_3961.JPG",
  "IMG_4011.JPG",
  "IMG_4046.JPG",
  "IMG_4443.JPG",
  "IMG_4479.JPG",
  "IMG_4510.JPG",
  "IMG_4557.JPG",
  "IMG_4559.JPG",
  "IMG_4690.JPG",
  "IMG_4774.JPG",
  "IMG_4863.JPG",
  "IMG_4871.JPG",
  "IMG_7322.JPG",
  "IMG_7536.JPG",
  "IMG_7538.JPG",
  "IMG_7581.JPG",
  "Copy of IMG_2692.JPG",
  "IMG-20251204-WA0048.jpg",
  "IMG-20251204-WA0059.jpg",
  "Screenshot 2026-11-11 092940.png",
  "WhatsApp Image 2026-11-07 at 5.54.31 PM.jpeg",
  "WhatsApp Image 2026-11-07 at 5.55.25 PM.jpeg",
  "WhatsApp Image 2026-11-07 at 5.56.03 PM.jpeg",
  "WhatsApp Image 2026-11-07 at 5.56.27 PM.jpeg",
  "WhatsApp Image 2026-11-07 at 5.59.04 PM.jpeg"
];

const GALLERY_DATA = [
  {
    year: '2K25',
    label: 'Ignitron 2K25',
    color: '#00D9FF',
    photos: PHOTOS_2K25.map((file, idx) => ({
      src: `/gallery/2k25/${encodeURI(file)}`,
      caption: `Ignitron 2K25 Highlights #${idx + 1}`,
    })),
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
          <p className="page-hero-sub">Reliving the electric energy and memories of Ignitron 2K25</p>
        </div>
      </div>

      {/* Sections */}
      {GALLERY_DATA.map((section, sectionIdx) => (
        <section key={section.year} className="gallery-section">
          <div className="section-header">
            <div className="section-badge" style={{ color: section.color, borderColor: section.color + '44' }}>
              {section.label}
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
                  <span className="gallery-zoom-icon">
                    <ZoomIn size={24} color="#00D9FF" />
                  </span>
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
