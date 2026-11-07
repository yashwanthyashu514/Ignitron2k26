import express from 'express';
import { Scoreboard } from '../models/Scoreboard.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// 1. GET public scoreboard (Only approved results)
router.get('/', async (req, res) => {
  try {
    const list = await Scoreboard.find().sort({ score: -1, collegeName: 1 }).lean();
    // Transform to include id for frontend compatibility
    const formatted = list.map(item => ({
      id: item._id.toString(),
      collegeName: item.collegeName,
      score: item.score,
      eventWins: item.eventWins || [],
      updatedAt: item.updatedAt,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('[Scoreboard API] Error reading scoreboard:', err.message);
    // Return empty array instead of 500 so frontend never crashes
    res.json([]);
  }
});

// 2. ADD or UPDATE college score manually (Super Admin)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { collegeName, score } = req.body;
    if (!collegeName) {
      return res.status(400).json({ error: 'College name is required' });
    }

    const trimmedCollege = collegeName.trim();
    let entry = await Scoreboard.findOne({
      collegeName: { $regex: new RegExp(`^${trimmedCollege}$`, 'i') },
    });

    const parsedScore = Number(score) || 0;
    if (entry) {
      entry.score = parsedScore;
      entry.updatedAt = new Date();
      await entry.save();
    } else {
      entry = new Scoreboard({
        collegeName: trimmedCollege,
        score: parsedScore,
      });
      await entry.save();
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: 'Scoreboard',
      action: 'Update Scoreboard',
      description: `Super Admin manually updated score for "${trimmedCollege}" to ${parsedScore} pts`,
      newValue: { collegeName: trimmedCollege, score: parsedScore },
      ipAddress: String(clientIp),
    });

    res.json({
      id: entry._id.toString(),
      collegeName: entry.collegeName,
      score: entry.score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE entry (Super Admin)
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const entry = await Scoreboard.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: 'Scoreboard',
      action: 'Delete Scoreboard Entry',
      description: `Super Admin removed "${entry.collegeName}" from scoreboard`,
      ipAddress: String(clientIp),
    });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

