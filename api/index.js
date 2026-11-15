import app, { seedInitialData, connectDB } from '../server/server.js';

let isSeeded = false;

export default async function handler(req, res) {
  // 1. Instant response for CORS preflights from any origin (e.g. gmu.ac.in)
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  // 2. Prevent Vercel Edge caching on dynamic API routes
  if (req.url && req.url.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  try {
    await connectDB();
    if (!isSeeded) {
      await seedInitialData();
      isSeeded = true;
    }
  } catch (err) {
    console.error('[Vercel Serverless] DB Init Error:', err.message);
    if (req.url && req.url.startsWith('/api') && req.url !== '/api/health') {
      return res.status(503).json({
        error: 'Database connection error on serverless function.',
        details: err.message,
        hint: 'Please ensure MONGODB_URI is correctly configured in Vercel project settings and a redeploy has occurred.'
      });
    }
  }

  return app(req, res);
}
