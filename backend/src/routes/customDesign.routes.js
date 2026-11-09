const express = require('express');
const {
  calculatePrice,
  saveCustomDesign,
  getCustomDesign,
} = require('../controllers/customDesign.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/calculate-price', calculatePrice);
router.post('/', optionalAuth, saveCustomDesign);
router.get('/:idOrShareCode', getCustomDesign);

module.exports = router;
