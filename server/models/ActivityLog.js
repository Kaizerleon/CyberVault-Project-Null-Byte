const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userCallsign: {
    type: String,
    default: 'System'
  },
  userEmail: {
    type: String,
    default: 'system@cybervault.com'
  },
  action: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['AUTH', 'SUBMISSION', 'HINT', 'ADMIN', 'SYSTEM'],
    default: 'SYSTEM'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
