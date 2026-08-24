const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createUser, findUserByEmail, updateUserPasswordByEmail, buildUserResponse } = require('../config/inMemoryStore');

const { auth } = require('../middleware/auth');

const router = express.Router();
const passwordResetCodes = new Map();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

const normalizeRole = (role) => {
  const value = String(role || 'buyer').trim().toLowerCase();
  if (['farmer', 'seller'].includes(value)) return 'farmer';
  if (value === 'admin') return 'admin';
  return 'buyer';
};

const userExists = async (email) => {
  try {
    return await User.findOne({ email: String(email).trim().toLowerCase() });
  } catch {
    return await findUserByEmail(email);
  }
};

router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, location, farmName, primaryProduce, shoppingInterest } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide your name, email, and password.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await userExists(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    try {
      newUser = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: normalizeRole(role),
        phone,
        location,
        farmName,
        primaryProduce,
        shoppingInterest,
        trustScore: 100,
      });
    } catch {
      newUser = await createUser({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: normalizeRole(role),
        phone,
        location,
        farmName,
        primaryProduce,
        shoppingInterest,
        trustScore: 100,
      });
    }

    const token = jwt.sign({ id: newUser._id || newUser.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: buildUserResponse(newUser),
      message: 'Registration successful.',
    });
  } catch (err) {
    const message = err?.code === 11000 ? 'An account with that email already exists.' : 'Unable to create your account right now.';
    return res.status(500).json({ message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    let user = await User.findOne({ email: String(email).trim().toLowerCase() }).catch(() => null);
    if (!user) {
      user = await findUserByEmail(email);
    }

    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const storedPassword = user.passwordHash || user.password;
    if (!storedPassword) return res.status(401).json({ message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, storedPassword);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    return res.json({
      token,
      user: buildUserResponse(user),
      message: 'Login successful.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to log you in right now.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Please provide your email address.' });
  }

  try {
    let user = await User.findOne({ email: normalizedEmail }).catch(() => null);
    if (!user) {
      user = await findUserByEmail(normalizedEmail);
    }

    if (!user) {
      return res.status(404).json({ message: 'No account was found with that email address.' });
    }

    const code = generateResetCode();
    passwordResetCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    return res.json({
      message: 'A reset code has been generated. Use it to set a new password.',
      code,
      email: normalizedEmail,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to generate a reset code right now.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !code || !password) {
    return res.status(400).json({ message: 'Please provide your email, reset code, and a new password.' });
  }

  const resetEntry = passwordResetCodes.get(normalizedEmail);
  const isCodeValid = resetEntry && resetEntry.code === String(code) && Date.now() <= resetEntry.expiresAt;

  if (!isCodeValid) {
    return res.status(400).json({ message: 'The reset code is invalid or expired.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email: normalizedEmail }).catch(() => null);
    if (user) {
      user.passwordHash = hashedPassword;
      await user.save();
    } else {
      const fallbackUser = await findUserByEmail(normalizedEmail);
      if (!fallbackUser) {
        return res.status(404).json({ message: 'User not found.' });
      }
      await updateUserPasswordByEmail(normalizedEmail, hashedPassword);
    }

    passwordResetCodes.delete(normalizedEmail);
    return res.json({ message: 'Your password has been reset successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to reset your password right now.' });
  }
});

router.get('/me', auth, async (req, res) => {
  return res.json({ user: buildUserResponse(req.user) });
});

module.exports = router;

