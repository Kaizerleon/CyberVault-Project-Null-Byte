const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { initialChallenges } = require('../utils/seedData');
const { isMemoryMode, getMemoryStore } = require('../config/db');

const getTimestamp = () => {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

exports.getUsers = async (req, res) => {
  try {
    if (isMemoryMode()) {
      const store = getMemoryStore();
      const users = store.users.map(u => ({
        id: u._id,
        callsign: u.callsign,
        email: u.email,
        studentId: u.studentId,
        role: u.role,
        score: u.score,
        solved: (u.solvedChallenges || []).length,
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Standard'
      }));
      return res.json({ success: true, count: users.length, users });
    }

    const users = await User.find({}).select('callsign email studentId role score solvedChallenges createdAt').sort({ createdAt: -1 });
    const formatted = users.map(u => ({
      id: u._id,
      callsign: u.callsign,
      email: u.email,
      studentId: u.studentId,
      role: u.role,
      score: u.score,
      solved: (u.solvedChallenges || []).length,
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Standard'
    }));

    return res.json({ success: true, count: formatted.length, users: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    if (isMemoryMode()) {
      const store = getMemoryStore();
      return res.json({
        success: true,
        logs: store.logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.action}`)
      });
    }

    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(50);
    const formatted = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.action}`);
    return res.json({ success: true, logs: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
  }
};

exports.toggleModule = async (req, res) => {
  try {
    const { challengeId, isEnabled } = req.body;
    const cid = parseInt(challengeId, 10);
    if (isNaN(cid)) {
      return res.status(400).json({ success: false, message: 'Invalid challenge ID.' });
    }

    const ch = initialChallenges.find(c => c.id === cid);
    const stageName = ch ? ch.stage : `Module #${cid}`;

    const logMsg = `${stageName} module ${isEnabled ? 'enabled' : 'disabled'} by Administrator.`;

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const target = store.challenges.find(c => c.id === cid);
      if (target) {
        target.isEnabled = Boolean(isEnabled);
      }
      store.logs.unshift({
        userCallsign: req.user.callsign,
        userEmail: req.user.email,
        action: logMsg,
        type: 'ADMIN',
        ipAddress: req.ip,
        timestamp: new Date()
      });
      return res.json({ success: true, message: logMsg, isEnabled });
    }

    await Challenge.updateOne({ id: cid }, { $set: { isEnabled: Boolean(isEnabled) } }, { upsert: true });

    await ActivityLog.create({
      userCallsign: req.user.callsign,
      userEmail: req.user.email,
      action: logMsg,
      type: 'ADMIN',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: logMsg, isEnabled });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle module.' });
  }
};

exports.resetAll = async (req, res) => {
  try {
    const resetMsg = 'Global platform reset executed by Master Administrator.';

    if (isMemoryMode()) {
      const store = getMemoryStore();
      store.users.forEach(u => {
        if (u.role !== 'admin') {
          u.score = 0;
          u.solvedChallenges = [];
          u.hintsRevealed = [];
          u.attemptsCount = 0;
          u.activity = [{ message: 'Profile reset by Admin', time: getTimestamp() }];
        }
      });
      store.submissions = [];
      store.logs.unshift({
        userCallsign: req.user.callsign,
        userEmail: req.user.email,
        action: resetMsg,
        type: 'ADMIN',
        ipAddress: req.ip,
        timestamp: new Date()
      });
      return res.json({ success: true, message: resetMsg });
    }

    await User.updateMany(
      {},
      {
        $set: {
          score: 0,
          solvedChallenges: [],
          hintsRevealed: [],
          attemptsCount: 0,
          activity: [{ message: 'Profile reset by Admin', time: getTimestamp() }]
        }
      }
    );

    await Submission.deleteMany({});

    await ActivityLog.create({
      userCallsign: req.user.callsign,
      userEmail: req.user.email,
      action: resetMsg,
      type: 'ADMIN',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: resetMsg });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to execute reset.', error: error.message });
  }
};
