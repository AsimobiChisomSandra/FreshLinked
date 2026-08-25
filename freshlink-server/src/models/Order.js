const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true },
    reference: { type: String, index: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.Mixed },
        productName: { type: String },
        sellerId: { type: mongoose.Schema.Types.Mixed },
        qty: { type: Number, default: 1 },
        priceAtOrder: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['payment_pending', 'paid', 'payment_failed'], default: 'paid' },
    fulfillmentMethod: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    pickupLocation: { type: String },
    deliveryAddress: { type: String },
    expectedFulfillmentDate: { type: Date },
    status: { type: String, enum: ['pending', 'processing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
