import app, { seedInitialData, connectDB } from '../server/server.js';

let isSeeded = false;

export default async function handler(req, res) {
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
