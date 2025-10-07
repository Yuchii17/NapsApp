const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String, 
  email: String,
  message: String,
  image: String,     
  timestamp: { type: Date, default: Date.now }
});

const customerSupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('CustomerSupport', customerSupportSchema);