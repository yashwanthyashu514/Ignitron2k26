import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { officialEvents } from './updateEvents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initialDataPath = path.resolve(__dirname, '../src/data/initialData.js');

const raw = fs.readFileSync(initialDataPath, 'utf8');

// Build defaultEvents code
const eventsCode = `export const defaultEvents = ${JSON.stringify(officialEvents, null, 2)};`;

// Build timeline
const day1Events = officialEvents.filter(e => e.day.includes('Day 1')).map(e => ({
  time: e.time,
  event: e.name,
  tagline: e.description,
  venue: e.venue,
  club: e.category,
  rulebookLink: e.rulebookLink,
  registrationLink: e.registrationLink,
}));

const day2Events = officialEvents.filter(e => e.day.includes('Day 2')).map(e => ({
  time: e.time,
  event: e.name,
  tagline: e.description,
  venue: e.venue,
  club: e.category,
  rulebookLink: e.rulebookLink,
  registrationLink: e.registrationLink,
}));

const day3Events = officialEvents.filter(e => e.day.includes('Day 3')).map(e => ({
  time: e.time,
  event: e.name,
  tagline: e.description,
  venue: e.venue,
  club: e.category,
  rulebookLink: e.rulebookLink,
  registrationLink: e.registrationLink,
}));

const timelineObj = {
  day1: [
    {
      time: '09:00 AM',
      event: 'Auto Expo, Banner Drop, Flash Mob',
      venue: 'Near "I Love GMU"',
      club: 'Fest Kickoff',
    },
    {
      time: '10:00 AM – 11:00 AM',
      event: 'Inauguration – Formal Program',
      venue: 'GM Halamma Auditorium',
      club: 'Grand Opening',
    },
    {
      time: '12:30 PM – 01:30 PM',
      event: 'Lunch Break',
      venue: 'Food Court / Dining Hall',
      club: 'Break',
    },
    ...day1Events,
  ],
  day2: [
    ...day2Events,
    {
      time: '12:30 PM – 01:30 PM',
      event: 'Lunch Break',
      venue: 'Food Court / Dining Hall',
      club: 'Break',
    },
  ],
  day3: [
    ...day3Events,
    {
      time: '12:30 PM – 01:30 PM',
      event: 'Lunch Break',
      venue: 'Food Court / Dining Hall',
      club: 'Break',
    },
    {
      time: '02:00 PM – 05:00 PM',
      event: 'Grand Valedictory & Prize Distribution',
      tagline: 'Grand Finale, Awards & Fest Concluding Celebrations',
      venue: 'GM Halamma Auditorium',
      club: 'Closing Ceremony',
    },
  ],
};

const timelineCode = `export const defaultTimeline = ${JSON.stringify(timelineObj, null, 2)};`;

// Extract team members
const teamStart = raw.indexOf('export const defaultTeamMembers =');
const teamEnd = raw.indexOf('export const defaultTimeline =');
const teamCode = raw.slice(teamStart, teamEnd).trim();

// Extract scoreboard, countdown, brochure
const scStart = raw.indexOf('export const defaultScoreboard =');
const scCode = raw.slice(scStart).trim();

const fullContent = `// Initial data for the Ignitron 2K26 website

${eventsCode}

${teamCode}

${timelineCode}

${scCode}
`;

fs.writeFileSync(initialDataPath, fullContent, 'utf8');
console.log('Successfully updated src/data/initialData.js with 28 official events and timeline!');

