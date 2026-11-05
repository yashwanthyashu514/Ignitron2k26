import { connectDB } from '../server/config/db.js';
import { Event } from '../server/models/Event.js';
import { defaultEvents } from '../src/data/initialData.js';

async function seed() {
  await connectDB();
  console.log(`Starting seed for ${defaultEvents.length} events...`);
  let added = 0;
  for (const ev of defaultEvents) {
    const existing = await Event.findOne({
      $or: [{ id: String(ev.id) }, { name: ev.name }],
    });
    if (!existing) {
      await Event.create({
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
        maxTeamSize: ev.maxTeamSize || 4,
      });
      console.log(`+ Added: ${ev.name} (Day: ${ev.day})`);
      added++;
    } else {
      console.log(`= Exists: ${ev.name}`);
    }
  }
  const total = await Event.countDocuments();
  console.log(`Seed complete! Added ${added} new events. Total events now in MongoDB: ${total}`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

