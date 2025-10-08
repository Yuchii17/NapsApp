const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Product = require('../models/Product');
const Table = require('../models/Table');
const Cart = require('../models/Cart');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/payments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
exports.uploadProof = multer({ storage }).single('proofOfPayment');

let gfs;
const conn = mongoose.connection;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' });
    const host = `${req.protocol}://${req.get('host')}`;

    const productsWithImageUrls = products.map(product => ({
      ...product.toObject(),
      image: product.image ? `${host}/uploads/${product.image}` : null
    }));

    res.status(200).json({ products: productsWithImageUrls });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

exports.getProductImage = (req, res) => {
  const filename = req.params.filename;

  if (!gfs) {
    return res.status(503).json({ message: 'File system not ready' });
  }

  gfs.files.findOne({ filename }, (err, file) => {
    if (err) {
      console.error('Error finding image:', err);
      return res.status(500).json({ message: 'Error finding image' });
    }

    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (file.contentType.startsWith('image/')) {
      const readstream = gfs.createReadStream(file.filename);
      res.set('Content-Type', file.contentType);
      readstream.pipe(res);
    } else {
      res.status(400).json({ message: 'File is not an image' });
    }
  });
};

exports.getTables = async (req, res) => {
  try {
    const query = req.query.q ? { name: { $regex: req.query.q, $options: 'i' } } : {};

    const tables = await Table.find(query); 
    const host = `${req.protocol}://${req.get('host')}`;

    const tablesWithImageUrls = tables.map(table => ({
      ...table.toObject(),
      image: table.image ? `${host}/uploads/${table.image}` : null
    }));

    res.status(200).json({ tables: tablesWithImageUrls });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Server error while fetching tables' });
  }
};

// ✅ Fetch a specific table image
exports.getTableImage = (req, res) => {
  const filename = req.params.filename;

  if (!gfs) {
    return res.status(503).json({ message: 'File system not ready' });
  }

  gfs.files.findOne({ filename }, (err, file) => {
    if (err) {
      console.error('Error finding image:', err);
      return res.status(500).json({ message: 'Error finding image' });
    }

    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (file.contentType.startsWith('image/')) {
      const readstream = gfs.createReadStream(file.filename);
      res.set('Content-Type', file.contentType);
      readstream.pipe(res);
    } else {
      res.status(400).json({ message: 'File is not an image' });
    }
  });
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user ? req.user._id : req.body.userId; // handle logged-in or manual userId

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Find or create a cart for this user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      // Check if product already exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    return res.status(200).json({
      message: 'Item added to cart successfully',
      cart,
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
};

// 🧾 Get all items in user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ cart: [], message: 'Cart is empty' });
    }

    const formattedCart = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    res.status(200).json({ cart: formattedCart });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId, action } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (action === 'increase') item.quantity += 1;
    else if (action === 'decrease' && item.quantity > 1) item.quantity -= 1;

    await cart.save();
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(200).json({ cart: updatedCart });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ message: 'User ID and Product ID required' });

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId._id.toString() !== productId);
    await cart.save();

    res.status(200).json({ cart });
  } catch (err) {
    console.error('Error removing item:', err);
    res.status(500).json({ message: 'Server error while removing item' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, total, payment } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required.' });

    // ✅ Fetch user credentials
    const user = await User.findById(userId).select('firstName lastName address contactNo email');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // ✅ File handling (uploaded proof)
    let proofPath = '';
    if (req.file) {
      proofPath = `/uploads/payments/${req.file.filename}`;
    }

    // ✅ Map cart items
    const orderItems = JSON.parse(items).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // ✅ Create new order
    const newOrder = new Order({
      userId,
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        contactNo: user.contactNo,
        email: user.email,
      },
      items: orderItems,
      grossTotal: total,
      netTotal: total,
      payment: {
        method: payment?.method || 'GCash',
        referenceNumber: payment?.referenceNumber || '',
        proofOfPayment: proofPath, // ✅ File path from multer
      },
      status: 'processing',
    });

    await newOrder.save();
    await Cart.deleteMany({ userId });

    res.status(200).json({
      message: 'Order placed successfully.',
      order: newOrder,
      user,
    });
  } catch (err) {
    console.error('Place Order Error:', err);
    res.status(500).json({ message: 'Server error placing order.' });
  }
};