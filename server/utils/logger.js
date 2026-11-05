import { AuditLog } from '../models/AuditLog.js';

export async function logActivity({
  coordinatorId = 'system',
  coordinatorName = 'System',
  assignedEvent = '',
  action,
  description,
  teamId = '',
  previousValue = null,
  newValue = null,
  ipAddress = '127.0.0.1',
}) {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const log = new AuditLog({
      logId,
      coordinatorId,
      coordinatorName,
      assignedEvent,
      action,
      description,
      teamId,
      previousValue,
      newValue,
      timestamp: new Date(),
      ipAddress,
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
}

