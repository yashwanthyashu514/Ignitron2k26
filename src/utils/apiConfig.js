// Centralized API Configuration for Ignitron 2K26
// Ensures accurate routing whether hosted on GMU domain, Vercel, or Localhost.

export function getApiBaseUrl() {
  // 1. Explicit Vite environment variable takes highest priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 2. Browser runtime domain auto-detection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // If the frontend is running on GM University official site or GitHub Pages,
    // route API calls to the centralized Vercel backend
    if (host.includes('gmu.ac.in') || host.includes('github.io')) {
      return 'https://ignitron2k26.vercel.app';
    }
  }

  // 3. Same-origin on Vercel deployment or Local Dev (Vite proxy)
  return '';
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
