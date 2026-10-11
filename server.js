require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDB, isMemoryMode, getMemoryStore } = require('./server/config/db');
const { hashFlag } = require('./server/utils/flagValidator');
const { initialChallenges } = require('./server/utils/seedData');

// Import Mongoose Models
const User = require('./server/models/User');
const Challenge = require('./server/models/Challenge');
const ActivityLog = require('./server/models/ActivityLog');

// Import Routes
const authRoutes = require('./server/routes/authRoutes');
const challengeRoutes = require('./server/routes/challengeRoutes');
const scoreboardRoutes = require('./server/routes/scoreboardRoutes');
const userRoutes = require('./server/routes/userRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[CyberVault API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname)));
app.use('/evidence', express.static(path.join(__dirname, 'server', 'evidence')));

// ================= API ROUTE MOUNTS =================
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/scoreboard', scoreboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CyberVault: Project Null Byte',
    module: 'IE3132 - Penetration Testing CTF Lab',
    dbMode: isMemoryMode() ? 'Resilient Embedded Engine' : 'MongoDB Atlas / Connected'
  });
});

// Seed Initial System Data
async function seedDatabase() {
  try {
    if (isMemoryMode()) {
      const store = getMemoryStore();
      if (store.challenges.length === 0) {
        store.challenges = initialChallenges.map(c => ({
          ...c,
          flagHash: hashFlag(c.flag)
        }));
      }
      if (!store.users.some(u => u.email === 'admin@cybervault.com')) {
        store.users.push({
          _id: 'root_admin_id',
          email: 'admin@cybervault.com',
          callsign: 'Master Administrator',
          studentId: 'ADM-ROOT',
          role: 'admin',
          score: 2100,
          solvedChallenges: [0, 1, 2, 3, 4, 5],
          hintsRevealed: [],
          attemptsCount: 6,
          activity: [{ message: 'Master Administrator initialized', time: new Date().toLocaleTimeString() }],
          createdAt: new Date()
        });
      }
      return;
    }

    // Seed / Sync Challenges in MongoDB
    for (const c of initialChallenges) {
      await Challenge.findOneAndUpdate(
        { id: c.id },
        {
          $set: {
            title: c.title,
            domain: c.domain,
            stage: c.stage,
            difficulty: c.difficulty,
            points: c.points,
            file: c.file,
            flag: c.flag,
            flagHash: hashFlag(c.flag),
            allowedAliases: c.allowedAliases,
            tools: c.tools,
            objective: c.objective,
            task: c.task,
            story: c.story,
            hints: c.hints,
            isEnabled: c.isEnabled
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[CyberVault Seed] CTF challenges successfully synced in database.');

    // Seed Master Admin if not present
    const adminExists = await User.findOne({ email: 'admin@cybervault.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@cybervault.com',
        password: 'admin33',
        callsign: 'Master Administrator',
        studentId: 'ADM-ROOT',
        role: 'admin',
        score: 2100,
        solvedChallenges: [0, 1, 2, 3, 4, 5],
        hintsRevealed: []
      });
      console.log('[CyberVault Seed] Master Administrator account created (admin@cybervault.com / admin33).');
    }
  } catch (err) {
    console.error('[CyberVault Seed Error]:', err.message);
  }
}

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `API endpoint '${req.originalUrl}' not found.` });
  }
  next();
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🛡️  CyberVault: Project Null Byte - Backend Online`);
    console.log(`  🔗 Platform URL: http://localhost:${PORT}`);
    console.log(`  📚 Module: IE3132 - Penetration Testing CTF Play Box`);
    console.log(`  🗄️ Database: ${isMemoryMode() ? 'Resilient Embedded Store' : 'MongoDB'}`);
    console.log(`=======================================================`);
  });
};

startServer();

module.exports = app;
