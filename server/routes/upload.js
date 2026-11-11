import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// GET /api/upload/config — Check if Cloudinary is configured
router.get('/config', (req, res) => {
  const configured = isCloudinaryConfigured();
  res.json({
    configured,
    cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME : null,
    status: configured ? 'Cloudinary ready' : 'Cloudinary credentials pending in .env',
  });
});

// POST /api/upload — Protected SuperAdmin (upload image file or base64 data)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { image, folder = 'ignitron2k26' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 string or URL) is required' });
    }

    if (!isCloudinaryConfigured()) {
      // If Cloudinary keys haven't been added yet, fallback to direct data URL
      return res.json({
        url: image,
        publicId: '',
        cloudinary: false,
        warning: 'Cloudinary not configured yet in .env — using inline data URL.',
      });
    }

    // Upload to Cloudinary with automatic optimization
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { max_width: 1600, crop: 'limit' },
      ],
    });

    res.json({
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      format: uploadRes.format,
      width: uploadRes.width,
      height: uploadRes.height,
      cloudinary: true,
    });
  } catch (err) {
    console.error('[Cloudinary Upload Error]', err);
    res.status(500).json({ error: 'Image upload failed', details: err.message });
  }
});

export default router;

