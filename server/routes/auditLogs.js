import express from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// 1. GET Coordinator's own activity history (Coordinator)
router.get('/my-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find({ coordinatorId: req.user._id.toString() })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET all audit logs with search, filter, pagination (Super Admin Only)
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const {
      search,
      coordinator,
      event,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (coordinator) {
      query.coordinatorName = new RegExp(coordinator.trim(), 'i');
    }

    if (event && event !== 'all') {
      query.assignedEvent = event.trim();
    }

    if (action && action !== 'all') {
      query.action = action.trim();
    }

    if (search) {
      const s = new RegExp(search.trim(), 'i');
      query.$or = [
        { logId: s },
        { coordinatorName: s },
        { assignedEvent: s },
        { action: s },
        { description: s },
      ];
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query),
    ]);

    // Unique actions list for filter dropdown
    const availableActions = await AuditLog.distinct('action');

    res.json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      availableActions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. EXPORT TO CSV (Super Admin Only)
router.get('/export/csv', requireSuperAdmin, async (req, res) => {
  try {
    const { event, action, coordinator } = req.query;
    const query = {};
    if (event && event !== 'all') query.assignedEvent = event.trim();
    if (action && action !== 'all') query.action = action.trim();
    if (coordinator) query.coordinatorName = new RegExp(coordinator.trim(), 'i');

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(1000);

    const headers = ['Log ID', 'Timestamp', 'Coordinator Name', 'Assigned Event', 'Action', 'Description', 'IP Address'];
    const rows = logs.map(l => [
      `"${l.logId || ''}"`,
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${(l.coordinatorName || '').replace(/"/g, '""')}"`,
      `"${(l.assignedEvent || '').replace(/"/g, '""')}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Ignitron_AuditLogs_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

