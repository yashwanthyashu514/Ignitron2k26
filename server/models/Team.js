import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  usn:  { type: String, required: true, trim: true, uppercase: true },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  registrationNo: { type: String, required: true, unique: true },
  eventId:   { type: String, required: true, index: true },
  eventName: { type: String, required: true, trim: true },

  teamName:     { type: String, required: true, trim: true },
  leaderName:   { type: String, required: true, trim: true },
  leaderUsn:    { type: String, required: true, trim: true, uppercase: true },
  leaderCollege:{ type: String, required: true, trim: true },
  leaderMobile: { type: String, trim: true, default: '' },

  participants: [participantSchema],

  /* ---- Scoring ---- */
  scoreStatus: {
    type: String,
    enum: ['Not Scored', 'Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Not Scored',
  },
  scores: {
    type: Map,
    of: Number,
    default: {},
  },
  totalScore: { type: Number, default: 0 },
  rank:       { type: Number, default: null },
  remarks:    { type: String, default: '' },
  judgeName:  { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

teamSchema.index({ eventName: 1, totalScore: -1 });
teamSchema.index({ eventId: 1, totalScore: -1 });

export const Team = mongoose.model('Team', teamSchema);
