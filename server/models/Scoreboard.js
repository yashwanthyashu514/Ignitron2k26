import mongoose from 'mongoose';

const scoreboardSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  eventWins: [{
    eventId: String,
    eventName: String,
    teamName: String,
    points: Number,
    rank: Number,
    approvedAt: { type: Date, default: Date.now },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

