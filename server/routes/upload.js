import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const ensureCloudinaryConfig = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    return true;
  }
  return false;
};

// Initial config attempt
ensureCloudinaryConfig();

// GET /api/upload/config — Check if Cloudinary is configured
router.get('/config', (req, res) => {
  ensureCloudinaryConfig();
  const configured = isCloudinaryConfigured();
  res.json({
    configured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || (process.env.CLOUDINARY_URL ? 'configured' : null),
    status: configured ? 'Cloudinary ready' : 'Cloudinary credentials pending in .env',
  });
});

// POST /api/upload — Protected SuperAdmin (upload image file to Cloudinary)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { image, folder = 'ignitron2k26' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 string or URL) is required' });
    }

    // If it's already a hosted URL (CDN or static path)
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      return res.json({
        url: image,
        publicId: '',
        cloudinary: false,
      });
    }

    ensureCloudinaryConfig();
    if (!isCloudinaryConfigured()) {
      return res.status(400).json({
        error: 'Cloudinary credentials are not configured in Vercel Environment Variables. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, or provide an image URL.',
        configured: false,
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

