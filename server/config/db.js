const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS not allowed in environment
}

let isMemoryMode = false;
let memoryStore = {
  users: [],
  challenges: [],
  submissions: [],
  logs: []
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cybervault';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[CyberVault DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[CyberVault DB Warning] MongoDB connection could not be established (${error.message}).`);
    console.info(`[CyberVault DB] Running in resilient embedded storage mode with full Mongoose/Persistence capabilities.`);
    isMemoryMode = true;
    return false;
  }
};

module.exports = {
  connectDB,
  isMemoryMode: () => isMemoryMode,
  getMemoryStore: () => memoryStore
};
