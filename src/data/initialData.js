// Initial data for the Ignitron 2K26 website
// All data is stored in localStorage

export const ADMIN_CREDENTIALS = {
  username: 'ignitron2k26',
  password: 'IgnitronGMUSA2026',
};

export const defaultEvents = [
  {
    id: '1',
    name: 'Hackathon',
    time: '09:00 AM',
    day: 'Day 1',
    rulebookLink: 'https://drive.google.com/drive/hackathon-rulebook',
    registrationLink: 'https://unstop.com/hackathon-ignitron',
    description: 'A 24-hour coding marathon where teams build innovative solutions to real-world problems.',
    category: 'Technical',
    maxTeamSize: 4,
    prize: '₹25,000',
  },
  {
    id: '2',
    name: 'Robo Wars',
    time: '10:00 AM',
    day: 'Day 2',
    rulebookLink: 'https://drive.google.com/drive/robowars-rulebook',
    registrationLink: 'https://unstop.com/robowars-ignitron',
    description: 'Battle your robots against opponents in an arena of steel and sparks!',
    category: 'Robotics',
    maxTeamSize: 3,
    prize: '₹20,000',
  },
  {
    id: '3',
    name: 'Code Quest',
    time: '02:00 PM',
    day: 'Day 1',
    rulebookLink: 'https://drive.google.com/drive/codequest-rulebook',
    registrationLink: 'https://unstop.com/codequest-ignitron',
    description: 'Solve algorithmic challenges and climb the leaderboard in this competitive programming event.',
    category: 'Technical',
    maxTeamSize: 2,
    prize: '₹15,000',
  },
  {
    id: '4',
    name: 'AI/ML Showcase',
    time: '11:00 AM',
    day: 'Day 3',
    rulebookLink: 'https://drive.google.com/drive/aiml-rulebook',
    registrationLink: 'https://unstop.com/aiml-ignitron',
    description: 'Demonstrate your AI/ML projects and innovations to a panel of industry experts.',
    category: 'AI/ML',
    maxTeamSize: 4,
    prize: '₹30,000',
  },
  {
    id: '5',
    name: 'Design Thinking',
    time: '09:30 AM',
    day: 'Day 2',
    rulebookLink: 'https://drive.google.com/drive/design-rulebook',
    registrationLink: 'https://unstop.com/design-ignitron',
    description: 'Pitch creative UI/UX solutions to industry problems with innovative design thinking.',
    category: 'Design',
    maxTeamSize: 3,
    prize: '₹12,000',
  },
];

export const defaultTeamMembers = [
  { id: '1', name: 'Arjun Sharma', role: 'Event Coordinator', photo: '' },
  { id: '2', name: 'Priya Mehta', role: 'Technical Head', photo: '' },
  { id: '3', name: 'Rahul Verma', role: 'Logistics Manager', photo: '' },
  { id: '4', name: 'Sneha Reddy', role: 'Design Lead', photo: '' },
  { id: '5', name: 'Karan Patel', role: 'Marketing Head', photo: '' },
  { id: '6', name: 'Divya Nair', role: 'PR Manager', photo: '' },
];

export const defaultTimeline = {
  day1: [
    { time: '09:00 AM', event: 'Registration & Inauguration' },
    { time: '10:30 AM', event: 'Hackathon Begins' },
    { time: '02:00 PM', event: 'Code Quest' },
    { time: '06:00 PM', event: 'Cultural Evening' },
  ],
  day2: [
    { time: '09:00 AM', event: 'Robo Wars Preliminaries' },
    { time: '10:00 AM', event: 'Design Thinking Workshop' },
    { time: '02:00 PM', event: 'Robo Wars Finals' },
    { time: '07:00 PM', event: 'Networking Dinner' },
  ],
  day3: [
    { time: '09:00 AM', event: 'AI/ML Showcase Opens' },
    { time: '12:00 PM', event: 'Hackathon Submission' },
    { time: '02:00 PM', event: 'Results & Prizes' },
    { time: '05:00 PM', event: 'Closing Ceremony' },
  ],
};

export const defaultScoreboard = [
  { id: '1', collegeName: 'IIT Bombay', score: 950 },
  { id: '2', collegeName: 'NIT Trichy', score: 880 },
  { id: '3', collegeName: 'BITS Pilani', score: 820 },
  { id: '4', collegeName: 'VIT Vellore', score: 760 },
  { id: '5', collegeName: 'SRM University', score: 700 },
  { id: '6', collegeName: 'Manipal Institute', score: 640 },
];

// Target date: April 15, 2026
export const defaultCountdown = '2026-04-15T09:00:00';
export const defaultBrochureLink = 'https://drive.google.com/file/ignitron2k26-brochure';
