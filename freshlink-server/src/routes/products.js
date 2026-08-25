const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');
const { memoryProducts } = require('../config/inMemoryStore');

const router = express.Router();

// Create product (farmer seller only)
router.post('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    console.log('PRODUCT CREATE: user=', req.user && req.user._id, 'body=', { name: req.body.name, price: req.body.price });
    const data = {
      ...req.body,
      sellerId: req.user._id,
      imageUrl: req.body.imageUrl || req.body.images?.[0] || '',
      noRipeningAgentPledge: Boolean(req.body.noRipeningAgentPledge),
    };
    // If mongoose is connected, persist to DB; otherwise use in-memory fallback
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const p = await Product.create(data);
        return res.status(201).json(p);
      } catch (dbErr) {
        console.error('DB product create failed:', dbErr);
        // fallthrough to in-memory fallback below
      }
    }
    const fallback = {
      _id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryProducts.push(fallback);
    return res.status(201).json(fallback);
  } catch (err) {
    console.error('Product create outer error:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

router.get('/mine', auth, requireRole('farmer'), async (req, res) => {
  try {
    let products = [];
    try {
      products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    } catch (dbErr) {
      products = [];
    }
    const inMemory = memoryProducts.filter((p) => String(p.sellerId) === String(req.user._id));
    res.json([...inMemory, ...products]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

// List + filters
router.get('/', async (req, res) => {
  try {
    const { category, ripeningStatus, location, minPrice, maxPrice, q } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (ripeningStatus) filter.ripeningStatus = ripeningStatus;
    if (location) filter.location = location;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (q) filter.name = new RegExp(q, 'i');
    let products = [];
    try {
      products = await Product.find(filter).populate('sellerId', 'name verifiedSeller farm');
      products = products.map((p) => ({ ...p.toObject(), freshness: p.freshnessInfo() }));
    } catch (dbErr) {
      products = [];
    }
    const inMemory = memoryProducts.filter((p) => {
      if (filter.category && p.category !== filter.category) return false;
      if (filter.location && p.location !== filter.location) return false;
      if (filter.price && typeof p.price === 'number') {
        if (filter.price.$gte && p.price < filter.price.$gte) return false;
        if (filter.price.$lte && p.price > filter.price.$lte) return false;
      }
      if (filter.name && !new RegExp(filter.name, 'i').test(p.name)) return false;
      return p.status === 'active';
    }).map((p) => ({ ...p, freshness: { elapsedDays: 0, remainingDays: p.freshnessWindowDays || 7, freshnessPercent: 100 } }));
    res.json([...inMemory, ...products]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let p = null;
    try {
      p = await Product.findById(req.params.id).populate('sellerId', 'name verifiedSeller farm');
    } catch (dbErr) {
      p = null;
    }
    if (!p) {
      const mem = memoryProducts.find((x) => String(x._id) === String(req.params.id));
      if (!mem) return res.status(404).json({ error: 'Not found' });
      return res.json(mem);
    }
    res.json({ ...p.toObject(), freshness: p.freshnessInfo() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update product (seller)
router.put('/:id', auth, requireRole('seller'), async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (String(p.sellerId) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    Object.assign(p, req.body);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', auth, requireRole('seller'), async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (String(p.sellerId) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    p.status = 'removed';
    await p.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
