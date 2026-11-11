import express from 'express';
import { TeamMember } from '../models/TeamMember.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logAudit } from '../utils/logger.js';
import { defaultTeamMembers } from '../../src/data/initialData.js';

const router = express.Router();

// GET /api/team — Public
router.get('/', async (req, res) => {
  try {
    let members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    if (members.length === 0) {
      // Auto-seed if database collection is empty
      const docs = defaultTeamMembers.map((m, idx) => ({
        id: m.id || `member_${idx + 1}`,
        name: m.name,
        role: m.role,
        category: m.category === 'organizer' ? 'organizer' : 'core',
        org: m.org || 'GM University',
        photo: m.photo || '',
        order: idx,
      }));
      await TeamMember.insertMany(docs);
      members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    }
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team members', details: err.message });
  }
});

// POST /api/team — Protected SuperAdmin
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, role, category, org, photo, cloudinaryPublicId } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const memberId = req.body.id || `member_${Date.now()}`;
    const count = await TeamMember.countDocuments();

    const member = await TeamMember.create({
      id: memberId,
      name: name.trim(),
      role: role.trim(),
      category: category === 'organizer' ? 'organizer' : 'core',
      org: (org || 'GM University').trim(),
      photo: (photo || '').trim(),
      cloudinaryPublicId: (cloudinaryPublicId || '').trim(),
      order: count,
    });

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Add Team Member',
      description: `Added "${member.name}" as ${member.role} (${member.category})`,
      newValue: member,
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add team member', details: err.message });
  }
});

// PUT /api/team/:id — Protected SuperAdmin
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, category, org, photo, cloudinaryPublicId, order } = req.body;

    const member = await TeamMember.findOne({ id });
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (name !== undefined) member.name = name.trim();
    if (role !== undefined) member.role = role.trim();
    if (category !== undefined) member.category = category === 'organizer' ? 'organizer' : 'core';
    if (org !== undefined) member.org = org.trim();
    if (photo !== undefined) member.photo = photo.trim();
    if (cloudinaryPublicId !== undefined) member.cloudinaryPublicId = cloudinaryPublicId.trim();
    if (order !== undefined) member.order = Number(order);

    await member.save();

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Edit Team Member',
      description: `Updated team member "${member.name}" (${member.id})`,
      newValue: member,
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update team member', details: err.message });
  }
});

// DELETE /api/team/:id — Protected SuperAdmin
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.findOneAndDelete({ id });
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Delete Team Member',
      description: `Removed team member "${member.name}" (${member.id})`,
    });

    res.json({ success: true, message: `Removed "${member.name}"` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete team member', details: err.message });
  }
});

export default router;
