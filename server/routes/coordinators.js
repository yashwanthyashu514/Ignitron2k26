import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// All coordinator management routes require Super Admin
router.use(verifyToken, requireSuperAdmin);

// 1. GET all coordinators
router.get('/', async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE coordinator
router.post('/', async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      email,
      mobile,
      assignedEvent,
      department,
      status = 'active',
    } = req.body;

    if (!name || !username || !password || !assignedEvent) {
      return res.status(400).json({ 
        error: 'Coordinator Name, Username/ID, Password, and Assigned Event are required' 
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(409).json({ error: 'Username/ID already exists. Please choose a different one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const coordinator = new User({
      name: name.trim(),
      username: cleanUsername,
      password: hashedPassword,
      email: email ? email.trim() : '',
      mobile: mobile ? mobile.trim() : '',
      assignedEvent: assignedEvent.trim(),
      department: department ? department.trim() : '',
      status: status || 'active',
      role: 'coordinator',
      mustChangePassword: true,
    });

    await coordinator.save();

    // Link coordinator to the event model if matched
    await Event.findOneAndUpdate(
      { name: assignedEvent },
      { coordinatorId: coordinator._id.toString(), coordinatorName: coordinator.name }
    );

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: coordinator.assignedEvent,
      action: 'Create Coordinator',
      description: `Super Admin created coordinator account for ${coordinator.name} (${coordinator.username}) assigned to ${coordinator.assignedEvent}`,
      newValue: { name: coordinator.name, username: coordinator.username, event: coordinator.assignedEvent },
      ipAddress: String(clientIp),
    });

    const safeCoord = coordinator.toObject();
    delete safeCoord.password;
    res.status(201).json(safeCoord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. EDIT coordinator
router.put('/:id', async (req, res) => {
  try {
    const { name, email, mobile, assignedEvent, department, status } = req.body;
    const coordinator = await User.findById(req.params.id);
    if (!coordinator || coordinator.role !== 'coordinator') {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const prevSnapshot = {
      name: coordinator.name,
      assignedEvent: coordinator.assignedEvent,
      status: coordinator.status,
    };

    if (name) coordinator.name = name.trim();
    if (email !== undefined) coordinator.email = email.trim();
    if (mobile !== undefined) coordinator.mobile = mobile.trim();
    if (department !== undefined) coordinator.department = department.trim();
    if (status) coordinator.status = status;
    if (assignedEvent) {
      coordinator.assignedEvent = assignedEvent.trim();
      await Event.findOneAndUpdate(
        { name: coordinator.assignedEvent },
        { coordinatorId: coordinator._id.toString(), coordinatorName: coordinator.name }
      );
    }

    await coordinator.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: coordinator.assignedEvent,
      action: 'Edit Coordinator',
      description: `Super Admin updated details for coordinator ${coordinator.name}`,
      previousValue: prevSnapshot,
      newValue: { name: coordinator.name, assignedEvent: coordinator.assignedEvent, status: coordinator.status },
      ipAddress: String(clientIp),
    });

    const safeCoord = coordinator.toObject();
    delete safeCoord.password;
    res.json(safeCoord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. RESET PASSWORD
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const coordinator = await User.findById(req.params.id);
    if (!coordinator || coordinator.role !== 'coordinator') {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const salt = await bcrypt.genSalt(10);
    coordinator.password = await bcrypt.hash(newPassword, salt);
    coordinator.mustChangePassword = true;
    await coordinator.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: coordinator.assignedEvent,
      action: 'Reset Coordinator Password',
      description: `Super Admin reset password for coordinator ${coordinator.name} (${coordinator.username})`,
      ipAddress: String(clientIp),
    });

    res.json({ success: true, message: `Password reset successfully for ${coordinator.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. TOGGLE STATUS (Active/Inactive)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const coordinator = await User.findById(req.params.id);
    if (!coordinator || coordinator.role !== 'coordinator') {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const prevStatus = coordinator.status;
    coordinator.status = status;
    await coordinator.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: coordinator.assignedEvent,
      action: status === 'active' ? 'Activate Coordinator' : 'Deactivate Coordinator',
      description: `Super Admin set status of coordinator ${coordinator.name} from ${prevStatus} to ${status}`,
      previousValue: { status: prevStatus },
      newValue: { status },
      ipAddress: String(clientIp),
    });

    res.json({ success: true, status: coordinator.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE coordinator
router.delete('/:id', async (req, res) => {
  try {
    const coordinator = await User.findById(req.params.id);
    if (!coordinator || coordinator.role !== 'coordinator') {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const coordName = coordinator.name;
    const coordEvent = coordinator.assignedEvent;
    await User.findByIdAndDelete(req.params.id);

    // Unlink from Event
    await Event.findOneAndUpdate(
      { name: coordEvent },
      { coordinatorId: '', coordinatorName: '' }
    );

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logActivity({
      coordinatorId: req.user._id.toString(),
      coordinatorName: req.user.name,
      assignedEvent: coordEvent,
      action: 'Delete Coordinator',
      description: `Super Admin deleted coordinator account ${coordName} (${coordEvent})`,
      ipAddress: String(clientIp),
    });

    res.json({ success: true, message: `Coordinator ${coordName} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

