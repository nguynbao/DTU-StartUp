const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/security.middleware');

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
