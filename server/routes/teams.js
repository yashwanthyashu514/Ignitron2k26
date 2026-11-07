import express from 'express';
import { Team } from '../models/Team.js';
import { Event } from '../models/Event.js';
import { ScoreSubmission } from '../models/ScoreSubmission.js';
import { verifyToken, requireCoordinator } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();
router.use(verifyToken, requireCoordinator);

// ── Helper: is event locked? ─────────────────────────────────────────────────
async function isEventLocked(eventName) {
  if (!eventName) return false;
  const sub = await ScoreSubmission.findOne({
    eventName: new RegExp(`^${eventName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    status: { $in: ['pending', 'approved'] },
  });
  return !!sub;
}

// ── Resolve event name from multiple identifiers ─────────────────────────────
async function resolveEventName(candidate, assignedEvent) {
  if (!candidate) return assignedEvent || null;
  // If it matches assigned event name exactly (case-insensitive) return it
  if (assignedEvent && candidate.toLowerCase() === assignedEvent.toLowerCase()) return assignedEvent;
  // Try looking up by id or name
  const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ev = await Event.findOne({
    $or: [
      { id: candidate },
      { name: new RegExp(`^${escaped}$`, 'i') },
    ],
  });
  return ev ? ev.name : candidate;
}

// ═══════════════════════════════════════════════════════════════════════
// 1. GET /api/teams  — list teams
// ═══════════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const { event, search } = req.query;
    let filter = {};

    if (req.user.role === 'coordinator') {
      const assigned = req.user.assignedEvent || '';
      const escaped = assigned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.eventName = new RegExp(`^${escaped}$`, 'i');
    } else if (event) {
      const escaped = event.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { eventId: event },
        { eventName: new RegExp(`^${escaped}$`, 'i') },
      ];
    }

    if (search) {
      const re = new RegExp(search.trim(), 'i');
      const searchClause = {
        $or: [
          { teamName: re },
          { leaderName: re },
          { leaderUsn: re },
          { leaderCollege: re },
          { registrationNo: re },
          { 'participants.name': re },
          { 'participants.usn': re },
        ],
      };
      filter = filter.$or
        ? { $and: [{ $or: filter.$or }, searchClause] }
        : { ...filter, ...searchClause };
    }

    const teams = await Team.find(filter).sort({ totalScore: -1, createdAt: 1 }).lean();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 2. GET /api/teams/:id
// ═══════════════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.user.role === 'coordinator' &&
        team.eventName.toLowerCase() !== (req.user.assignedEvent || '').toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 3. POST /api/teams  — register team
// ═══════════════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const {
      eventId, eventName,
      teamName, leaderName, leaderUsn, leaderCollege, leaderMobile,
      participants = [],
    } = req.body;

    // Determine target event name
    let targetName = req.user.role === 'coordinator'
      ? req.user.assignedEvent
      : await resolveEventName(eventName || eventId, null);

    if (!targetName) return res.status(400).json({ error: 'Event is required' });
    if (!teamName || !leaderName || !leaderUsn || !leaderCollege) {
      return res.status(400).json({ error: 'Team name, leader name, leader USN, and college are required' });
    }

    if (await isEventLocked(targetName)) {
      return res.status(400).json({ error: 'Event is locked — scores already submitted or approved' });
    }

    // Duplicate team name check
    const trimName = teamName.trim();
    const escaped = trimName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dupTeam = await Team.findOne({
      eventName: new RegExp(`^${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      teamName:  new RegExp(`^${escaped}$`, 'i'),
    });
    if (dupTeam) return res.status(409).json({ error: `Team "${trimName}" already exists for this event` });

    // Build & validate USN list
    const normusn = leaderUsn.trim().toUpperCase();
    const usns = [normusn];
    const cleanParts = [];
    for (const p of participants) {
      if (p.name?.trim() && p.usn?.trim()) {
        const u = p.usn.trim().toUpperCase();
        if (usns.includes(u)) return res.status(400).json({ error: `Duplicate USN "${u}"` });
        usns.push(u);
        cleanParts.push({ name: p.name.trim(), usn: u });
      }
    }

    // Check USN uniqueness within event
    const dupUsn = await Team.findOne({
      eventName: new RegExp(`^${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      $or: [{ leaderUsn: { $in: usns } }, { 'participants.usn': { $in: usns } }],
    });
    if (dupUsn) return res.status(409).json({ error: `One or more USNs are already registered in team "${dupUsn.teamName}"` });

    // Registration number
    const count = await Team.countDocuments({
      eventName: new RegExp(`^${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    const prefix = targetName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
    const registrationNo = `IGN-${prefix}-${String(count + 1).padStart(3, '0')}`;

    // Resolve eventId
    const evDoc = await Event.findOne({ name: new RegExp(`^${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    const resolvedEventId = evDoc ? evDoc.id : (eventId || targetName);

    const team = await Team.create({
      registrationNo,
      eventId: resolvedEventId,
      eventName: evDoc ? evDoc.name : targetName,
      teamName: trimName,
      leaderName: leaderName.trim(),
      leaderUsn: normusn,
      leaderCollege: leaderCollege.trim(),
      leaderMobile: leaderMobile ? leaderMobile.trim() : '',
      participants: cleanParts,
      scoreStatus: 'Not Scored',
      scores: {},
      totalScore: 0,
    });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: team.eventName,
      action: 'Register Team',
      description: `${req.user.name} registered team "${team.teamName}" (${team.registrationNo}) — Leader: ${team.leaderName} (${team.leaderCollege})`,
      teamId: team._id.toString(),
      newValue: { teamName: team.teamName, leaderCollege: team.leaderCollege, participants: cleanParts.length },
      ipAddress: String(ip),
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 4. PUT /api/teams/:id  — edit team
// ═══════════════════════════════════════════════════════════════════════
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.user.role === 'coordinator' &&
        team.eventName.toLowerCase() !== (req.user.assignedEvent || '').toLowerCase()) {
      return res.status(403).json({ error: 'Not authorized for this event' });
    }
    if (await isEventLocked(team.eventName)) {
      return res.status(400).json({ error: 'Event is locked — cannot edit teams' });
    }

    const { teamName, leaderName, leaderUsn, leaderCollege, leaderMobile, participants = [] } = req.body;
    const prev = { teamName: team.teamName, leaderName: team.leaderName, leaderCollege: team.leaderCollege };

    if (teamName) team.teamName = teamName.trim();
    if (leaderName) team.leaderName = leaderName.trim();
    if (leaderUsn) team.leaderUsn = leaderUsn.trim().toUpperCase();
    if (leaderCollege) team.leaderCollege = leaderCollege.trim();
    if (leaderMobile !== undefined) team.leaderMobile = leaderMobile.trim();
    if (Array.isArray(participants)) {
      team.participants = participants
        .filter(p => p.name && p.usn)
        .map(p => ({ name: p.name.trim(), usn: p.usn.trim().toUpperCase() }));
    }
    await team.save();

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: team.eventName,
      action: 'Edit Team',
      description: `${req.user.name} updated team "${team.teamName}" (${team.registrationNo})`,
      teamId: team._id.toString(),
      previousValue: prev,
      newValue: { teamName: team.teamName, leaderCollege: team.leaderCollege },
      ipAddress: String(ip),
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 5. DELETE /api/teams/:id
// ═══════════════════════════════════════════════════════════════════════
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.user.role === 'coordinator' &&
        team.eventName.toLowerCase() !== (req.user.assignedEvent || '').toLowerCase()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (await isEventLocked(team.eventName)) {
      return res.status(400).json({ error: 'Event is locked — cannot delete teams' });
    }

    const snap = { teamName: team.teamName, registrationNo: team.registrationNo };
    await Team.findByIdAndDelete(req.params.id);

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: team.eventName,
      action: 'Delete Team',
      description: `${req.user.name} removed team "${snap.teamName}" (${snap.registrationNo})`,
      teamId: req.params.id,
      previousValue: snap,
      ipAddress: String(ip),
    });

    res.json({ success: true, message: `Team "${snap.teamName}" removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 6. POST /api/teams/:id/score  — save/update score (draft)
//    For Code Rush (hackathon): accepts { round1, round2 }
//    For all others:            accepts { marks }
// ═══════════════════════════════════════════════════════════════════════
router.post('/:id/score', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.user.role === 'coordinator' &&
        team.eventName.toLowerCase() !== (req.user.assignedEvent || '').toLowerCase()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (await isEventLocked(team.eventName)) {
      return res.status(400).json({ error: 'Scores are locked — already submitted or approved' });
    }

    const { scores = {}, remarks = '', judgeName = '' } = req.body;

    // Load event scoring criteria
    const escaped = team.eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const evDoc = await Event.findOne({
      $or: [
        { id: team.eventId },
        { name: new RegExp(`^${escaped}$`, 'i') },
      ],
    });

    let criteriaList;
    if (evDoc?.scoringCriteria?.length > 0) {
      criteriaList = evDoc.scoringCriteria;
    } else if (team.eventName.toLowerCase().includes('code rush')) {
      criteriaList = [
        { key: 'round1', name: 'Round 1', maxMarks: 50 },
        { key: 'round2', name: 'Round 2', maxMarks: 50 },
      ];
    } else {
      criteriaList = [{ key: 'marks', name: 'Score', maxMarks: 100 }];
    }

    // Validate & compute total
    let total = 0;
    const validated = {};
    for (const crit of criteriaList) {
      const v = Number(scores[crit.key]) || 0;
      if (v < 0) return res.status(400).json({ error: `Score for "${crit.name}" cannot be negative` });
      if (v > crit.maxMarks) return res.status(400).json({ error: `Score for "${crit.name}" exceeds max ${crit.maxMarks}` });
      validated[crit.key] = v;
      total += v;
    }

    const prevSnap = { scores: Object.fromEntries(team.scores || new Map()), totalScore: team.totalScore };

    team.scores = validated;
    team.totalScore = total;
    team.remarks = remarks.trim();
    team.judgeName = judgeName.trim();
    team.scoreStatus = 'Draft';
    await team.save();

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: team.eventName,
      action: 'Save Score',
      description: `${req.user.name} saved score for "${team.teamName}": ${total} pts`,
      teamId: team._id.toString(),
      previousValue: prevSnap,
      newValue: { scores: validated, totalScore: total },
      ipAddress: String(ip),
    });

    res.json({ success: true, message: 'Score saved as draft', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
