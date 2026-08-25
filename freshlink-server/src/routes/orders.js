const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { memoryOrders, memoryProducts } = require('../config/inMemoryStore');
const crypto = require('crypto');
const mongoose = require('mongoose');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items = [], deliveryAddress, paymentStatus: incomingPaymentStatus, fulfillmentMethod, pickupLocation } = req.body;

    const normalizedItems = [];
    for (const it of items) {
      const productId = it.productId || it.id || null;
      let sellerId = it.sellerId || null;
      let priceAtOrder = Number(it.priceAtOrder ?? it.unitPrice ?? it.price ?? 0);
      let productName = it.productName || it.name || '';

      if (productId) {
        try {
          const prod = await Product.findById(productId);
          if (prod) {
            sellerId = prod.sellerId || sellerId;
            priceAtOrder = prod.price || priceAtOrder;
            productName = prod.name || productName;
          } else {
            // not in DB, try in-memory products
            const mem = memoryProducts.find((p) => String(p._id) === String(productId));
            if (mem) {
              sellerId = mem.sellerId || sellerId;
              priceAtOrder = mem.price || priceAtOrder;
              productName = mem.name || productName;
            }
          }
        } catch (e) {
          // If DB lookup throws, try in-memory products as fallback
          try {
            const mem = memoryProducts.find((p) => String(p._id) === String(productId));
            if (mem) {
              sellerId = mem.sellerId || sellerId;
              priceAtOrder = mem.price || priceAtOrder;
            }
          } catch (ee) {
            // ignore
          }
        }
      }

      normalizedItems.push({ productId, productName, sellerId, qty: Number(it.qty ?? it.quantity ?? 1), priceAtOrder });
    }
    // compute totals and reference
    const subtotal = normalizedItems.reduce((s, it) => s + (Number(it.priceAtOrder || 0) * Number(it.qty || 1)), 0);
    const totalAmount = subtotal; // extend for fees if needed
    const reference = `FL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    try {
      const order = await Order.create({
        reference,
        buyerId: req.user._id,
        items: normalizedItems,
        subtotal,
        totalAmount,
        paymentStatus: incomingPaymentStatus || 'paid',
        fulfillmentMethod: fulfillmentMethod || 'pickup',
        pickupLocation: pickupLocation || null,
        deliveryAddress: deliveryAddress || req.body.address || '',
      });
      return res.json(order);
    } catch (dbErr) {
      console.error('DB order create failed, falling back to memory:', dbErr && dbErr.message);
      const fallback = {
        _id: crypto.randomUUID(),
        reference,
        buyerId: req.user._id,
        items: normalizedItems,
        subtotal,
        totalAmount,
        paymentStatus: incomingPaymentStatus || 'paid',
        fulfillmentMethod: fulfillmentMethod || 'pickup',
        pickupLocation: pickupLocation || null,
        deliveryAddress: deliveryAddress || req.body.address || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryOrders.push(fallback);
      return res.json(fallback);
    }
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get orders for user (buyer or seller) or single order
router.get('/', auth, async (req, res) => {
  try {
    const userRole = String(req.user.role || '').toLowerCase();
    if (['seller', 'farmer'].includes(userRole)) {
      let orders = [];
      try {
        orders = await Order.find({ 'items.sellerId': req.user._id }).populate('buyerId', 'name email');
      } catch (dbErr) {
        orders = [];
      }
      const mem = memoryOrders.filter((o) => o.items.some((it) => String(it.sellerId) === String(req.user._id)));
      return res.json([...mem, ...orders]);
    }
    let orders = [];
    try {
      orders = await Order.find({ buyerId: req.user._id }).populate('items.productId');
    } catch (dbErr) {
      orders = [];
    }
    const mem = memoryOrders.filter((o) => String(o.buyerId) === String(req.user._id));
    res.json([...mem, ...orders]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    let o = null;
    try {
      o = await Order.findById(req.params.id).populate('items.productId buyerId');
    } catch (dbErr) {
      o = null;
    }
    if (!o) {
      o = memoryOrders.find((x) => String(x._id) === String(req.params.id));
      if (!o) return res.status(404).json({ error: 'Not found' });
    }
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
    let o = null;
    try {
      o = await Order.findById(req.params.id);
    } catch (dbErr) {
      o = null;
    }
    if (!o) {
      const memIdx = memoryOrders.findIndex((x) => String(x._id) === String(req.params.id));
      if (memIdx === -1) return res.status(404).json({ error: 'Not found' });
      memoryOrders[memIdx].status = status;
      return res.json(memoryOrders[memIdx]);
    }
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
