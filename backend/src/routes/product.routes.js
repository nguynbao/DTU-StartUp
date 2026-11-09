const express = require('express');
const {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlugOrId);
router.post('/', verifyToken, requireRole('admin'), createProduct);
router.put('/:id', verifyToken, requireRole('admin'), updateProduct);
router.delete('/:id', verifyToken, requireRole('admin'), deleteProduct);

module.exports = router;
