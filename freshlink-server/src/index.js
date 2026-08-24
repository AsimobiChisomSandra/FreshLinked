require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`FreshLink API running on port ${PORT}`);
    });
  } catch (err) {
    console.warn('Database not available. Starting FreshLink API in local fallback mode.');
    app.listen(PORT, () => {
      console.log(`FreshLink API running on port ${PORT} in fallback mode`);
    });
  }
})();
