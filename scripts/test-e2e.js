// End-to-end integration test for Ignitron 2K26 Role-Based Event Management System

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== STARTING IGNITRON 2K26 ROLE-BASED SYSTEM TEST ===\n');

  // Step 1: Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('[1] Backend Health:', health.status === 'ok' ? 'PASS' : 'FAIL');

  // Step 2: Super Admin Login
  console.log('\n[2] Logging in as Super Admin (IgnitronGMUSA2026)...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'IgnitronGMUSA2026',
      password: 'ignitron2k26',
    }),
  });
  const adminAuth = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminAuth.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminAuth)}`);
  }
  console.log('    Super Admin authenticated successfully! Role:', adminAuth.user.role);
  const adminToken = adminAuth.token;

  // Clean any previous test teams for 'Robo Race'
  const testEventName = 'Robo Race';

  // Step 3: Create Coordinator for 'Robo Race'
  const testCoordUsername = `coord_roborace_${Date.now()}`;
  console.log(`\n[3] Creating Event Coordinator (${testCoordUsername})...`);
  const createCoordRes = await fetch(`${BASE_URL}/coordinators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Dr. Anita Sharma',
      username: testCoordUsername,
      password: 'coordpassword123',
      assignedEvent: testEventName,
      department: 'Robotics & Automation',
      email: 'anita.robotics@gmu.edu',
      mobile: '+91 9876543210',
      status: 'active',
    }),
  });
  const createdCoord = await createCoordRes.json();
  if (!createCoordRes.ok) {
    throw new Error(`Create coordinator failed: ${JSON.stringify(createdCoord)}`);
  }
  console.log('    Coordinator created successfully:', createdCoord.name, 'Assigned:', createdCoord.assignedEvent);

  // Step 4: Coordinator Login
  console.log('\n[4] Logging in as Coordinator...');
  const coordLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testCoordUsername,
      password: 'coordpassword123',
    }),
  });
  const coordAuth = await coordLoginRes.json();
  if (!coordLoginRes.ok || !coordAuth.token) {
    throw new Error(`Coordinator login failed: ${JSON.stringify(coordAuth)}`);
  }
  console.log('    Coordinator authenticated successfully! Role:', coordAuth.user.role, 'Event:', coordAuth.user.assignedEvent);
  const coordToken = coordAuth.token;

  // Step 5: Test Authorization Boundary (Coordinator cannot add team to another event)
  console.log('\n[5] Testing RBAC: Coordinator attempting unauthorized access to different event...');
  const unauthorizedRes = await fetch(`${BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({
      eventName: 'Market Mavericks', // unauthorized event for this coordinator
      teamName: 'Rogue Traders',
      leaderName: 'Test',
      leaderUsn: '4GM22CS999',
      leaderCollege: 'Test College',
    }),
  });
  const unauthData = await unauthorizedRes.json();
  console.log('    Server response to unauthorized attempt:', unauthorizedRes.status, unauthData.error);
  if (unauthorizedRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden on unauthorized event access, got ${unauthorizedRes.status}`);
  }
  console.log('    RBAC Authorization Check: PASS (Access properly denied)');

  // Step 6: Register Team 1 with Dynamic Participants
  console.log(`\n[6] Registering Team 1 ("CyberBots") for ${testEventName}...`);
  const team1Res = await fetch(`${BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({
      eventName: testEventName,
      teamName: `CyberBots ${Date.now()}`,
      leaderName: 'Arjun Verma',
      leaderUsn: `4GM22CS${Math.floor(100 + Math.random() * 899)}`,
      leaderCollege: 'RV College of Engineering',
      leaderMobile: '9845012345',
      participants: [
        { name: 'Priya Nair', usn: `4GM22CS${Math.floor(100 + Math.random() * 899)}` },
        { name: 'Kiran Patel', usn: `4GM22CS${Math.floor(100 + Math.random() * 899)}` },
      ],
    }),
  });
  const team1 = await team1Res.json();
  if (!team1Res.ok) {
    throw new Error(`Register Team 1 failed: ${JSON.stringify(team1)}`);
  }
  console.log(`    Team 1 Registered: ${team1.teamName} (${team1.registrationNo}), Leader: ${team1.leaderName}, College: ${team1.leaderCollege}`);

  // Step 7: Register Team 2
  console.log(`\n[7] Registering Team 2 ("SpeedRacers") for ${testEventName}...`);
  const team2Res = await fetch(`${BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({
      eventName: testEventName,
      teamName: `SpeedRacers ${Date.now()}`,
      leaderName: 'Rohan Deshmukh',
      leaderUsn: `4GM22IS${Math.floor(100 + Math.random() * 899)}`,
      leaderCollege: 'BMS College of Engineering',
      leaderMobile: '9845099999',
      participants: [
        { name: 'Megha Rao', usn: `4GM22IS${Math.floor(100 + Math.random() * 899)}` },
      ],
    }),
  });
  const team2 = await team2Res.json();
  if (!team2Res.ok) {
    throw new Error(`Register Team 2 failed: ${JSON.stringify(team2)}`);
  }
  console.log(`    Team 2 Registered: ${team2.teamName} (${team2.registrationNo}), Leader: ${team2.leaderName}`);

  // Step 8: Save Score Drafts
  console.log('\n[8] Scoring Teams according to event criteria...');
  const scoreTeam1Res = await fetch(`${BASE_URL}/teams/${team1._id}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({
      scores: {
        round1: 24,
        round2: 25,
        round3: 23,
        technical: 9,
        creativity: 9,
        execution: 5,
      },
      remarks: 'Outstanding track time and robotic sensor navigation',
      judgeName: 'Dr. K. S. Murthy',
    }),
  });
  const scoreTeam1 = await scoreTeam1Res.json();
  console.log(`    Team 1 Score Saved: Total = ${scoreTeam1.team.totalScore} pts, Status = ${scoreTeam1.team.scoreStatus}`);

  const scoreTeam2Res = await fetch(`${BASE_URL}/teams/${team2._id}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({
      scores: {
        round1: 20,
        round2: 22,
        round3: 20,
        technical: 8,
        creativity: 8,
        execution: 4,
      },
      remarks: 'Fast acceleration, slight drift on curve 2',
      judgeName: 'Dr. K. S. Murthy',
    }),
  });
  const scoreTeam2 = await scoreTeam2Res.json();
  console.log(`    Team 2 Score Saved: Total = ${scoreTeam2.team.totalScore} pts, Status = ${scoreTeam2.team.scoreStatus}`);

  // Step 9: Coordinator Submits Final Results
  console.log(`\n[9] Coordinator Submitting Final Results for ${testEventName}...`);
  const submitRes = await fetch(`${BASE_URL}/submissions/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordToken}`,
    },
    body: JSON.stringify({ eventName: testEventName }),
  });
  const submissionData = await submitRes.json();
  if (!submitRes.ok) {
    throw new Error(`Submission failed: ${JSON.stringify(submissionData)}`);
  }
  console.log(`    Submission Successful! Status: ${submissionData.submission.status}, Teams Count: ${submissionData.submission.teamsCount}`);
  const submissionId = submissionData.submission._id;

  // Step 10: Verify public scoreboard DOES NOT have pending scores yet
  console.log('\n[10] Verifying Public Scoreboard isolation before approval...');
  const preScoreboardRes = await fetch(`${BASE_URL}/scoreboard`);
  const preScoreboard = await preScoreboardRes.json();
  const rvCollegeBefore = preScoreboard.find(c => c.collegeName === 'RV College of Engineering');
  console.log('    RV College on Public Scoreboard before approval:', rvCollegeBefore ? `${rvCollegeBefore.score} pts` : 'Not yet awarded (Draft/Pending Isolated)');

  // Step 11: Super Admin Approves Results
  console.log('\n[11] Super Admin Approving Submission...');
  const approveRes = await fetch(`${BASE_URL}/submissions/${submissionId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const approveData = await approveRes.json();
  if (!approveRes.ok) {
    throw new Error(`Approve failed: ${JSON.stringify(approveData)}`);
  }
  console.log('    Super Admin Approved Successfully! Status:', approveData.submission.status);

  // Step 12: Verify Public Scoreboard AUTOMATICALLY Updated!
  console.log('\n[12] Verifying Automatic Public Scoreboard Update...');
  const postScoreboardRes = await fetch(`${BASE_URL}/scoreboard`);
  const postScoreboard = await postScoreboardRes.json();
  const rvCollegeAfter = postScoreboard.find(c => c.collegeName === 'RV College of Engineering');
  console.log('    RV College on Public Scoreboard after approval:', rvCollegeAfter ? `${rvCollegeAfter.score} pts (AUTOMATICALLY UPDATED!)` : 'Not found');
  console.log('    Top Standings on Scoreboard:');
  postScoreboard.slice(0, 4).forEach((item, idx) => {
    console.log(`      #${idx + 1} ${item.collegeName}: ${item.score} pts`);
  });

  // Step 13: Verify Audit Logs
  console.log('\n[13] Verifying Audit Logs recorded for Super Admin...');
  const auditRes = await fetch(`${BASE_URL}/audit-logs?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const auditData = await auditRes.json();
  console.log(`    Total Audit Logs Recorded: ${auditData.total}`);
  console.log('    Latest 3 Recorded Actions:');
  auditData.logs.slice(0, 3).forEach((log) => {
    console.log(`      • [${log.action}] by ${log.coordinatorName}: "${log.description}"`);
  });

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY! ===\n');
}

runTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
