// backend/src/config/db.js
const mongoose = require("mongoose");

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`Could not connect to specified MONGO_URI (${err.message}). Attempting fallback...`);
    }
  } else {
    try {
      // Try local standard port first
      const conn = await mongoose.connect("mongodb://127.0.0.1:27017/payroll", {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`Connected to local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.log("Local MongoDB not detected. Initializing in-memory Mongo instance for development...");
    }
  }

  // Fallback to in-memory MongoDB
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`Connected to In-Memory MongoDB: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error("Critical: Failed to connect to any MongoDB instance:", memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
