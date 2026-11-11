import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Scoreboard } from './models/Scoreboard.js';
import { TeamMember } from './models/TeamMember.js';
import { Timeline } from './models/Timeline.js';
import { SiteSettings } from './models/SiteSettings.js';
import { Gallery } from './models/Gallery.js';
import {
  defaultEvents,
  defaultTeamMembers,
  defaultTimeline,
  defaultCountdown,
  defaultBrochureLink,
} from '../src/data/initialData.js';

import authRoutes from './routes/auth.js';
import coordinatorRoutes from './routes/coordinators.js';
import eventRoutes from './routes/events.js';
import teamRoutes from './routes/teams.js';
import submissionRoutes from './routes/submissions.js';
import scoreboardRoutes from './routes/scoreboard.js';
import auditLogRoutes from './routes/auditLogs.js';
import overviewRoutes from './routes/overview.js';
import teamMemberRoutes from './routes/team.js';
import timelineRoutes from './routes/timeline.js';
import settingsRoutes from './routes/settings.js';
import galleryRoutes from './routes/gallery.js';
import uploadRoutes from './routes/upload.js';

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
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/scoreboard', scoreboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/team', teamMemberRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ignitron 2K26 Backend',
    timestamp: new Date(),
    mongoConfigured: !!process.env.MONGODB_URI,
    mongoPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 16) : 'MISSING',
    dbState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting
  });
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
    // 1. Super Admin accounts (quick count check before querying)
    const adminCount = await User.countDocuments({ role: 'superadmin' });
    if (adminCount < 2) {
      const adminAccounts = [
        { username: 'ignitrongmusa2026', rawUsername: 'IgnitronGMUSA2026', pass: 'ignitron2k26' },
        { username: 'ignitron2k26', rawUsername: 'ignitron2k26', pass: 'IgnitronGMUSA2026' },
      ];

      for (const acc of adminAccounts) {
        const existing = await User.findOne({ username: acc.username }).lean();
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
    }

    // 2. All events (fast count check to avoid 29 sequential queries on every cold start)
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const docsToInsert = defaultEvents.map(ev => {
        const isHack = ev.name.toLowerCase().includes('code rush') || String(ev.id) === '4';
        return {
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
          scoringCriteria: getScoringCriteria(ev.name, isHack),
        };
      });
      await Event.insertMany(docsToInsert);
      console.log(`[Seed] Initialized ${docsToInsert.length} events`);
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

    // 4. Initial Team Members in MongoDB
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      const teamDocs = defaultTeamMembers.map((m, idx) => ({
        id: m.id || `member_${idx + 1}`,
        name: m.name,
        role: m.role,
        category: m.category === 'organizer' ? 'organizer' : 'core',
        org: m.org || 'GM University',
        photo: m.photo || '',
        order: idx,
      }));
      await TeamMember.insertMany(teamDocs);
      console.log(`[Seed] Initialized ${teamDocs.length} team members`);
    }

    // 5. Initial Timeline in MongoDB
    const timelineCount = await Timeline.countDocuments();
    if (timelineCount === 0) {
      const timeDocs = [];
      for (const day of ['day1', 'day2', 'day3']) {
        const events = defaultTimeline[day] || [];
        events.forEach((ev, idx) => {
          timeDocs.push({
            day,
            time: ev.time,
            event: ev.event,
            tagline: ev.tagline || '',
            venue: ev.venue || '',
            club: ev.club || '',
            rulebookLink: ev.rulebookLink || '',
            registrationLink: ev.registrationLink || '',
            order: idx,
          });
        });
      }
      if (timeDocs.length > 0) {
        await Timeline.insertMany(timeDocs);
        console.log(`[Seed] Initialized ${timeDocs.length} timeline events`);
      }
    }

    // 6. Global Site Settings
    const settingsCount = await SiteSettings.countDocuments({ key: 'global' });
    if (settingsCount === 0) {
      await SiteSettings.create({
        key: 'global',
        countdown: defaultCountdown || '2026-12-03T09:00:00',
        brochureLink: defaultBrochureLink || 'https://drive.google.com/file/ignitron2k26-brochure',
        accommodationLink: 'https://accomadation.vercel.app/',
        announcements: '',
      });
      console.log('[Seed] Initialized global site settings');
    }

    // 7. Initial Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      const gDocs = [];
      for (let i = 1; i <= 19; i++) {
        const num = String(i).padStart(2, '0');
        gDocs.push({
          src: `/gallery/${num}.jpg`,
          caption: `Ignitron 2K25 Highlights #${i}`,
          year: '2K25',
          isHomeFeatured: true,
          order: i,
        });
      }
      await Gallery.insertMany(gDocs);
      console.log(`[Seed] Initialized ${gDocs.length} gallery items`);
    }

    console.log('[Seed] Database ready ✓');
  } catch (err) {
    console.error('[Seed] Error:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    await seedInitialData();
  } catch (err) {
    console.warn('[MongoDB] Initial connection delayed or offline. Server will start and reconnect on demand:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  IGNITRON 2K26  –  Backend API Server  ║`);
    console.log(`╚════════════════════════════════════════╝`);
    console.log(`  🚀  http://localhost:${PORT}`);
    console.log(`  📊  API Health: http://localhost:${PORT}/api/health\n`);
  });
}

// When running on local dev or Render, start standalone HTTP server.
// On Vercel, the app is imported and executed as a Serverless function.
if (!process.env.VERCEL) {
  startServer();
}

export { seedInitialData, connectDB };
export default app;
