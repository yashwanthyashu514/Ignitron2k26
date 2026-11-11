import express from 'express';
import { Timeline } from '../models/Timeline.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logAudit } from '../utils/logger.js';
import { defaultTimeline } from '../../src/data/initialData.js';

const router = express.Router();

// GET /api/timeline — Public
router.get('/', async (req, res) => {
  try {
    let count = await Timeline.countDocuments();
    if (count === 0) {
      // Auto-seed from defaultTimeline
      const docs = [];
      for (const day of ['day1', 'day2', 'day3']) {
        const events = defaultTimeline[day] || [];
        events.forEach((ev, idx) => {
          docs.push({
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
      if (docs.length > 0) {
        await Timeline.insertMany(docs);
      }
    }

    const items = await Timeline.find().sort({ order: 1, createdAt: 1 }).lean();
    const grouped = { day1: [], day2: [], day3: [] };
    for (const item of items) {
      if (grouped[item.day]) {
        grouped[item.day].push(item);
      }
    }

    res.json({ timeline: grouped, raw: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timeline', details: err.message });
  }
});

// POST /api/timeline — Protected SuperAdmin
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { day, time, event, tagline, venue, club, rulebookLink, registrationLink } = req.body;
    if (!day || !time || !event) {
      return res.status(400).json({ error: 'Day, time, and event title are required' });
    }

    const count = await Timeline.countDocuments({ day });
    const item = await Timeline.create({
      day,
      time: time.trim(),
      event: event.trim(),
      tagline: (tagline || '').trim(),
      venue: (venue || '').trim(),
      club: (club || '').trim(),
      rulebookLink: (rulebookLink || '').trim(),
      registrationLink: (registrationLink || '').trim(),
      order: count,
    });

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Add Timeline Event',
      description: `Added "${item.event}" to ${item.day}`,
      newValue: item,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add timeline event', details: err.message });
  }
});

// PUT /api/timeline/:id — Protected SuperAdmin
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, time, event, tagline, venue, club, rulebookLink, registrationLink, order } = req.body;

    const item = await Timeline.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Timeline item not found' });
    }

    if (day !== undefined) item.day = day;
    if (time !== undefined) item.time = time.trim();
    if (event !== undefined) item.event = event.trim();
    if (tagline !== undefined) item.tagline = tagline.trim();
    if (venue !== undefined) item.venue = venue.trim();
    if (club !== undefined) item.club = club.trim();
    if (rulebookLink !== undefined) item.rulebookLink = rulebookLink.trim();
    if (registrationLink !== undefined) item.registrationLink = registrationLink.trim();
    if (order !== undefined) item.order = Number(order);

    await item.save();

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Edit Timeline Event',
      description: `Updated timeline item "${item.event}"`,
      newValue: item,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timeline event', details: err.message });
  }
});

// DELETE /api/timeline/:id — Protected SuperAdmin
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Timeline.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: 'Timeline item not found' });
    }

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Delete Timeline Event',
      description: `Deleted timeline item "${item.event}"`,
    });

    res.json({ success: true, message: `Deleted "${item.event}"` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete timeline event', details: err.message });
  }
});

export default router;
