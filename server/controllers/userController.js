const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { isMemoryMode, getMemoryStore } = require('../config/db');

const getTimestamp = () => {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        callsign: user.callsign,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        score: user.score || 0,
        solved: user.solvedChallenges || [],
        revealed: user.hintsRevealed || [],
        attempts: user.attemptsCount || 0,
        activity: user.activity || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { callsign } = req.body;
    if (!callsign || !callsign.trim()) {
      return res.status(400).json({ success: false, message: 'Callsign cannot be empty.' });
    }

    const cleanCallsign = callsign.trim();
    const user = req.user;

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const existing = store.users.find(u => u.callsign.toLowerCase() === cleanCallsign.toLowerCase() && u.email !== user.email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'This callsign is already in use.' });
      }

      const u = store.users.find(x => x.email === user.email);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.' });

      u.callsign = cleanCallsign;
      const actMsg = `Callsign updated to ${cleanCallsign}`;
      u.activity.unshift({ message: actMsg, time: getTimestamp() });
      if (u.activity.length > 20) u.activity.pop();

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        callsign: u.callsign,
        activity: u.activity
      });
    }

    // Mongoose Mode
    const existing = await User.findOne({ callsign: cleanCallsign, email: { $ne: user.email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This callsign is already in use.' });
    }

    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return res.status(404).json({ success: false, message: 'User not found.' });

    dbUser.callsign = cleanCallsign;
    const actMsg = `Callsign updated to ${cleanCallsign}`;
    dbUser.activity.unshift({ message: actMsg, time: getTimestamp() });
    if (dbUser.activity.length > 20) dbUser.activity.pop();
    await dbUser.save();

    await ActivityLog.create({
      userCallsign: cleanCallsign,
      userEmail: dbUser.email,
      action: actMsg,
      type: 'AUTH',
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      callsign: dbUser.callsign,
      activity: dbUser.activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
};
