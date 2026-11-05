import mongoose from 'mongoose';

// Cache connection in global scope for Vercel Serverless function container reuse
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/ignitron2k26');

  if (!uri) {
    const errMsg = '[MongoDB] MONGODB_URI environment variable is NOT set in Vercel!';
    console.error(errMsg);
    throw new Error(errMsg);
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    console.log(`[MongoDB] Connecting to: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully to host: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      console.error(`[MongoDB] Connection failed: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
