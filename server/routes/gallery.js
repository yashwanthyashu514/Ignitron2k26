import express from 'express';
import { Gallery } from '../models/Gallery.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logAudit } from '../utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// GET /api/gallery — Public
router.get('/', async (req, res) => {
  try {
    let photos = await Gallery.find().sort({ order: 1, createdAt: 1 }).lean();
    if (photos.length === 0) {
      // Auto-seed default 19 photos
      const docs = [];
      for (let i = 1; i <= 19; i++) {
        const num = String(i).padStart(2, '0');
        docs.push({
          src: `/gallery/${num}.jpg`,
          caption: `Ignitron 2K25 Highlights #${i}`,
          year: '2K25',
          isHomeFeatured: true,
          order: i,
        });
      }
      await Gallery.insertMany(docs);
      photos = await Gallery.find().sort({ order: 1, createdAt: 1 }).lean();
    }
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery', details: err.message });
  }
});

// POST /api/gallery — Protected SuperAdmin
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { src, caption, year, isHomeFeatured, cloudinaryPublicId } = req.body;
    if (!src) {
      return res.status(400).json({ error: 'Image source URL is required' });
    }

    const count = await Gallery.countDocuments();
    const photo = await Gallery.create({
      src: src.trim(),
      caption: (caption || 'Ignitron 2K25 Highlights').trim(),
      year: (year || '2K25').trim(),
      isHomeFeatured: Boolean(isHomeFeatured),
      cloudinaryPublicId: (cloudinaryPublicId || '').trim(),
      order: count + 1,
    });

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Add Gallery Photo',
      description: `Added gallery photo "${photo.caption}"`,
      newValue: photo,
    });

    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery photo', details: err.message });
  }
});

// DELETE /api/gallery/:id — Protected SuperAdmin
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Gallery.findByIdAndDelete(id);
    if (!photo) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }

    // If photo was stored in Cloudinary, delete from Cloudinary as well
    if (photo.cloudinaryPublicId && process.env.CLOUDINARY_API_KEY) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
      } catch (cErr) {
        console.warn('[Cloudinary] Failed to delete remote asset:', cErr.message);
      }
    }

    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Delete Gallery Photo',
      description: `Removed gallery photo "${photo.caption}"`,
    });

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery photo', details: err.message });
  }
});

export default router;
