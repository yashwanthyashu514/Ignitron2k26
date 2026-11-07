import express from 'express';
import { Event } from '../models/Event.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 1. GET all events (Public / Authenticated)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ day: 1, name: 1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET event by ID or Name
router.get('/:idOrName', async (req, res) => {
  try {
    const query = req.params.idOrName;
    const event = await Event.findOne({
      $or: [{ id: query }, { name: query }],
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
      time,
      day,
      venue,
      category,
      club,
      description,
      rulebookLink,
      registrationLink,
      maxTeamSize: maxTeamSize || 4,
      scoringCriteria: scoringCriteria && scoringCriteria.length > 0 ? scoringCriteria : undefined,
    });

    await event.save();

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
    const event = await Event.findOne({ id: req.params.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const prevName = event.name;
    const updates = req.body;
    Object.assign(event, updates);
    await event.save();

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
    const event = await Event.findOneAndDelete({ id: req.params.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

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

