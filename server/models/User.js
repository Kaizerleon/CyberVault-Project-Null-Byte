const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  callsign: {
    type: String,
    required: [true, 'Callsign is required'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  studentId: {
    type: String,
    default: function() {
      return 'IT2410' + Math.floor(1000 + Math.random() * 9000);
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  score: {
    type: Number,
    default: 0
  },
  solvedChallenges: {
    type: [Number],
    default: []
  },
  hintsRevealed: {
    type: [String],
    default: []
  },
  attemptsCount: {
    type: Number,
    default: 0
  },
  currentChallengeIndex: {
    type: Number,
    default: 0
  },
  disabledModules: {
    type: [Number],
    default: []
  },
  activity: [{
    message: String,
    time: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
