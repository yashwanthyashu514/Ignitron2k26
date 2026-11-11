import express from 'express';
import { SiteSettings } from '../models/SiteSettings.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logAudit } from '../utils/logger.js';
import { defaultCountdown, defaultBrochureLink } from '../../src/data/initialData.js';

const router = express.Router();

// GET /api/settings — Public
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'global' }).lean();
    if (!settings) {
      settings = await SiteSettings.create({
        key: 'global',
        countdown: defaultCountdown || '2026-12-03T09:00:00',
        brochureLink: defaultBrochureLink || 'https://drive.google.com/file/ignitron2k26-brochure',
        accommodationLink: 'https://accomadation.vercel.app/',
        announcements: '',
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

// PUT /api/settings — Protected SuperAdmin
router.put('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { countdown, brochureLink, accommodationLink, announcements } = req.body;
    let settings = await SiteSettings.findOne({ key: 'global' });
    if (!settings) {
      settings = new SiteSettings({ key: 'global' });
    }

    if (countdown !== undefined) settings.countdown = countdown.trim();
    if (brochureLink !== undefined) settings.brochureLink = brochureLink.trim();
    if (accommodationLink !== undefined) settings.accommodationLink = accommodationLink.trim();
    if (announcements !== undefined) settings.announcements = announcements.trim();

    await settings.save();

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Update Site Settings',
      description: `Updated global site settings (countdown/brochure/accommodation)`,
      newValue: settings,
    });

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

export default router;
