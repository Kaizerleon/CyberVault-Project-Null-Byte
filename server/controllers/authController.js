const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { isMemoryMode, getMemoryStore } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, callsign: user.callsign },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const getTimestamp = () => {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const logAction = async (callsign, email, action, type = 'AUTH', ip = '127.0.0.1') => {
  try {
    if (isMemoryMode()) {
      const store = getMemoryStore();
      store.logs.unshift({
        userCallsign: callsign,
        userEmail: email,
        action,
        type,
        ipAddress: ip,
        timestamp: new Date()
      });
      if (store.logs.length > 50) store.logs.pop();
    } else {
      await ActivityLog.create({
        userCallsign: callsign,
        userEmail: email,
        action,
        type,
        ipAddress: ip
      });
    }
  } catch (err) {
    console.error('Log error:', err.message);
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, callsign, studentId } = req.body;

    if (!email || !password || !callsign) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, and callsign.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCallsign = callsign.trim();

    if (isMemoryMode()) {
      const store = getMemoryStore();
      if (store.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }
      if (store.users.some(u => u.callsign.toLowerCase() === cleanCallsign.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'This operator callsign is already taken.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        email: normalizedEmail,
        password: hashedPassword,
        callsign: cleanCallsign,
        studentId: (studentId && studentId.trim()) || 'IT2410' + Math.floor(1000 + Math.random() * 9000),
        role: 'user',
        score: 0,
        solvedChallenges: [],
        hintsRevealed: [],
        attemptsCount: 0,
        currentChallengeIndex: 0,
        disabledModules: [],
        activity: [{ message: `Registered new operator profile`, time: getTimestamp() }],
        createdAt: new Date()
      };

      store.users.push(newUser);
      await logAction(newUser.callsign, newUser.email, `New operator registered: ${newUser.callsign}`, 'AUTH', req.ip);

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          callsign: newUser.callsign,
          studentId: newUser.studentId,
          role: newUser.role,
          score: newUser.score,
          solved: newUser.solvedChallenges,
          revealed: newUser.hintsRevealed,
          attempts: newUser.attemptsCount,
          activity: newUser.activity
        }
      });
    }

    // Mongoose Mode
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { callsign: cleanCallsign }]
    });

    if (userExists) {
      if (userExists.email === normalizedEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }
      return res.status(400).json({ success: false, message: 'This operator callsign is already taken.' });
    }

    const newUser = await User.create({
      email: normalizedEmail,
      password: password,
      callsign: cleanCallsign,
      studentId: (studentId && studentId.trim()) || 'IT2410' + Math.floor(1000 + Math.random() * 9000),
      role: 'user',
      activity: [{ message: `Registered new operator profile`, time: getTimestamp() }]
    });

    await logAction(newUser.callsign, newUser.email, `New operator registered: ${newUser.callsign}`, 'AUTH', req.ip);

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        callsign: newUser.callsign,
        studentId: newUser.studentId,
        role: newUser.role,
        score: newUser.score,
        solved: newUser.solvedChallenges,
        revealed: newUser.hintsRevealed,
        attempts: newUser.attemptsCount,
        activity: newUser.activity
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Built-in Root Admin bypass/check
    if (normalizedEmail === 'admin@cybervault.com' && cleanPassword === 'admin33') {
      const adminObj = {
        _id: 'root_admin_id',
        email: 'admin@cybervault.com',
        callsign: 'Master Administrator',
        studentId: 'ADM-ROOT',
        role: 'admin',
        score: 2100,
        solvedChallenges: [0, 1, 2, 3, 4, 5],
        hintsRevealed: [],
        attemptsCount: 6,
        activity: [{ message: `Authenticated session: Master Administrator (ADMIN)`, time: getTimestamp() }]
      };
      await logAction(adminObj.callsign, adminObj.email, `Master Admin authenticated`, 'AUTH', req.ip);
      const token = generateToken(adminObj);
      return res.json({
        success: true,
        token,
        user: {
          id: adminObj._id,
          email: adminObj.email,
          callsign: adminObj.callsign,
          studentId: adminObj.studentId,
          role: adminObj.role,
          score: adminObj.score,
          solved: adminObj.solvedChallenges,
          revealed: adminObj.hintsRevealed,
          attempts: adminObj.attemptsCount,
          activity: adminObj.activity
        }
      });
    }

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(cleanPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const loginMsg = `Authenticated session: ${user.callsign} (${user.role.toUpperCase()})`;
      user.activity.unshift({ message: loginMsg, time: getTimestamp() });
      if (user.activity.length > 20) user.activity.pop();
      await logAction(user.callsign, user.email, loginMsg, 'AUTH', req.ip);

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          callsign: user.callsign,
          studentId: user.studentId,
          role: user.role,
          score: user.score,
          solved: user.solvedChallenges,
          revealed: user.hintsRevealed,
          attempts: user.attemptsCount,
          activity: user.activity
        }
      });
    }

    // Mongoose Mode
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const loginMsg = `Authenticated session: ${user.callsign} (${user.role.toUpperCase()})`;
    user.activity.unshift({ message: loginMsg, time: getTimestamp() });
    if (user.activity.length > 20) user.activity.pop();
    await user.save();

    await logAction(user.callsign, user.email, loginMsg, 'AUTH', req.ip);

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        callsign: user.callsign,
        studentId: user.studentId,
        role: user.role,
        score: user.score,
        solved: user.solvedChallenges,
        revealed: user.hintsRevealed,
        attempts: user.attemptsCount,
        activity: user.activity
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        email: user.email,
        callsign: user.callsign,
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
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

exports.logout = async (req, res) => {
  if (req.user) {
    await logAction(req.user.callsign, req.user.email, `User logged out`, 'AUTH', req.ip);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
};
