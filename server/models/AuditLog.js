import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    default: () => `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
  },
  coordinatorId: {
    type: String,
    required: true,
  },
  coordinatorName: {
    type: String,
    required: true,
  },
  assignedEvent: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  teamId: {
    type: String,
    default: '',
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
});

auditLogSchema.index({ coordinatorId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

