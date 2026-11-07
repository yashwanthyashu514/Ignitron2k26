import express from 'express';
import { ScoreSubmission } from '../models/ScoreSubmission.js';
import { Team } from '../models/Team.js';
import { Scoreboard } from '../models/Scoreboard.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();
router.use(verifyToken);

// ═══════════════════════════════════════════════════════════════════════
// 1. GET /api/submissions
// ═══════════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'coordinator') {
      const escaped = (req.user.assignedEvent || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.eventName = new RegExp(`^${escaped}$`, 'i');
    }
    const subs = await ScoreSubmission.find(filter).sort({ submittedAt: -1 }).lean();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 2. GET /api/submissions/:id
// ═══════════════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const sub = await ScoreSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (req.user.role === 'coordinator' && sub.eventName !== req.user.assignedEvent) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 3. POST /api/submissions/submit  — coordinator submits final results
// ═══════════════════════════════════════════════════════════════════════
router.post('/submit', async (req, res) => {
  try {
    const targetEvent = req.user.role === 'coordinator'
      ? req.user.assignedEvent
      : req.body.eventName;
    if (!targetEvent) return res.status(400).json({ error: 'Event name required' });

    const escapedEvent = targetEvent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Check existing submission
    const existing = await ScoreSubmission.findOne({
      eventName: new RegExp(`^${escapedEvent}$`, 'i'),
    });
    if (existing?.status === 'pending') {
      return res.status(400).json({ error: 'Results already submitted and awaiting admin approval' });
    }
    if (existing?.status === 'approved') {
      return res.status(400).json({ error: 'Results already approved and published' });
    }

    // Fetch all teams for this event
    const teams = await Team.find({
      eventName: new RegExp(`^${escapedEvent}$`, 'i'),
    }).sort({ totalScore: -1 });

    if (teams.length === 0) {
      return res.status(400).json({ error: 'No teams registered for this event' });
    }

    // Check all teams are scored
    const unscored = teams.filter(t => t.scoreStatus === 'Not Scored' || (t.totalScore === 0 && t.scoreStatus !== 'Draft'));
    if (unscored.length > 0) {
      return res.status(400).json({
        error: `${unscored.length} team(s) not yet scored: ${unscored.map(t => `"${t.teamName}"`).join(', ')}`,
        missingTeams: unscored.map(t => ({ id: t._id, name: t.teamName })),
      });
    }

    // Rank teams
    let rank = 1;
    const finalScores = [];
    for (let i = 0; i < teams.length; i++) {
      if (i > 0 && teams[i].totalScore < teams[i - 1].totalScore) rank = i + 1;
      teams[i].rank = rank;
      teams[i].scoreStatus = 'Submitted';
      await teams[i].save();

      finalScores.push({
        teamId:        teams[i]._id.toString(),
        registrationNo:teams[i].registrationNo,
        teamName:      teams[i].teamName,
        leaderName:    teams[i].leaderName,
        leaderCollege: teams[i].leaderCollege,
        leaderUsn:     teams[i].leaderUsn,
        participants:  teams[i].participants,
        scores:        Object.fromEntries(teams[i].scores || new Map()),
        totalScore:    teams[i].totalScore,
        rank,
        remarks:       teams[i].remarks,
      });
    }

    // Create / update submission record
    let sub = existing;
    if (!sub) {
      sub = new ScoreSubmission({
        eventId:         teams[0]?.eventId || targetEvent,
        eventName:       teams[0]?.eventName || targetEvent,
        coordinatorId:   req.user._id.toString(),
        coordinatorName: req.user.name,
        teamsCount:      teams.length,
        status:          'pending',
        submittedAt:     new Date(),
        finalScores,
      });
    } else {
      Object.assign(sub, {
        coordinatorId:   req.user._id.toString(),
        coordinatorName: req.user.name,
        teamsCount:      teams.length,
        status:          'pending',
        submittedAt:     new Date(),
        finalScores,
        rejectionRemarks: '',
      });
    }
    await sub.save();

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId:   req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent:   targetEvent,
      action:          'Submit Final Results',
      description:     `${req.user.name} submitted final results for "${targetEvent}" (${teams.length} teams)`,
      newValue:        { eventName: targetEvent, teams: teams.length, topTeam: finalScores[0]?.teamName },
      ipAddress:       String(ip),
    });

    res.json({ success: true, message: 'Results submitted — awaiting Super Admin approval', submission: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 4. POST /api/submissions/:id/approve  — Super Admin approves
// ═══════════════════════════════════════════════════════════════════════
router.post('/:id/approve', requireSuperAdmin, async (req, res) => {
  try {
    const sub = await ScoreSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (sub.status === 'approved') return res.status(400).json({ error: 'Already approved' });

    sub.status    = 'approved';
    sub.approvedBy = req.user.name;
    sub.approvedAt = new Date();
    await sub.save();

    // Lock teams
    const escapedEvent = sub.eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await Team.updateMany(
      { eventName: new RegExp(`^${escapedEvent}$`, 'i') },
      { $set: { scoreStatus: 'Approved' } },
    );

    // ── Update public scoreboard with exact evaluated marks ───────────
    for (const entry of sub.finalScores) {
      const college = (entry.leaderCollege || '').trim();
      if (!college) continue;
      // Award the exact evaluation marks scored by the team
      const pts = Number(entry.totalScore) || 0;

      const escapedCollege = college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let rec = await Scoreboard.findOne({
        collegeName: new RegExp(`^${escapedCollege}$`, 'i'),
      });

      const winEntry = {
        eventId:    sub.eventId,
        eventName:  sub.eventName,
        teamName:   entry.teamName,
        points:     pts,
        rank:       entry.rank,
        approvedAt: new Date(),
      };

      if (!rec) {
        await Scoreboard.create({ collegeName: college, score: pts, eventWins: [winEntry] });
      } else {
        const alreadyAwarded = rec.eventWins.some(
          w => w.eventName === sub.eventName && w.teamName === entry.teamName,
        );
        if (!alreadyAwarded) {
          rec.score += pts;
          rec.eventWins.push(winEntry);
          rec.updatedAt = new Date();
          await rec.save();
        }
      }
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId:   req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent:   sub.eventName,
      action:          'Approve Results',
      description:     `Super Admin ${req.user.name} approved results for "${sub.eventName}" — scoreboard updated`,
      ipAddress:       String(ip),
    });

    res.json({ success: true, message: `Results for "${sub.eventName}" approved. Scoreboard updated.`, submission: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 5. POST /api/submissions/:id/reject
// ═══════════════════════════════════════════════════════════════════════
router.post('/:id/reject', requireSuperAdmin, async (req, res) => {
  try {
    const { remarks = '' } = req.body;
    const sub = await ScoreSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    sub.status           = 'rejected';
    sub.rejectionRemarks = remarks.trim() || 'Rejected by Super Admin';
    await sub.save();

    const escapedEvent = sub.eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await Team.updateMany(
      { eventName: new RegExp(`^${escapedEvent}$`, 'i') },
      { $set: { scoreStatus: 'Draft' } },
    );

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId:   req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent:   sub.eventName,
      action:          'Reject Results',
      description:     `Super Admin rejected results for "${sub.eventName}": ${sub.rejectionRemarks}`,
      ipAddress:       String(ip),
    });

    res.json({ success: true, message: 'Results rejected. Coordinator can re-submit after corrections.', submission: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 6. POST /api/submissions/:id/reopen  — reopen for edits
// ═══════════════════════════════════════════════════════════════════════
router.post('/:id/reopen', requireSuperAdmin, async (req, res) => {
  try {
    const sub = await ScoreSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    // Reverse scoreboard points if previously approved
    if (sub.status === 'approved') {
      for (const entry of sub.finalScores) {
        const college = (entry.leaderCollege || '').trim();
        if (!college) continue;
        const escapedCollege = college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rec = await Scoreboard.findOne({ collegeName: new RegExp(`^${escapedCollege}$`, 'i') });
        if (rec) {
          const wins = rec.eventWins.filter(
            w => w.eventName === sub.eventName && w.teamName === entry.teamName,
          );
          const deduct = wins.reduce((s, w) => s + (w.points || 0), 0);
          rec.score = Math.max(0, rec.score - deduct);
          rec.eventWins = rec.eventWins.filter(
            w => !(w.eventName === sub.eventName && w.teamName === entry.teamName),
          );
          rec.updatedAt = new Date();
          await rec.save();
        }
      }
    }

    sub.status           = 'correction_requested';
    sub.rejectionRemarks = 'Reopened by Super Admin for modifications';
    await sub.save();

    const escapedEvent = sub.eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await Team.updateMany(
      { eventName: new RegExp(`^${escapedEvent}$`, 'i') },
      { $set: { scoreStatus: 'Draft' } },
    );

    res.json({ success: true, message: 'Submission reopened. Coordinator can now modify scores.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
