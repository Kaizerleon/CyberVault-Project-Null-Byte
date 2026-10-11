const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/download', challengeController.downloadEvidence);
router.post('/:id/hint', protect, challengeController.revealHint);
router.post('/:id/submit', protect, challengeController.submitFlag);
router.post('/:id/reset', protect, challengeController.resetChallenge);

module.exports = router;
