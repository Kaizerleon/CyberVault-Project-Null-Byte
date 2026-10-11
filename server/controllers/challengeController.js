const path = require('path');
const fs = require('fs');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Submission = require('../models/Submission');
const ActivityLog = require('../models/ActivityLog');
const { validateFlag } = require('../utils/flagValidator');
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

const sanitizeChallenge = (c) => ({
  id: c.id,
  stage: c.stage,
  title: c.title,
  domain: c.domain,
  difficulty: c.difficulty,
  points: c.points,
  file: c.file,
  tools: c.tools,
  objective: c.objective,
  task: c.task,
  story: c.story,
  hints: c.hints,
  isEnabled: c.isEnabled !== undefined ? c.isEnabled : true
});

exports.getChallenges = async (req, res) => {
  try {
    if (isMemoryMode()) {
      const store = getMemoryStore();
      const list = store.challenges.length > 0 ? store.challenges : initialChallenges;
      return res.json({ success: true, data: list.map(sanitizeChallenge) });
    }

    let challenges = await Challenge.find({}).sort({ id: 1 });
    if (!challenges || challenges.length === 0) {
      challenges = initialChallenges;
    }
    return res.json({ success: true, data: challenges.map(sanitizeChallenge) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve challenges.', error: error.message });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid challenge ID.' });
    }

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const list = store.challenges.length > 0 ? store.challenges : initialChallenges;
      const ch = list.find(c => c.id === id);
      if (!ch) return res.status(404).json({ success: false, message: 'Challenge not found.' });
      return res.json({ success: true, data: sanitizeChallenge(ch) });
    }

    const ch = await Challenge.findOne({ id });
    if (!ch) {
      const fallback = initialChallenges.find(c => c.id === id);
      if (fallback) return res.json({ success: true, data: sanitizeChallenge(fallback) });
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }
    return res.json({ success: true, data: sanitizeChallenge(ch) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve challenge details.' });
  }
};

exports.revealHint = async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10);
    const { hintIndex } = req.body;
    const user = req.user;

    if (isNaN(challengeId) || hintIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Missing challenge ID or hint index.' });
    }

    const hintKey = `${challengeId}-${hintIndex}`;

    // Update user state
    if (isMemoryMode()) {
      const store = getMemoryStore();
      const u = store.users.find(x => x.email === user.email);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.' });

      if (!u.hintsRevealed.includes(hintKey)) {
        u.hintsRevealed.push(hintKey);
        u.score = Math.max(0, u.score - 20);
        const logMsg = `Hint ${hintIndex + 1} revealed for Challenge #${challengeId + 1}`;
        u.activity.unshift({ message: logMsg, time: getTimestamp() });
        if (u.activity.length > 20) u.activity.pop();
        
        store.logs.unshift({
          userCallsign: u.callsign,
          userEmail: u.email,
          action: logMsg,
          type: 'HINT',
          ipAddress: req.ip,
          timestamp: new Date()
        });
      }

      return res.json({
        success: true,
        score: u.score,
        revealed: u.hintsRevealed,
        activity: u.activity
      });
    }

    // Mongoose Mode
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!dbUser.hintsRevealed.includes(hintKey)) {
      dbUser.hintsRevealed.push(hintKey);
      dbUser.score = Math.max(0, dbUser.score - 20);
      const logMsg = `Hint ${hintIndex + 1} revealed for Challenge #${challengeId + 1}`;
      dbUser.activity.unshift({ message: logMsg, time: getTimestamp() });
      if (dbUser.activity.length > 20) dbUser.activity.pop();
      await dbUser.save();

      await ActivityLog.create({
        userCallsign: dbUser.callsign,
        userEmail: dbUser.email,
        action: logMsg,
        type: 'HINT',
        ipAddress: req.ip
      });
    }

    return res.json({
      success: true,
      score: dbUser.score,
      revealed: dbUser.hintsRevealed,
      activity: dbUser.activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error revealing hint.', error: error.message });
  }
};

exports.submitFlag = async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10);
    const { flag } = req.body;
    const user = req.user;

    if (isNaN(challengeId) || !flag) {
      return res.status(400).json({ success: false, message: 'Challenge ID and flag are required.' });
    }

    let ch = initialChallenges.find(c => c.id === challengeId);
    let allowedAliases = ch ? (ch.allowedAliases || []) : [];
    let expectedFlag = ch ? ch.flag : null;

    if (!isMemoryMode()) {
      try {
        const dbCh = await Challenge.findOne({ id: challengeId });
        if (dbCh) {
          if (dbCh.flag) expectedFlag = dbCh.flag;
          if (Array.isArray(dbCh.allowedAliases)) {
            allowedAliases = Array.from(new Set([...allowedAliases, ...dbCh.allowedAliases]));
          }
        }
      } catch (e) {}
    }

    if (!ch && !expectedFlag) {
      return res.status(404).json({ success: false, message: 'Invalid challenge stage.' });
    }

    const isValid = validateFlag(flag, expectedFlag, allowedAliases);

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const u = store.users.find(x => x.email === user.email);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.' });

      u.attemptsCount = (u.attemptsCount || 0) + 1;

      // Record Submission
      store.submissions.push({
        userEmail: u.email,
        userCallsign: u.callsign,
        challengeId,
        challengeStage: ch.stage,
        submittedFlag: flag.trim(),
        isCorrect: isValid,
        pointsAwarded: isValid && !u.solvedChallenges.includes(challengeId) ? ch.points : 0,
        timestamp: new Date()
      });

      if (isValid) {
        let pointsAwarded = 0;
        if (!u.solvedChallenges.includes(challengeId)) {
          u.solvedChallenges.push(challengeId);
          const hintPrefix = `${challengeId}-`;
          const revealedCount = u.hintsRevealed.filter(k => k.startsWith(hintPrefix)).length;
          pointsAwarded = Math.max(0, ch.points - (revealedCount * 20));
          u.score += pointsAwarded;

          const solveMsg = `Accepted flag · ${ch.title} (+${pointsAwarded} pts)`;
          u.activity.unshift({ message: solveMsg, time: getTimestamp() });
          if (u.activity.length > 20) u.activity.pop();

          store.logs.unshift({
            userCallsign: u.callsign,
            userEmail: u.email,
            action: solveMsg,
            type: 'SUBMISSION',
            ipAddress: req.ip,
            timestamp: new Date()
          });
        }

        return res.json({
          success: true,
          isCorrect: true,
          message: 'Flag accepted!',
          pointsAwarded,
          score: u.score,
          solved: u.solvedChallenges,
          activity: u.activity
        });
      } else {
        const failMsg = `Rejected flag attempt · ${ch.title}`;
        u.activity.unshift({ message: failMsg, time: getTimestamp() });
        if (u.activity.length > 20) u.activity.pop();

        return res.status(400).json({
          success: false,
          isCorrect: false,
          message: 'Flag not accepted. Check evidence format IE3132{...}',
          attempts: u.attemptsCount,
          activity: u.activity
        });
      }
    }

    // Mongoose Mode
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return res.status(404).json({ success: false, message: 'User not found.' });

    dbUser.attemptsCount = (dbUser.attemptsCount || 0) + 1;

    let pointsAwarded = 0;
    if (isValid) {
      if (!dbUser.solvedChallenges.includes(challengeId)) {
        dbUser.solvedChallenges.push(challengeId);
        const hintPrefix = `${challengeId}-`;
        const revealedCount = dbUser.hintsRevealed.filter(k => k.startsWith(hintPrefix)).length;
        pointsAwarded = Math.max(0, ch.points - (revealedCount * 20));
        dbUser.score += pointsAwarded;

        const solveMsg = `Accepted flag · ${ch.title} (+${pointsAwarded} pts)`;
        dbUser.activity.unshift({ message: solveMsg, time: getTimestamp() });
        if (dbUser.activity.length > 20) dbUser.activity.pop();

        await ActivityLog.create({
          userCallsign: dbUser.callsign,
          userEmail: dbUser.email,
          action: solveMsg,
          type: 'SUBMISSION',
          ipAddress: req.ip
        });
      }
    } else {
      const failMsg = `Rejected flag attempt · ${ch.title}`;
      dbUser.activity.unshift({ message: failMsg, time: getTimestamp() });
      if (dbUser.activity.length > 20) dbUser.activity.pop();
    }

    await dbUser.save();

    await Submission.create({
      userId: dbUser._id,
      userEmail: dbUser.email,
      userCallsign: dbUser.callsign,
      challengeId,
      challengeStage: ch.stage,
      submittedFlag: flag.trim(),
      isCorrect: isValid,
      pointsAwarded: isValid ? pointsAwarded : 0
    });

    if (isValid) {
      return res.json({
        success: true,
        isCorrect: true,
        message: 'Flag accepted!',
        pointsAwarded,
        score: dbUser.score,
        solved: dbUser.solvedChallenges,
        activity: dbUser.activity
      });
    } else {
      return res.status(400).json({
        success: false,
        isCorrect: false,
        message: 'Flag not accepted. Check evidence format IE3132{...}',
        attempts: dbUser.attemptsCount,
        activity: dbUser.activity
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during flag submission.', error: error.message });
  }
};

exports.resetChallenge = async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10);
    const user = req.user;

    const ch = initialChallenges.find(c => c.id === challengeId);
    const title = ch ? ch.title : `Challenge #${challengeId + 1}`;

    const updateReset = (u) => {
      for (let idx = challengeId; idx < initialChallenges.length; idx++) {
        if (u.solvedChallenges.includes(idx)) {
          u.solvedChallenges = u.solvedChallenges.filter(x => x !== idx);
          u.score = Math.max(0, u.score - initialChallenges[idx].points);
        }
        const hintPrefix = `${idx}-`;
        const hintsForIdx = u.hintsRevealed.filter(k => k.startsWith(hintPrefix));
        u.hintsRevealed = u.hintsRevealed.filter(k => !k.startsWith(hintPrefix));
        u.score += hintsForIdx.length * 20;
      }
      const resetMsg = `${title} and subsequent progress reset.`;
      u.activity.unshift({ message: resetMsg, time: getTimestamp() });
      if (u.activity.length > 20) u.activity.pop();
      return resetMsg;
    };

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const u = store.users.find(x => x.email === user.email);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
      const resetMsg = updateReset(u);
      store.logs.unshift({
        userCallsign: u.callsign,
        userEmail: u.email,
        action: resetMsg,
        type: 'SYSTEM',
        ipAddress: req.ip,
        timestamp: new Date()
      });
      return res.json({
        success: true,
        message: resetMsg,
        score: u.score,
        solved: u.solvedChallenges,
        revealed: u.hintsRevealed,
        activity: u.activity
      });
    }

    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return res.status(404).json({ success: false, message: 'User not found.' });
    const resetMsg = updateReset(dbUser);
    await dbUser.save();

    await ActivityLog.create({
      userCallsign: dbUser.callsign,
      userEmail: dbUser.email,
      action: resetMsg,
      type: 'SYSTEM',
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: resetMsg,
      score: dbUser.score,
      solved: dbUser.solvedChallenges,
      revealed: dbUser.hintsRevealed,
      activity: dbUser.activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error resetting challenge.', error: error.message });
  }
};

exports.downloadEvidence = async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10);
    const ch = initialChallenges.find(c => c.id === challengeId);
    if (!ch) return res.status(404).send('Challenge evidence not found.');

    const filename = ch.file;
    const isImage = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') || filename.toLowerCase().endsWith('.png');
    const contentType = isImage ? 'image/jpeg' : 'text/plain; charset=utf-8';

    // 1. Check if binary is stored in MongoDB Atlas
    try {
      const dbChallenge = await Challenge.findOne({ id: challengeId }).select('evidenceFile');
      if (dbChallenge && dbChallenge.evidenceFile && dbChallenge.evidenceFile.data) {
        res.setHeader('Content-Disposition', `attachment; filename="${dbChallenge.evidenceFile.filename || filename}"`);
        res.setHeader('Content-Type', dbChallenge.evidenceFile.contentType || contentType);
        return res.send(dbChallenge.evidenceFile.data);
      }
    } catch (dbErr) {
      console.warn('MongoDB evidence fetch notice:', dbErr.message);
    }

    // 2. Fallback to local server evidence disk file
    const evidencePath = path.join(__dirname, '..', 'evidence', filename);
    if (fs.existsSync(evidencePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      return res.sendFile(evidencePath);
    }

    // 3. Dynamic educational artifact fallback
    const content = `CYBERVAULT · PROJECT NULL BYTE
DEMONSTRATION EVIDENCE — SAFE AUDIT ARTIFACT
Incident: Tech Vanguard Breach Investigation
Module: ${ch.stage} / ${ch.title}
Target Tools: ${ch.tools}
Flag: ${ch.flag}
`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.error('Evidence download error:', error);
    res.status(500).send('Error downloading evidence artifact.');
  }
};
