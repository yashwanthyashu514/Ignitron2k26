import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ignitron2k26';

await mongoose.connect(MONGODB_URI);
const { User } = await import('../server/models/User.js');
const { Event } = await import('../server/models/Event.js');

// Ensure Myth Busters event exists
let mythEvent = await Event.findOne({ name: /myth busters/i });
if (!mythEvent) {
  mythEvent = await Event.create({
    id: '303',
    name: 'Myth Busters',
    time: '10:00 AM',
    day: 'Day 2',
    venue: 'Campus Arena',
    category: 'Technical',
    club: 'Innovation Club',
    description: 'Technical Myth Busters & Innovation Challenge',
    rulebookLink: '',
    registrationLink: '',
    maxTeamSize: 4,
    isHackathon: false,
    scoringCriteria: [{ key: 'marks', name: 'Score', maxMarks: 100 }],
  });
  console.log('Created Myth Busters event in DB');
}

// Coordinator specifications from user (1 selected person per event):
const coordinatorsData = [
  {
    event: 'Code Rush : Hackathon',
    name: 'Swathi M',
    usn: '4GM24CS090',
    phone: '8147602906',
    department: 'Computer Science & Engineering',
    displayEvent: 'Hackathon'
  },
  {
    event: 'ModelQuest',
    name: 'CHINTHAN H N',
    usn: 'U24E01AI026',
    phone: '8088300171',
    department: 'Artificial Intelligence & Data Science',
    displayEvent: 'Model Quest'
  },
  {
    event: 'Capture The Flag',
    name: 'Mallikarjun K S',
    usn: 'U25E01CY501',
    phone: '9731696952',
    department: 'Cyber Security',
    displayEvent: 'Capture the Flag'
  },
  {
    event: 'Robo Race',
    name: 'MARUTHI C B',
    usn: 'U24E02RA020',
    phone: '7019232174',
    department: 'Robotics & Automation',
    displayEvent: 'Robo Race'
  },
  {
    event: 'Tech Thesis',
    name: 'CHETHAN C H',
    usn: 'U24E01CY024',
    phone: '9986542358',
    department: 'Cyber Security',
    displayEvent: 'TechThesis'
  },
  {
    event: 'Ideathon',
    name: 'Nandeesh R',
    usn: '4GM24CS053',
    phone: '8050858121',
    department: 'Computer Science & Engineering',
    displayEvent: 'Ideathon'
  },
  {
    event: "Engineer's Eye",
    name: 'Vaibhavi U B',
    usn: 'U24E01IS502',
    phone: '7795366836',
    department: 'Information Science & Engineering',
    displayEvent: "Engineer's Eye"
  },
  {
    event: 'Circuit Debugging',
    name: 'KUMARACHAR M',
    usn: 'U24E02EC044',
    phone: '7259907985',
    department: 'Electronics & Communication',
    displayEvent: 'Circuit Debugging Challenge'
  },
  {
    event: 'Robo Sumo',
    name: 'Namratha R N',
    usn: 'U24E02RA025',
    phone: '7795350680',
    department: 'Robotics & Automation',
    displayEvent: 'Robo Sumo'
  },
  {
    event: 'Line Follower',
    name: 'Kiran S S',
    usn: 'U24E02RA016',
    phone: '8660611634',
    department: 'Robotics & Automation',
    displayEvent: 'Line Follower'
  },
  {
    event: 'Coding Collab',
    name: 'Preetham V R',
    usn: 'P25C01CA034',
    phone: '6363045415',
    department: 'Computer Applications',
    displayEvent: 'Coding Collab'
  },
  {
    event: 'Poster Presentation',
    name: 'Teerthashree H M',
    usn: 'U24E01IO035',
    phone: '9148586279',
    department: 'Information Technology',
    displayEvent: 'Poster Presentation'
  },
  {
    event: 'Nextwave-Paper Presentation',
    name: 'Adithi laxman',
    usn: 'U24B01PM001',
    phone: '9535348023',
    department: 'Management Studies',
    displayEvent: 'NextWave – Paper Presentation'
  },
  {
    event: 'IgniteX Debate',
    name: 'Pramod B K',
    usn: 'U24B02CD025',
    phone: '7259804165',
    department: 'Commerce & Management',
    displayEvent: 'IgniteX Debate'
  },
  {
    event: 'Market Mavericks',
    name: 'Bhavana PG',
    usn: 'U24M01CG016',
    phone: '7204290274',
    department: 'Commerce & Management',
    displayEvent: 'Market Mavericks'
  },
  {
    event: 'Law Debate',
    name: 'Khushi',
    usn: '',
    phone: '9148973410',
    department: 'School of Law',
    displayEvent: 'Law debate'
  },
  {
    event: 'Food Tech',
    name: 'K Shanthi',
    usn: 'U24B03FT009',
    phone: '9380916518',
    department: 'Food Technology',
    displayEvent: 'Food Tech'
  },
  {
    event: 'Finnovate',
    name: 'Prakruthi S',
    usn: 'U24M01CG083',
    phone: '9686184025',
    department: 'Commerce & Management',
    displayEvent: 'Finnovate'
  },
  {
    event: 'Startathon',
    name: 'Ajay N',
    usn: 'P25M02MB004',
    phone: '7019468197',
    department: 'Management Studies (MBA)',
    displayEvent: 'Start-a-thon'
  },
  {
    event: 'PixelCraft',
    name: 'Gururaj Naik',
    usn: 'U24E01BS006',
    phone: '9980913240',
    department: 'Basic Sciences / Computing',
    displayEvent: 'Pixel Craft'
  },
  {
    event: 'Myth Busters',
    name: 'Kavya N',
    usn: 'U24C01CA073',
    phone: '7411647709',
    department: 'Computer Applications',
    displayEvent: 'Myth Busters'
  },
  {
    event: 'Cloud NEX',
    name: 'Vinayak Pujar',
    usn: 'U24E01CC090',
    phone: '8088079573',
    department: 'Cloud Computing & Cyber',
    displayEvent: 'CLOUDNEX'
  },
  {
    event: 'Wallstreet Warriors',
    name: 'Saba Anjum',
    usn: 'U24M02BA025',
    phone: '9606577552',
    department: 'Business Administration',
    displayEvent: 'Wallstreet warriors'
  },
  {
    event: 'Pharma Tech',
    name: 'Deesksha H J',
    usn: '',
    phone: '8431658536',
    department: 'Pharmacy',
    displayEvent: 'PharmNova'
  },
  {
    event: 'Bio Ventures',
    name: 'Kishor kumar B C',
    usn: 'U24B03BT003',
    phone: '9632009341',
    department: 'Biotechnology',
    displayEvent: 'Bio ventures'
  },
  {
    event: 'Prompt to Prototype 2K26',
    name: 'Sinchana R',
    usn: 'U25E02ME023',
    phone: '8970677555',
    department: 'Mechanical Engineering',
    displayEvent: 'Prompt to Prototype 2K26'
  },
  {
    event: 'Electriva',
    name: 'Shreyas Y D',
    usn: 'U25E02EE034',
    phone: '9035751106',
    department: 'Electrical & Electronics',
    displayEvent: 'Electriva'
  },
  {
    event: 'Card Structure',
    name: 'TEJASWINI L',
    usn: 'U24E02CE039',
    phone: '9663639422',
    department: 'Civil Engineering',
    displayEvent: 'Card structure'
  }
];

const results = [];

for (const c of coordinatorsData) {
  // Format requested: eventname followed by name, e.g. "Card structure TEJASWINI L"
  const username = `${c.displayEvent} ${c.name}`.trim();
  const cleanPhone = c.phone.replace(/\s+/g, '');
  const hashed = await bcrypt.hash(cleanPhone, 10);

  // Find target event in DB to get canonical event name
  const ev = await Event.findOne({
    $or: [
      { name: c.event },
      { name: new RegExp('^' + c.event.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    ]
  });

  const assignedEventName = ev ? ev.name : c.event;

  // Check if coordinator account already exists for this username or event
  let user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    user = await User.findOne({ assignedEvent: assignedEventName, role: 'coordinator' });
  }

  if (user) {
    user.username = username.toLowerCase();
    user.name = c.name;
    user.password = hashed;
    user.mobile = cleanPhone;
    user.assignedEvent = assignedEventName;
    user.department = c.department;
    user.status = 'active';
    user.mustChangePassword = false;
    await user.save();
  } else {
    user = await User.create({
      username: username.toLowerCase(),
      name: c.name,
      password: hashed,
      role: 'coordinator',
      assignedEvent: assignedEventName,
      department: c.department,
      mobile: cleanPhone,
      status: 'active',
      mustChangePassword: false,
    });
  }

  results.push({
    assignedEvent: assignedEventName,
    coordinatorName: c.name,
    username: username,
    loginUsername: username.toLowerCase(),
    password: cleanPhone,
    mobile: c.phone
  });
}

console.log(`\n=======================================================`);
console.log(`Successfully created/updated ${results.length} Event Coordinators!`);
console.log(`=======================================================\n`);
console.log(JSON.stringify(results, null, 2));

await mongoose.disconnect();
process.exit(0);

