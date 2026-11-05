import express from 'express';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { ScoreSubmission } from '../models/ScoreSubmission.js';
import { AuditLog } from '../models/AuditLog.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalEvents,
      totalCoordinators,
      totalTeams,
      pendingSubmissions,
      approvedResults,
      rejectedResults,
      recentLogs,
      submissions,
      teams,
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: 'coordinator' }),
      Team.countDocuments(),
      ScoreSubmission.countDocuments({ status: 'pending' }),
      ScoreSubmission.countDocuments({ status: 'approved' }),
      ScoreSubmission.countDocuments({ status: { $in: ['rejected', 'correction_requested'] } }),
      AuditLog.find().sort({ timestamp: -1 }).limit(10),
      ScoreSubmission.find().sort({ submittedAt: -1 }),
      Team.find().select('eventName scoreStatus totalScore'),
    ]);

    // Compute event-wise breakdown
    const eventStatsMap = {};
    for (const t of teams) {
      if (!eventStatsMap[t.eventName]) {
        eventStatsMap[t.eventName] = { name: t.eventName, totalTeams: 0, scoredTeams: 0, avgScore: 0, sumScore: 0 };
      }
      eventStatsMap[t.eventName].totalTeams += 1;
      if (t.scoreStatus !== 'Not Scored' && t.totalScore > 0) {
        eventStatsMap[t.eventName].scoredTeams += 1;
        eventStatsMap[t.eventName].sumScore += t.totalScore;
      }
    }

    const eventPerformance = Object.values(eventStatsMap).map(e => ({
      name: e.name,
      totalTeams: e.totalTeams,
      scoredTeams: e.scoredTeams,
      avgScore: e.scoredTeams > 0 ? Math.round(e.sumScore / e.scoredTeams) : 0,
    }));

    res.json({
      totalEvents,
      totalCoordinators,
      totalTeams,
      pendingSubmissions,
      approvedResults,
      rejectedResults,
      eventPerformance,
      recentLogs,
      recentSubmissions: submissions.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

