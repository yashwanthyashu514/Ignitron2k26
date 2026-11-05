import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'ignitron_2k26_gmusa_jwt_super_secret_key_production';

// ── Verify JWT ───────────────────────────────────────────────────────────────
export async function verifyToken(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found or session expired' });

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account deactivated — contact Super Admin' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Require Super Admin role ─────────────────────────────────────────────────
export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Super Admin privilege required' });
  }
  next();
}

// ── Require Coordinator (or Super Admin) ─────────────────────────────────────
// Checks that if an event is specified in the request, the coordinator is
// authorized for that event (by name or numeric id).
export async function requireCoordinator(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  // Super Admin bypasses coordinator restriction
  if (req.user.role === 'superadmin') return next();

  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Coordinator privilege required' });
  }

  const assigned = (req.user.assignedEvent || '').trim();
  if (!assigned) return res.status(403).json({ error: 'No event assigned to this coordinator account' });

  // Gather the event identifier from request (body, query, params)
  const body   = req.body   || {};
  const query  = req.query  || {};
  const params = req.params || {};

  const candidate = (
    body.eventName  || body.eventId  ||
    query.eventName || query.eventId || query.event ||
    params.eventId  || ''
  ).trim();

  // If no event identifier in request → allow (route handler will scope to assignedEvent)
  if (!candidate) return next();

  // 1. Direct case-insensitive match against assigned event name
  if (candidate.toLowerCase() === assigned.toLowerCase()) return next();

  // 2. Resolve via Event model (handles numeric IDs)
  try {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const ev = await Event.findOne({
      $or: [
        { id: candidate },
        { name: new RegExp(`^${escaped}$`, 'i') },
      ],
    });
    if (ev && ev.name.toLowerCase() === assigned.toLowerCase()) return next();
  } catch {
    // ignore lookup error
  }

  return res.status(403).json({
    error: `Access denied: You are only authorised to manage "${assigned}"`,
  });
}
