const crypto = require('crypto');

function hashFlag(flag) {
  return crypto.createHash('sha256').update(flag.trim()).digest('hex');
}

function validateFlag(submittedFlag, expectedFlag, allowedAliasesOrHashes = []) {
  if (!submittedFlag || typeof submittedFlag !== 'string') return false;
  
  const cleanSubmitted = submittedFlag.trim();
  const submittedHash = hashFlag(cleanSubmitted);

  // Direct comparison with expected flag
  if (expectedFlag && (cleanSubmitted === expectedFlag.trim() || cleanSubmitted.toLowerCase() === expectedFlag.trim().toLowerCase())) {
    return true;
  }

  // Hash comparison
  if (expectedFlag && submittedHash === hashFlag(expectedFlag.trim())) return true;

  // Multi-alias match (plaintext or hash)
  if (Array.isArray(allowedAliasesOrHashes)) {
    if (allowedAliasesOrHashes.some(a => typeof a === 'string' && a.trim().toLowerCase() === cleanSubmitted.toLowerCase())) {
      return true;
    }
    if (allowedAliasesOrHashes.includes(submittedHash)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  hashFlag,
  validateFlag
};
