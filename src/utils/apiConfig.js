// Centralized API Configuration for Ignitron 2K26
// Ensures accurate routing whether hosted on GMU domain, Render, Vercel, or Localhost.

export const DEFAULT_PRODUCTION_BACKENDS = [
  'https://ignitron2k26-backend.onrender.com', // Render Primary
  'https://ignitron2k26.onrender.com',         // Render Alternative
  'https://ignitron2k26.vercel.app',           // Vercel (fallback)
];

export function getApiBaseUrl() {
  // 1. Runtime override stored in localStorage (allows instant switching to any Render/cloud URL from Admin or browser)
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('ignitron_backend_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  }

  // 2. Explicit Vite environment variable takes priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 3. Browser runtime domain auto-detection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // If the frontend is running on GM University official site or GitHub Pages,
    // route API calls to the centralized live backend
    if (host.includes('gmu.ac.in') || host.includes('github.io')) {
      return import.meta.env.VITE_RENDER_API_URL || 'https://ignitron2k26-backend.onrender.com';
    }
  }

  // 4. Same-origin on cloud deployment or Local Dev (Vite proxy)
  return '';
}

export function setCustomBackendUrl(url) {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('ignitron_backend_url');
  } else {
    localStorage.setItem('ignitron_backend_url', url.trim().replace(/\/+$/, ''));
  }
}

export function buildApiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}
