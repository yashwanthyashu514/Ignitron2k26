import dotenv from 'dotenv';
dotenv.config();

// Ensure VERCEL=1 is set in the environment BEFORE server.js is imported
process.env.VERCEL = '1';

import mongoose from 'mongoose';
import http from 'http';

const { default: app, connectDB } = await import('../server/server.js');

const TEST_PORT = 5088;
const BASE = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log('IGNITRON 2K26 — PRODUCTION VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  console.log('[Test] Connecting to MongoDB Atlas...');
  await connectDB();
  console.log('[Test] MongoDB Atlas connected ✓');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`[Test Server] Running on ${BASE}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. HEALTH CHECK & MONGODB ATLAS VERIFICATION
    console.log('--- 1. Health & Database Connection ---');
    const healthRes = await fetch(`${BASE}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    assert(healthData.dbState === 1, 'MongoDB Atlas connection state is 1 (CONNECTED)');

    // 2. ADMIN AUTHENTICATION
    console.log('\n--- 2. Admin Authentication ---');
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ignitron2k26', password: 'ignitron2k26' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && Boolean(loginData.token), 'SuperAdmin logged in and received JWT');
    const token = loginData.token;

    // 3. UNAUTHORIZED CRUD REJECTION (SECURITY)
    console.log('\n--- 3. Security: Unauthorized CRUD Rejection ---');
    const unauthRes = await fetch(`${BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker Event' }),
    });
    assert(unauthRes.status === 401, 'POST /api/events without token rejected with 401 Unauthorized');

    // 4. CORS VERIFICATION FOR GMU DOMAIN
    console.log('\n--- 4. CORS Headers for GM University Domain ---');
    const corsRes = await fetch(`${BASE}/api/events`, {
      headers: {
        'Origin': 'https://gmu.ac.in',
      },
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const allowCreds = corsRes.headers.get('access-control-allow-credentials');
    assert(allowOrigin === 'https://gmu.ac.in', 'CORS echoes requesting origin (https://gmu.ac.in)');
    assert(allowCreds === 'true', 'CORS allows credentials for cross-domain calls');

    // 5. CACHE-CONTROL HEADERS (PREVENTING STALE RESPONSES)
    console.log('\n--- 5. Anti-Stale Cache-Control Headers ---');
    const cacheHeader = corsRes.headers.get('cache-control') || '';
    assert(cacheHeader.includes('no-store') && cacheHeader.includes('no-cache'), 'API sends Cache-Control: no-store, no-cache');

    // 6. TEST EVENT CREATION, PERSISTENCE & CROSS-DEVICE READ
    console.log('\n--- 6. Event CRUD Persistence in MongoDB Atlas ---');
    const uniqueTestName = `Test Hackathon Sync ${Date.now()}`;
    const createEvRes = await fetch(`${BASE}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: uniqueTestName,
        time: '10:00 AM - 04:00 PM',
        day: 'Day 1',
        venue: 'Testing Hall',
        category: 'Technical',
        description: 'Test description for sync verification',
      }),
    });
    const createdEvent = await createEvRes.json();
    assert(createEvRes.status === 201 && createdEvent.name === uniqueTestName, 'Event created via Admin API');

    // Verify Public API (simulating Mobile B / Incognito without auth)
    const publicEvRes = await fetch(`${BASE}/api/events`);
    const publicEvents = await publicEvRes.json();
    const foundInPublic = publicEvents.find(e => e.id === createdEvent.id);
    assert(Boolean(foundInPublic) && foundInPublic.name === uniqueTestName, 'Public GET /api/events returns new event for all devices');

    // 7. EVENT UPDATE (TEST 1 & 2: Title and Description Update)
    console.log('\n--- 7. Event Mutation & Revalidation Across Devices ---');
    const updatedTitle = `${uniqueTestName} (Updated)`;
    const updatedDesc = 'Updated description verified on central DB';
    const updateRes = await fetch(`${BASE}/api/events/${createdEvent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: updatedTitle,
        description: updatedDesc,
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      console.log('  [Event Update Error]:', updateData);
    }
    assert(updateRes.status === 200, 'Admin PUT /api/events/:id succeeded');

    // Verify Public API reflects mutation immediately
    const recheckedPublic = await fetch(`${BASE}/api/events`).then(r => r.json());
    const publicUpdated = recheckedPublic.find(e => e.id === createdEvent.id);
    assert(publicUpdated && publicUpdated.name === updatedTitle, 'Public API returns updated event title without stale caching');

    // 8. EVENT DELETION (TEST 7)
    console.log('\n--- 8. Event Deletion & Central Propagation ---');
    const delRes = await fetch(`${BASE}/api/events/${createdEvent.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(delRes.status === 200, 'Admin DELETE /api/events/:id succeeded');

    const checkDeleted = await fetch(`${BASE}/api/events`).then(r => r.json());
    const stillThere = checkDeleted.find(e => e.id === createdEvent.id);
    assert(!stillThere, 'Event removed completely from public events API');

    // 9. TIMELINE CRUD (TEST 3)
    console.log('\n--- 9. Timeline Mutation & Revalidation ---');
    const createTimeRes = await fetch(`${BASE}/api/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        day: 'day1',
        time: '09:30 AM',
        event: 'Opening Keynote Speech',
        tagline: 'Welcome by Dignitaries',
        venue: 'Main Auditorium',
      }),
    });
    const createdTimeline = await createTimeRes.json();
    assert(createTimeRes.status === 201 && createdTimeline.event === 'Opening Keynote Speech', 'Timeline event created in database');

    const publicTimeRes = await fetch(`${BASE}/api/timeline`).then(r => r.json());
    const foundTimeline = (publicTimeRes.timeline?.day1 || []).find(t => t.event === 'Opening Keynote Speech');
    assert(Boolean(foundTimeline), 'Public GET /api/timeline displays new schedule item');

    // Clean up timeline
    if (createdTimeline._id) {
      await fetch(`${BASE}/api/timeline/${createdTimeline._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // 10. TEAM MEMBERS CRUD (TEST 4)
    console.log('\n--- 10. Team Member Mutation & Persistence ---');
    const createTeamRes = await fetch(`${BASE}/api/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Prof. Test Coordinator',
        role: 'Faculty Advisor',
        category: 'organizer',
        org: 'GM University',
        photo: '/team/sample.png',
      }),
    });
    const createdMember = await createTeamRes.json();
    assert(createTeamRes.status === 201 && createdMember.name === 'Prof. Test Coordinator', 'Team member saved to central database');

    const publicTeamRes = await fetch(`${BASE}/api/team`).then(r => r.json());
    const foundMember = publicTeamRes.find(m => m.name === 'Prof. Test Coordinator');
    assert(Boolean(foundMember), 'Public GET /api/team reflects new team member');

    // Clean up team member
    if (createdMember._id || createdMember.id) {
      await fetch(`${BASE}/api/team/${createdMember._id || createdMember.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // 11. GLOBAL SETTINGS (COUNTDOWN, BROCHURE, ACCOMMODATION) (TEST 6)
    console.log('\n--- 11. Global Settings Synchronization ---');
    const settingsUpdateRes = await fetch(`${BASE}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        accommodationLink: 'https://accomadation.vercel.app/',
        brochureLink: 'https://drive.google.com/file/d/test-brochure',
      }),
    });
    assert(settingsUpdateRes.status === 200, 'PUT /api/settings succeeded');

    const publicSettings = await fetch(`${BASE}/api/settings`).then(r => r.json());
    assert(publicSettings.accommodationLink === 'https://accomadation.vercel.app/', 'Accommodation link synchronized across all devices');
    assert(publicSettings.brochureLink === 'https://drive.google.com/file/d/test-brochure', 'Brochure link synchronized across all devices');

    // 12. GALLERY STATUS & INTEGRATION (TEST 5)
    console.log('\n--- 12. Gallery & Cloudinary Configuration ---');
    const uploadCfgRes = await fetch(`${BASE}/api/upload/config`);
    const uploadCfg = await uploadCfgRes.json();
    console.log(`  ℹ Cloudinary Status: ${uploadCfg.status}`);
    assert(uploadCfgRes.status === 200, 'GET /api/upload/config responds correctly');

    const publicGalleryRes = await fetch(`${BASE}/api/gallery`);
    const galleryItems = await publicGalleryRes.json();
    if (!publicGalleryRes.ok) {
      console.log('  [Gallery Error Response]:', galleryItems);
    }
    assert(publicGalleryRes.status === 200 && Array.isArray(galleryItems), 'GET /api/gallery returns database gallery list');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Unhandled test runner error:', err);
    process.exitCode = 1;
  } finally {
    await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
    console.log('[Test Server] Stopped cleanly.');
  }
}

runTests();
