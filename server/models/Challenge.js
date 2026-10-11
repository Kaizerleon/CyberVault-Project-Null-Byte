const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  stage: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard', 'Expert'],
    default: 'Easy'
  },
  points: {
    type: Number,
    required: true,
    default: 100
  },
  file: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true,
    select: false // Do not return plaintext flag in standard queries
  },
  flagHash: {
    type: String,
    required: true,
    select: false // Hash for secure validation
  },
  tools: {
    type: String,
    default: ""
  },
  objective: {
    type: String,
    default: ""
  },
  task: {
    type: String,
    default: ""
  },
  story: {
    type: String,
    default: ""
  },
  hints: {
    type: [String],
    default: []
  },
  evidenceFile: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Challenge', challengeSchema);
