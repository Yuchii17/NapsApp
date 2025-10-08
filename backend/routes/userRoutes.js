const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadProof, placeOrder } = require('../controllers/userController');

router.get('/products', userController.getProducts);
router.get('/image/:filename', userController.getProductImage);

router.get('/tables', userController.getTables);
router.get('/uploads/:filename', userController.getTableImage);

// 🛒 Cart routes
router.post('/cart', userController.addToCart);
router.get('/cart', userController.getCart);
router.post('/cart/update', userController.updateCartItem);
router.post('/cart/remove', userController.removeCartItem); // ✅ FIXED

router.post('/placeOrder', uploadProof, placeOrder);

module.exports = router;