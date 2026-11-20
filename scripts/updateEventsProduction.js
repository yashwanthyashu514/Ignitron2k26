import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Event } from '../server/models/Event.js';
import { Timeline } from '../server/models/Timeline.js';
import { defaultEvents, defaultTimeline } from '../src/data/initialData.js';

async function syncEventsToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('[Sync] Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 15000,
  });
  console.log('[Sync] Connected successfully to host:', mongoose.connection.host);

  // 1. Update/Upsert Events in MongoDB Atlas
  console.log('[Sync] Updating Events in MongoDB Atlas...');
  for (const ev of defaultEvents) {
    const filter = {
      $or: [
        { id: String(ev.id) },
        { name: ev.name },
      ],
    };

    const update = {
      $set: {
        id: String(ev.id),
        name: ev.name,
        time: ev.time || '',
        day: ev.day || 'Day 1',
        venue: ev.venue || '',
        category: ev.category || 'General',
        club: ev.club || '',
        description: ev.description || '',
        rulebookLink: ev.rulebookLink || '',
        registrationLink: ev.registrationLink || '',
        minTeamSize: ev.minTeamSize || (ev.maxTeamSize ? (ev.minTeamSize || 1) : 1),
        maxTeamSize: ev.maxTeamSize || 4,
        isHackathon: ev.name.toLowerCase().includes('code rush') || String(ev.id) === '1',
      },
    };

    const res = await Event.findOneAndUpdate(filter, update, { upsert: true, new: true });
    console.log(`  ✓ Updated Event "${res.name}" (min: ${res.minTeamSize}, max: ${res.maxTeamSize}, venue: "${res.venue}", time: "${res.time}")`);
  }

  // 2. Update Timeline Events in MongoDB Atlas
  console.log('\n[Sync] Updating Timeline in MongoDB Atlas...');
  for (const day of ['day1', 'day2', 'day3']) {
    const list = defaultTimeline[day] || [];
    for (const item of list) {
      if (!item.event) continue;
      const tFilter = {
        day,
        event: item.event,
      };

      const tUpdate = {
        $set: {
          time: item.time,
          venue: item.venue || '',
          tagline: item.tagline || '',
          club: item.club || '',
          rulebookLink: item.rulebookLink || '',
          registrationLink: item.registrationLink || '',
        },
      };

      const tRes = await Timeline.findOneAndUpdate(tFilter, tUpdate, { upsert: false });
      if (tRes) {
        console.log(`  ✓ Updated Timeline "${item.event}" on ${day} (venue: "${item.venue}", time: "${item.time}")`);
      }
    }
  }

  console.log('\n[Sync] All events & timeline entries synchronized to production database successfully!');
  await mongoose.disconnect();
  console.log('[Sync] Disconnected from MongoDB.');
}

syncEventsToDatabase().catch(err => {
  console.error('[Sync Error]', err);
  process.exit(1);
});
