import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://yashwanthm499_db_user:Dl2zPrgM10clOctm@cluster0.7fapzpd.mongodb.net/ignitron2k26?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const result = await mongoose.connection.collection('events').updateOne(
    { name: new RegExp('^Market Mavericks$', 'i') },
    { $set: { minTeamSize: 4, maxTeamSize: 6 } }
  );
  console.log('Modified count:', result.modifiedCount);

  const doc = await mongoose.connection.collection('events').findOne({ name: new RegExp('^Market Mavericks$', 'i') });
  console.log('Market Mavericks:', {
    name: doc.name,
    minTeamSize: doc.minTeamSize,
    maxTeamSize: doc.maxTeamSize,
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
