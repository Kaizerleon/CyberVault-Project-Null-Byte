const User = require('../models/User');
const { sampleLeaderboard } = require('../utils/seedData');
const { isMemoryMode, getMemoryStore } = require('../config/db');

exports.getScoreboard = async (req, res) => {
  try {
    let rows = [];

    if (isMemoryMode()) {
      const store = getMemoryStore();
      const realUsers = store.users.map(u => ({
        name: u.callsign,
        solved: (u.solvedChallenges || []).length,
        score: u.score || 0,
        time: (u.activity && u.activity[0]) ? u.activity[0].time : 'Active',
        role: u.role
      }));

      rows = [...sampleLeaderboard, ...realUsers];
    } else {
      const dbUsers = await User.find({}).select('callsign score solvedChallenges activity role');
      const realUsers = dbUsers.map(u => ({
        name: u.callsign,
        solved: (u.solvedChallenges || []).length,
        score: u.score || 0,
        time: (u.activity && u.activity[0]) ? u.activity[0].time : 'Active',
        role: u.role
      }));

      rows = [...sampleLeaderboard, ...realUsers];
    }

    // Deduplicate by name, taking highest score
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.name) || map.get(r.name).score < r.score) {
        map.set(r.name, r);
      }
    }

    const uniqueRows = Array.from(map.values());
    uniqueRows.sort((a, b) => b.score - a.score);

    const ranked = uniqueRows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      solved: r.solved,
      score: r.score,
      time: r.time,
      role: r.role || 'user'
    }));

    return res.json({ success: true, data: ranked });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve scoreboard.', error: error.message });
  }
};
