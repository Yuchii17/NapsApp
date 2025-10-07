const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/products', userController.getProducts);
router.get('/image/:filename', userController.getProductImage);
router.get('/tables', userController.getTables);
router.get('/uploads/:filename', userController.getTableImage);

module.exports = router;
