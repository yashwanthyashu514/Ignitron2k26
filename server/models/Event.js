import mongoose from 'mongoose';

const criteriaSchema = new mongoose.Schema({
  key:      { type: String, required: true },
  name:     { type: String, required: true },
  maxMarks: { type: Number, required: true, default: 100 },
}, { _id: false });

// Default scoring: a single "marks" field (100 pts max)
// Code Rush : Hackathon gets round1 + round2
const defaultSingleCriteria = [
  { key: 'marks', name: 'Score', maxMarks: 100 },
];

const eventSchema = new mongoose.Schema({
  id:   { type: String, unique: true, required: true },
  name: { type: String, required: true, unique: true, trim: true },
  time:             { type: String, default: '' },
  day:              { type: String, default: 'Day 1' },
  venue:            { type: String, default: '' },
  category:         { type: String, default: 'General' },
  club:             { type: String, default: '' },
  description:      { type: String, default: '' },
  rulebookLink:     { type: String, default: '' },
  registrationLink: { type: String, default: '' },
  maxTeamSize:      { type: Number, default: 4 },
  // isHackathon: Code Rush events get 2 rounds; all others get single mark
  isHackathon: { type: Boolean, default: false },
  scoringCriteria: {
    type: [criteriaSchema],
    default: defaultSingleCriteria,
  },
  coordinatorId:   { type: String, default: '' },
  coordinatorName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model('Event', eventSchema);
