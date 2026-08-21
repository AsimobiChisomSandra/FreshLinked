const express = require('express');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create product (seller only)
router.post('/', auth, requireRole('seller'), async (req, res) => {
  try {
    const data = { ...req.body, sellerId: req.user._id };
    const p = await Product.create(data);
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
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
    const products = await Product.find(filter).populate('sellerId', 'name verifiedSeller farm');
    const withFreshness = products.map((p) => ({ ...p.toObject(), freshness: p.freshnessInfo() }));
    res.json(withFreshness);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate('sellerId', 'name verifiedSeller farm');
    if (!p) return res.status(404).json({ error: 'Not found' });
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
