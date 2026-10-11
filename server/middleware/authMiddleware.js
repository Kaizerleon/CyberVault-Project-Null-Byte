const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMemoryMode, getMemoryStore } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cybervault_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.email === 'admin@cybervault.com' && decoded.role === 'admin') {
      req.user = {
        _id: 'root_admin_id',
        id: 'root_admin_id',
        email: 'admin@cybervault.com',
        callsign: 'Master Administrator',
        studentId: 'ADM-ROOT',
        role: 'admin',
        score: 0,
        solvedChallenges: [],
        hintsRevealed: [],
        attemptsCount: 0,
        activity: []
      };
      return next();
    }
    
    if (isMemoryMode()) {
      const store = getMemoryStore();
      const user = store.users.find(u => u._id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session no longer valid.' });
      }
      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session no longer valid.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Master Administrator privileges required.' });
  }
};

module.exports = {
  protect,
  adminOnly,
  JWT_SECRET
};
