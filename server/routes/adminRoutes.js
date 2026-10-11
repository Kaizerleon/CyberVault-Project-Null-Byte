const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getLogs);
router.post('/modules/toggle', adminController.toggleModule);
router.post('/reset-all', adminController.resetAll);

module.exports = router;
