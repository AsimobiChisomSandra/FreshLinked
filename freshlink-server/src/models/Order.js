const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        qty: Number,
        priceAtOrder: Number,
      },
    ],
    deliveryAddress: String,
    status: { type: String, enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
