/**
 * CyberVault Evidence Uploader to MongoDB Atlas
 * Usage: node upload_evidence.js <challenge_id> [filepath]
 * Examples:
 *   node upload_evidence.js 0
 *   node upload_evidence.js 1
 *   node upload_evidence.js 1 "c:/path/to/disk_image_IE3132.dd"
 */

require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Challenge = require('./server/models/Challenge');

const defaultFiles = {
  0: 'DealIsDone.jpg',
  1: 'disk_image_IE3132.dd',
  2: 'ghost_runner.html',
  3: 'evidence.jpg',
  4: 'intercept.txt',
  5: 'connection_guide.txt'
};

const challengeId = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 0;
const defaultName = defaultFiles[challengeId] || `evidence_ch${challengeId}.bin`;
const filePath = process.argv[3] || path.join(__dirname, 'server', 'evidence', defaultName);

async function uploadToMongoDB() {
  if (!fs.existsSync(filePath)) {
    console.error(`[Error] File not found at: ${filePath}`);
    console.log(`Please place your file at '${filePath}' or provide the full path as an argument:`);
    console.log(`  node upload_evidence.js ${challengeId} "C:\\path\\to\\${defaultName}"`);
    process.exit(1);
  }

  const fileData = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.txt') contentType = 'text/plain';
  else if (ext === '.dd' || ext === '.img' || ext === '.bin') contentType = 'application/octet-stream';
  else if (ext === '.zip') contentType = 'application/zip';

  const uri = process.env.MONGODB_URI || 'mongodb+srv://it24102481_db_user:QOAQkqAHFBbvQa2J@cybervault.my95erc.mongodb.net/cybervault?retryWrites=true&w=majority&appName=cybervault';

  console.log(`[CyberVault] Connecting to MongoDB Atlas...`);
  await mongoose.connect(uri);

  console.log(`[CyberVault] Uploading ${filename} (${(fileData.length / 1024 / 1024).toFixed(2)} MB / ${fileData.length} bytes) to Challenge ID #${challengeId}...`);

  const updated = await Challenge.findOneAndUpdate(
    { id: challengeId },
    {
      $set: {
        file: filename,
        evidenceFile: {
          data: fileData,
          contentType: contentType,
          filename: filename
        }
      }
    },
    { returnDocument: 'after', upsert: true }
  );

  console.log(`[Success] Evidence file '${filename}' successfully uploaded and stored inside MongoDB Atlas for Challenge #${challengeId} (${updated.title})!`);
  process.exit(0);
}

uploadToMongoDB().catch(err => {
  console.error('[Error] Upload failed:', err.message);
  process.exit(1);
});
