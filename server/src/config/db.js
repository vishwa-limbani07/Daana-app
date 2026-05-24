// db.js — single source of truth for the MongoDB connection.
// Called once from server.js at startup. If the DB can't connect,
// the server should refuse to start (fail fast).

import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  // Mongoose 8 has sensible defaults — no need for old options
  // like useNewUrlParser / useUnifiedTopology.
  const conn = await mongoose.connect(uri);
  console.log(`[db] connected: ${conn.connection.host}`);
};

export default connectDB;
