const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (err) {
    console.warn(`[MongoDB] Local connection failed (${err.message}). Attempting fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`[MongoDB] Connected to In-Memory MongoDB Server`);
      return conn.connection;
    } catch (fallbackErr) {
      console.error(`[MongoDB] Connection Error:`, fallbackErr.message);
      throw err;
    }
  }
};

module.exports = { connectDB };
