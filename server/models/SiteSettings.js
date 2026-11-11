import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global',
  },
  countdown: {
    type: String,
    default: '2026-12-03T09:00:00',
  },
  brochureLink: {
    type: String,
    default: 'https://drive.google.com/file/ignitron2k26-brochure',
  },
  accommodationLink: {
    type: String,
    default: 'https://accomadation.vercel.app/',
  },
  announcements: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

