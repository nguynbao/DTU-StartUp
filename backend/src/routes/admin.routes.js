const express = require('express');
const { getDashboardStats } = require('../controllers/admin.controller');
const { getLandingContent, updateLandingContent } = require('../controllers/content.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/dashboard', verifyToken, requireRole('staff', 'admin'), getDashboardStats);
router.get('/landing', verifyToken, requireRole('staff', 'admin'), getLandingContent);
router.put('/landing', verifyToken, requireRole('staff', 'admin'), updateLandingContent);

module.exports = router;
