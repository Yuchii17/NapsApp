const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Product = require('../models/Product');
const Table = require('../models/Table');

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
