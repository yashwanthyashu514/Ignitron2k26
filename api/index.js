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
  }

  return app(req, res);
}
