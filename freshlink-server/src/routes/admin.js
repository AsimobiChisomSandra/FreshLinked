const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Admin verifies a seller
router.post('/verify-seller/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.verifiedSeller = true;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/flagged-products', auth, requireRole('admin'), async (req, res) => {
  try {
    const flagged = await Product.find({ ripeningStatus: 'unverified' }).limit(100).populate('sellerId', 'name email');
    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
