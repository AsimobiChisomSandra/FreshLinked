const mongoose = require('mongoose');

async function connectDB() {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshlink';
  const fallbackUri = 'mongodb://127.0.0.1:27017/freshlink';

  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true,
  };

  try {
    await mongoose.connect(primaryUri, connectOptions);
    console.log(`MongoDB connected via ${primaryUri}`);
    return true;
  } catch (error) {
    if (primaryUri === fallbackUri) {
      console.warn('MongoDB unavailable. Falling back to in-memory auth data for local development.');
      return false;
    }

    console.warn('Primary MongoDB connection failed:', error.message);
    console.warn('Retrying with local fallback on 127.0.0.1:27017');
    try {
      await mongoose.connect(fallbackUri, connectOptions);
      console.log(`MongoDB connected via local fallback: ${fallbackUri}`);
      return true;
    } catch (fallbackError) {
      console.warn('Local MongoDB unavailable. Falling back to in-memory auth data for local development.');
      return false;
    }
  }
}

module.exports = connectDB;
