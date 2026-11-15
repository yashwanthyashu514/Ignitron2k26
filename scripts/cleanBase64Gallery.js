import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../server/config/db.js';
import mongoose from 'mongoose';

async function clean() {
  await connectDB();
  const col = mongoose.connection.db.collection('galleries');
  console.log('Deleting base64 documents directly on MongoDB Atlas...');
  const res = await col.deleteMany({ src: /^data:/ });
  console.log(`Deleted ${res.deletedCount} base64 bloat documents!`);
  await mongoose.disconnect();
  process.exit(0);
}

clean().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
