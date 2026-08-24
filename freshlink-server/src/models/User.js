const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'farmer', 'seller', 'admin'], default: 'buyer' },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    trustScore: { type: Number, default: 100 },
    farmName: { type: String, trim: true },
    primaryProduce: { type: String },
    shoppingInterest: { type: String },
    verifiedSeller: { type: Boolean, default: false },
    farm: {
      name: String,
      location: String,
      details: String,
    },
  },
  { timestamps: true }
);

userSchema.pre('validate', function normalizeRole(next) {
  if (this.role === 'seller') this.role = 'farmer';
  next();
});

module.exports = mongoose.model('User', userSchema);
