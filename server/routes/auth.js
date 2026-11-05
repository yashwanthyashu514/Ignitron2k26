import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanPassword = password.trim();
    const phoneCleanPassword = cleanPassword.replace(/\s+/g, '');

    // Support all Super Admin credential combinations requested by GMUSA:
    // Username: IgnitronGMUSA2026 OR ignitron2k26
    // Password: ignitron2k26 OR IgnitronGMUSA2026
    const isAdminUser = cleanUsername === 'ignitrongmusa2026' || cleanUsername === 'ignitron2k26';
    const isAdminPass = cleanPassword === 'ignitron2k26' || 
                        cleanPassword === 'IgnitronGMUSA2026' || 
                        cleanPassword.toLowerCase() === 'ignitrongmusa2026';
    const isMasterAdmin = isAdminUser && isAdminPass;

    let user = await User.findOne({ username: cleanUsername });

    // Space-tolerant & case-insensitive fallback lookup for coordinators
    if (!user) {
      const escaped = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
      user = await User.findOne({ username: new RegExp(`^${escaped}$`, 'i') });
    }

    if (!user && isMasterAdmin) {
      // Find existing superadmin or create one
      user = await User.findOne({ role: 'superadmin' });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(cleanPassword, salt);
        user = new User({
          username: cleanUsername,
          password: hashedPassword,
          name: 'Super Administrator',
          role: 'superadmin',
          status: 'active',
          mustChangePassword: false,
        });
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    let isMatch = false;
    if (isMasterAdmin && (user.role === 'superadmin' || isAdminUser)) {
      isMatch = true;
    } else {
      isMatch = (await bcrypt.compare(cleanPassword, user.password)) ||
                (await bcrypt.compare(phoneCleanPassword, user.password));
      // Fallback check if superadmin
      if (!isMatch && user.role === 'superadmin' && isAdminPass) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is deactivated. Please contact Super Admin.' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        assignedEvent: user.assignedEvent,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await logActivity({
      coordinatorId: user._id.toString(),
      coordinatorName: user.name,
      assignedEvent: user.assignedEvent || 'All Events',
      action: user.role === 'superadmin' ? 'Super Admin Login' : 'Coordinator Login',
      description: `${user.role === 'superadmin' ? 'Super Admin' : 'Coordinator'} ${user.name} logged in successfully`,
      ipAddress: String(clientIp),
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        assignedEvent: user.assignedEvent,
        department: user.department,
        email: user.email,
        mobile: user.mobile,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

router.post('/logout', verifyToken, async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: req.user.assignedEvent || 'All Events',
      action: req.user.role === 'superadmin' ? 'Super Admin Logout' : 'Coordinator Logout',
      description: `${req.user.name} logged out`,
      ipAddress: String(clientIp),
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: user._id.toString(),
      coordinatorName: user.name,
      assignedEvent: user.assignedEvent || 'All Events',
      action: 'Password Change',
      description: `User ${user.name} changed their password`,
      ipAddress: String(clientIp),
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

