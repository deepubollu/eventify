const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventify';
  
  // Set shorter timeout so app starts without waiting 30 seconds if mongo isn't running locally
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000, // 2s timeout
      connectTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`[Database] MongoDB connection skipped (${error.message}).`);
    console.log(`[Database] Active: Running with built-in resilient In-Memory/JSON Database Engine.`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => {
  return {
    isConnected,
    engine: isConnected ? 'MongoDB (Mongoose)' : 'Built-in Embedded JSON DB (Seed Data Ready)',
  };
};

module.exports = { connectDB, getDBStatus, isMongoConnected: () => isConnected };

