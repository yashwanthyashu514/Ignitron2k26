import express from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
import { getCached, setCached, invalidateCache } from '../utils/cache.js';

const router = express.Router();

function buildIdFilter(param) {
  const isObj = mongoose.isValidObjectId(param);
  return {
    $or: [
      { id: param },
      ...(isObj ? [{ _id: param }] : []),
    ],
  };
}

// 1. GET all events (Public / Authenticated)
router.get('/', async (req, res) => {
  try {
    const cached = getCached('events:all');
    if (cached) return res.json(cached);

    const events = await Event.find().sort({ day: 1, name: 1 }).lean();
    setCached('events:all', events, 30000);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET event by ID or Name
router.get('/:idOrName', async (req, res) => {
  try {
    const query = req.params.idOrName;
    const isObj = mongoose.isValidObjectId(query);
    const event = await Event.findOne({
      $or: [
        { id: query },
        { name: query },
        ...(isObj ? [{ _id: query }] : []),
      ],
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREATE event (Super Admin)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      time,
      day,
      venue,
      category,
      club,
      description,
      rulebookLink,
      registrationLink,
      minTeamSize,
      maxTeamSize,
      scoringCriteria,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    const id = Date.now().toString();
    const event = new Event({
      id,
      name: name.trim(),
      time: time ? time.trim() : '',
      day: day || 'Day 1',
      venue: venue ? venue.trim() : '',
      category: category || 'General',
      club: club ? club.trim() : '',
      description: description ? description.trim() : '',
      rulebookLink: rulebookLink ? rulebookLink.trim() : '',
      registrationLink: registrationLink ? registrationLink.trim() : '',
      minTeamSize: Number(minTeamSize) > 0 ? Number(minTeamSize) : 1,
      maxTeamSize: Number(maxTeamSize) > 0 ? Number(maxTeamSize) : 4,
      scoringCriteria: scoringCriteria && scoringCriteria.length > 0 ? scoringCriteria : undefined,
    });

    await event.save();
    invalidateCache('events');

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: event.name,
      action: 'Create Event',
      description: `Super Admin created event "${event.name}"`,
      newValue: { name: event.name, category: event.category, venue: event.venue },
      ipAddress: String(clientIp),
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE event (Super Admin)
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const event = await Event.findOne(buildIdFilter(req.params.id));
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const prevName = event.name;
    const updates = { ...req.body };
    if (updates.minTeamSize !== undefined) updates.minTeamSize = Number(updates.minTeamSize) || 1;
    if (updates.maxTeamSize !== undefined) updates.maxTeamSize = Number(updates.maxTeamSize) || 1;
    if (updates.venue !== undefined) updates.venue = String(updates.venue).trim();
    Object.assign(event, updates);
    await event.save();
    invalidateCache('events');

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: event.name,
      action: 'Update Event',
      description: `Super Admin updated event details for "${prevName}"`,
      newValue: updates,
      ipAddress: String(clientIp),
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE scoring criteria
router.put('/:id/criteria', verifyToken, async (req, res) => {
  try {
    const { scoringCriteria } = req.body;
    if (!Array.isArray(scoringCriteria)) {
      return res.status(400).json({ error: 'scoringCriteria must be an array' });
    }

    const event = await Event.findOne({ id: req.params.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Ensure authorization: Super Admin OR assigned coordinator
    if (req.user.role !== 'superadmin') {
      if (req.user.role !== 'coordinator' || req.user.assignedEvent !== event.name) {
        return res.status(403).json({ error: 'Not authorized to change scoring criteria for this event' });
      }
    }

    const prevCriteria = event.scoringCriteria;
    event.scoringCriteria = scoringCriteria;
    await event.save();
    invalidateCache('events');

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: event.name,
      action: 'Update Scoring Criteria',
      description: `${req.user.name} updated scoring criteria for ${event.name}`,
      previousValue: prevCriteria,
      newValue: scoringCriteria,
      ipAddress: String(clientIp),
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE event (Super Admin)
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete(buildIdFilter(req.params.id));
    if (!event) return res.status(404).json({ error: 'Event not found' });
    invalidateCache('events');

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: event.name,
      action: 'Delete Event',
      description: `Super Admin deleted event "${event.name}"`,
      ipAddress: String(clientIp),
    });

    res.json({ success: true, message: `Event ${event.name} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

