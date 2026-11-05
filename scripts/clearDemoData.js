import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ignitron2k26';

await mongoose.connect(MONGODB_URI);
const { Team } = await import('../server/models/Team.js');
const { ScoreSubmission } = await import('../server/models/ScoreSubmission.js');
const { Scoreboard } = await import('../server/models/Scoreboard.js');

console.log('Clearing demo/test teams and resetting test scores...');

const teamResult = await Team.deleteMany({});
console.log(`Deleted ${teamResult.deletedCount} demo teams.`);

const subResult = await ScoreSubmission.deleteMany({});
console.log(`Deleted ${subResult.deletedCount} demo submissions.`);

// Reset scoreboard to 0
await Scoreboard.updateMany({}, { $set: { score: 0, eventWins: [] } });
console.log('Scoreboard scores reset to clean start.');

console.log('\nReady for real student registration data!');
await mongoose.disconnect();
process.exit(0);

