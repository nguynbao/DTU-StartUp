const express = require('express');
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/material.controller');
const { optionalAuth, verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getMaterials);
router.post('/', optionalAuth, createMaterial);
router.put('/:id', optionalAuth, updateMaterial);
router.delete('/:id', optionalAuth, deleteMaterial);

module.exports = router;
