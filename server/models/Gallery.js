import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
    trim: true,
  },
  caption: {
    type: String,
    default: 'Ignitron 2K25 Highlights',
    trim: true,
  },
  year: {
    type: String,
    default: '2K25',
    trim: true,
  },
  isHomeFeatured: {
    type: Boolean,
    default: false,
  },
  cloudinaryPublicId: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

gallerySchema.index({ year: 1, order: 1 });

export const Gallery = mongoose.model('Gallery', gallerySchema);
