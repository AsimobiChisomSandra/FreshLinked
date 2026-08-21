const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: String,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    images: [String],
    harvestDate: { type: Date, required: true },
    ripeningStatus: { type: String, enum: ['natural', 'assisted', 'unverified'], default: 'unverified' },
    freshnessWindowDays: { type: Number, default: 7 },
    location: String,
    status: { type: String, enum: ['active', 'sold_out', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

productSchema.methods.freshnessInfo = function () {
  const now = Date.now();
  const harvested = new Date(this.harvestDate).getTime();
  const elapsedMs = Math.max(0, now - harvested);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const remaining = Math.max(0, this.freshnessWindowDays - elapsedDays);
  const percent = Math.max(0, Math.min(100, Math.round((remaining / this.freshnessWindowDays) * 100)));
  return { elapsedDays: Number(elapsedDays.toFixed(2)), remainingDays: Number(remaining.toFixed(2)), freshnessPercent: percent };
};

module.exports = mongoose.model('Product', productSchema);
