import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['day1', 'day2', 'day3'],
    required: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },
  event: {
    type: String,
    required: true,
    trim: true,
  },
  tagline: {
    type: String,
    default: '',
    trim: true,
  },
  venue: {
    type: String,
    default: '',
    trim: true,
  },
  club: {
    type: String,
    default: '',
    trim: true,
  },
  rulebookLink: {
    type: String,
    default: '',
    trim: true,
  },
  registrationLink: {
    type: String,
    default: '',
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

timelineSchema.index({ day: 1, order: 1 });

export const Timeline = mongoose.model('Timeline', timelineSchema);
