import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['organizer', 'core'],
    default: 'core',
    trim: true,
  },
  org: {
    type: String,
    default: 'GM University',
    trim: true,
  },
  photo: {
    type: String,
    default: '',
    trim: true,
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

teamMemberSchema.index({ category: 1, order: 1 });

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

