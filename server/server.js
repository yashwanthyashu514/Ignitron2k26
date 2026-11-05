import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Scoreboard } from './models/Scoreboard.js';
import { defaultEvents } from '../src/data/initialData.js';

import authRoutes from './routes/auth.js';
import coordinatorRoutes from './routes/coordinators.js';
import eventRoutes from './routes/events.js';
import teamRoutes from './routes/teams.js';
import submissionRoutes from './routes/submissions.js';
import scoreboardRoutes from './routes/scoreboard.js';
import auditLogRoutes from './routes/auditLogs.js';
import overviewRoutes from './routes/overview.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/scoreboard', scoreboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/overview', overviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Ignitron 2K26 Backend', timestamp: new Date() });
});

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// ── Scoring criteria helper ───────────────────────────────────────────────────
function getScoringCriteria(eventName, isHackathon) {
  if (isHackathon || (eventName && eventName.toLowerCase().includes('code rush'))) {
    return [
      { key: 'round1', name: 'Round 1', maxMarks: 50 },
      { key: 'round2', name: 'Round 2', maxMarks: 50 },
    ];
  }
  return [{ key: 'marks', name: 'Score', maxMarks: 100 }];
}

// ── Seed Initial Data ─────────────────────────────────────────────────────────
async function seedInitialData() {
  try {
    // 1. Super Admin accounts
    const adminAccounts = [
      { username: 'ignitrongmusa2026', rawUsername: 'IgnitronGMUSA2026', pass: 'ignitron2k26' },
      { username: 'ignitron2k26', rawUsername: 'ignitron2k26', pass: 'IgnitronGMUSA2026' },
    ];

    for (const acc of adminAccounts) {
      const existing = await User.findOne({ username: acc.username });
      if (!existing) {
        const hashed = await bcrypt.hash(acc.pass, 10);
        await User.create({
          username: acc.username,
          password: hashed,
          name: 'Super Administrator',
          role: 'superadmin',
          email: 'admin@ignitron2k26.com',
          mobile: '+91 9999999999',
          department: 'Event Operations & Management',
          status: 'active',
          mustChangePassword: false,
        });
        console.log(`[Seed] Super Admin created: ${acc.username}`);
      }
    }

    // 2. All events (29 events)
    for (const ev of defaultEvents) {
      const isHack = ev.name.toLowerCase().includes('code rush') || String(ev.id) === '4';
      const criteria = getScoringCriteria(ev.name, isHack);

      const existing = await Event.findOne({
        $or: [{ id: String(ev.id) }, { name: ev.name }],
      });
      if (!existing) {
        await Event.create({
          id: String(ev.id),
          name: ev.name,
          time: ev.time || '',
          day: ev.day || 'Day 1',
          venue: ev.venue || '',
          category: ev.category || 'General',
          club: ev.club || '',
          description: ev.description || '',
          rulebookLink: ev.rulebookLink || '',
          registrationLink: ev.registrationLink || '',
          maxTeamSize: ev.maxTeamSize || 4,
          isHackathon: isHack,
          scoringCriteria: criteria,
        });
      } else {
        // Ensure criteria and isHackathon are updated
        existing.isHackathon = isHack;
        existing.scoringCriteria = criteria;
        await existing.save();
      }
    }

    // 3. Default scoreboard colleges (empty scores — real scores come from event results)
    const count = await Scoreboard.countDocuments();
    if (count === 0) {
      await Scoreboard.insertMany([
        { collegeName: 'GM University',    score: 0 },
        { collegeName: 'IIT Bombay',       score: 0 },
        { collegeName: 'NIT Trichy',       score: 0 },
        { collegeName: 'BITS Pilani',      score: 0 },
        { collegeName: 'VIT Vellore',      score: 0 },
        { collegeName: 'SRM University',   score: 0 },
        { collegeName: 'Manipal Institute',score: 0 },
      ]);
      console.log('[Seed] Default scoreboard initialized');
    }

    console.log('[Seed] Database ready ✓');
  } catch (err) {
    console.error('[Seed] Error:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  IGNITRON 2K26  –  Backend API Server  ║`);
    console.log(`╚════════════════════════════════════════╝`);
    console.log(`  🚀  http://localhost:${PORT}`);
    console.log(`  📊  API Health: http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
