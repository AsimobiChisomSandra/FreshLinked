const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items = [], deliveryAddress } = req.body;
    const normalizedItems = items.map((it) => ({
      productId: it.productId || it.id || null,
      sellerId: it.sellerId || null,
      qty: Number(it.qty ?? it.quantity ?? 1),
      priceAtOrder: Number(it.priceAtOrder ?? it.unitPrice ?? it.price ?? 0),
    }));

    const order = await Order.create({
      buyerId: req.user._id,
      items: normalizedItems,
      deliveryAddress: deliveryAddress || req.body.address || '',
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get orders for user (buyer or seller) or single order
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      const orders = await Order.find({ 'items.sellerId': req.user._id }).populate('buyerId', 'name email');
      return res.json(orders);
    }
    const orders = await Order.find({ buyerId: req.user._id }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const o = await Order.findById(req.params.id).populate('items.productId buyerId');
    if (!o) return res.status(404).json({ error: 'Not found' });
    // authorization: buyer, seller (involved), or admin
    const isBuyer = String(o.buyerId._id) === String(req.user._id);
    const isSellerInvolved = o.items.some((it) => String(it.sellerId) === String(req.user._id));
    if (!isBuyer && !isSellerInvolved && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.json(o);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (seller)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    // ensure seller is part of the order
    const isSellerInvolved = o.items.some((it) => String(it.sellerId) === String(req.user._id));
    if (!isSellerInvolved && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    o.status = status;
    await o.save();
    res.json(o);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
