const express = require('express');
const { getLandingContent, updateLandingContent } = require('../controllers/content.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/landing', getLandingContent);
router.put('/landing', verifyToken, requireRole('admin', 'staff'), updateLandingContent);

module.exports = router;
