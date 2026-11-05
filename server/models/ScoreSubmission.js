import mongoose from 'mongoose';

const scoreSubmissionSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  coordinatorId: {
    type: String,
    required: true,
  },
  coordinatorName: {
    type: String,
    required: true,
  },
  teamsCount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'correction_requested'],
    default: 'pending',
    index: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  rejectionRemarks: {
    type: String,
    default: '',
  },
  approvedBy: {
    type: String,
    default: '',
  },
  approvedAt: {
    type: Date,
  },
  finalScores: [{
    teamId: String,
    registrationNo: String,
    teamName: String,
    leaderName: String,
    leaderCollege: String,
    leaderUsn: String,
    participants: Array,
    scores: Object,
    totalScore: Number,
    rank: Number,
    remarks: String,
  }],
});

export const ScoreSubmission = mongoose.model('ScoreSubmission', scoreSubmissionSchema);

