import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://yashwanthm499_db_user:Dl2zPrgM10clOctm@cluster0.7fapzpd.mongodb.net/ignitron2k26?retryWrites=true&w=majority';

async function deduplicateGallery() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('galleries');

  const beforeCount = await collection.countDocuments();
  console.log(`[Before] Total gallery documents in MongoDB: ${beforeCount}`);

  // Fetch all gallery documents
  const allDocs = await collection.find({}).sort({ order: 1, _id: 1 }).toArray();

  const seenSrc = new Set();
  const idsToDelete = [];
  const keptDocs = [];

  for (const doc of allDocs) {
    const cleanSrc = (doc.src || '').trim();
    if (seenSrc.has(cleanSrc)) {
      idsToDelete.push(doc._id);
    } else {
      seenSrc.add(cleanSrc);
      keptDocs.push(doc);
    }
  }

  console.log(`Found ${keptDocs.length} unique photos. Deleting ${idsToDelete.length} duplicates...`);

  if (idsToDelete.length > 0) {
    const delResult = await collection.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`Successfully deleted ${delResult.deletedCount} duplicate documents.`);
  }

  // Ensure orders are cleanly set 1 to 19
  for (let i = 0; i < keptDocs.length; i++) {
    const expectedOrder = i + 1;
    await collection.updateOne(
      { _id: keptDocs[i]._id },
      { $set: { order: expectedOrder, isHomeFeatured: true, year: '2K25' } }
    );
  }

  const afterCount = await collection.countDocuments();
  console.log(`[After] Remaining gallery documents in MongoDB: ${afterCount}`);

  const finalDocs = await collection.find({}).sort({ order: 1 }).toArray();
  console.log('Final 19 photos in MongoDB:');
  finalDocs.forEach(d => {
    console.log(`  #${d.order} -> src: ${d.src} | caption: ${d.caption}`);
  });

  await mongoose.disconnect();
}

deduplicateGallery().catch(err => {
  console.error(err);
  process.exit(1);
});
