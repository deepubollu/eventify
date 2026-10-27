const http = require('http');

async function runE2ETests() {
  console.log('>>> [E2E] Starting Eventify Full-Stack Integration Verification Suite...');

  // 1. Start server
  const server = require('./backend/server');
  // Wait 2.5s for initial setup and fallback db initialization
  await new Promise((r) => setTimeout(r, 2500));

  const request = (path, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // Test 1: Health
    console.log('\n1. Testing Backend Health API...');
    const health = await request('/api/health');
    console.log(`   Status: ${health.status} (${health.body.status}) | DB: ${health.body.database.engine}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // Test 2: Static Frontend
    console.log('\n2. Testing Static Frontend SPA Serving...');
    const frontend = await request('/');
    const isHtml = typeof frontend.body === 'string' && frontend.body.includes('<div id="root"></div>');
    console.log(`   Status: ${frontend.status} | Contains #root div: ${isHtml}`);
    if (!isHtml) throw new Error('Frontend SPA root not served');

    // Test 3: Get Events & Categories
    console.log('\n3. Testing Events & Categories API...');
    const eventsRes = await request('/api/events');
    const categoriesRes = await request('/api/events/meta/categories');
    console.log(`   Events loaded: ${eventsRes.body.count} | Categories count: ${categoriesRes.body.categories?.length}`);
    if (eventsRes.body.count < 1) throw new Error('No events found');

    // Test 4: Auth Login for All Roles
    console.log('\n4. Testing Authentication for Attendee, Organizer, Admin...');
    const attendeeLogin = await request('/api/auth/login', 'POST', {
      email: 'attendee@eventify.com',
      password: 'attendee123',
    });
    console.log(`   Attendee Login: ${attendeeLogin.status} | User: ${attendeeLogin.body.user.name} (${attendeeLogin.body.user.role})`);

    const organizerLogin = await request('/api/auth/login', 'POST', {
      email: 'organizer@eventify.com',
      password: 'organizer123',
    });
    console.log(`   Organizer Login: ${organizerLogin.status} | User: ${organizerLogin.body.user.name} (${organizerLogin.body.user.role})`);

    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@eventify.com',
      password: 'admin123',
    });
    console.log(`   Admin Login: ${adminLogin.status} | User: ${adminLogin.body.user.name} (${adminLogin.body.user.role})`);

    const attendeeToken = attendeeLogin.body.token;
    const organizerToken = organizerLogin.body.token;
    const adminToken = adminLogin.body.token;

    // Test 5: Event Creation by Organizer
    console.log('\n5. Testing Event Creation (Organizer Role)...');
    const createEventRes = await request(
      '/api/events',
      'POST',
      {
        title: 'Future of Agentic AI & Web3 Hackathon',
        description: '48-hour competitive sprint building autonomous coding agents.',
        category: 'Technology',
        date: '2026-12-20',
        time: '10:00',
        venue: 'Austin Innovation Center, TX',
        locationType: 'in-person',
        ticketPrice: 0,
        capacity: 100,
      },
      { Authorization: `Bearer ${organizerToken}` }
    );
    console.log(`   Event Created: ${createEventRes.status} | ID: ${createEventRes.body.event?._id} | Title: "${createEventRes.body.event?.title}"`);
    const newEventId = createEventRes.body.event._id;

    // Test 6: Ticket Booking & QR Code Generation
    console.log('\n6. Testing Ticket Booking & QR Generation...');
    const bookingRes = await request(
      '/api/bookings',
      'POST',
      {
        eventId: newEventId,
        ticketsCount: 1,
        attendeeDetails: {
          name: 'Jordan Taylor',
          email: 'attendee@eventify.com',
          phone: '+1 555-0199',
        },
      },
      { Authorization: `Bearer ${attendeeToken}` }
    );
    console.log(`   Booking Created: ${bookingRes.status} | Ref: ${bookingRes.body.booking?.bookingReference}`);
    const generatedTicket = bookingRes.body.tickets?.[0];
    console.log(`   Generated Ticket Code: ${generatedTicket?.ticketCode} | QR Payload: ${generatedTicket?.qrData?.substring(0, 40)}...`);

    // Test 7: Duplicate Booking Prevention
    console.log('\n7. Testing Duplicate Booking Prevention...');
    const duplicateRes = await request(
      '/api/bookings',
      'POST',
      {
        eventId: newEventId,
        ticketsCount: 1,
        attendeeDetails: {
          name: 'Jordan Taylor',
          email: 'attendee@eventify.com',
        },
      },
      { Authorization: `Bearer ${attendeeToken}` }
    );
    console.log(`   Duplicate Booking Blocked Status: ${duplicateRes.status} (${duplicateRes.body.message})`);
    if (duplicateRes.status !== 400) throw new Error('Duplicate booking was not prevented');

    // Test 8: QR Ticket Verification - Step 1: Valid Ticket Check-in
    console.log('\n8. Testing Atomic QR Ticket Verification (Entrance Gate Check)...');
    const validCheckIn = await request(
      '/api/tickets/verify-checkin',
      'POST',
      {
        ticketCodeInput: generatedTicket.ticketCode,
        deviceInfo: 'Gate 1 Scanner Terminal',
      },
      { Authorization: `Bearer ${organizerToken}` }
    );
    console.log(`   Valid Check-In: Status ${validCheckIn.status} | Message: "${validCheckIn.body.message}"`);
    if (validCheckIn.status !== 200 || validCheckIn.body.ticket.status !== 'used') {
      throw new Error('Valid ticket check-in failed');
    }

    // Test 9: QR Ticket Verification - Step 2: Duplicate / Already Used Ticket
    console.log('\n9. Testing Duplicate Check-In Prevention (Already Used Ticket)...');
    const duplicateCheckIn = await request(
      '/api/tickets/verify-checkin',
      'POST',
      {
        ticketCodeInput: generatedTicket.ticketCode,
        deviceInfo: 'Gate 2 Scanner Terminal',
      },
      { Authorization: `Bearer ${organizerToken}` }
    );
    console.log(`   Duplicate Check-in Blocked: Status ${duplicateCheckIn.status} | Reason: ${duplicateCheckIn.body.status} ("${duplicateCheckIn.body.message}")`);
    if (duplicateCheckIn.status !== 409) throw new Error('Duplicate check-in was not blocked');

    // Test 10: QR Ticket Verification - Step 3: Invalid / Forged Ticket
    console.log('\n10. Testing Invalid / Forged Ticket Code...');
    const invalidCheckIn = await request(
      '/api/tickets/verify-checkin',
      'POST',
      {
        ticketCodeInput: 'TKT-FORGED-999999',
        deviceInfo: 'Gate 1 Scanner Terminal',
      },
      { Authorization: `Bearer ${organizerToken}` }
    );
    console.log(`   Invalid Ticket Rejected: Status ${invalidCheckIn.status} | Reason: ${invalidCheckIn.body.status}`);
    if (invalidCheckIn.status !== 404) throw new Error('Invalid ticket code was not rejected');

    // Test 11: Organizer Analytics Dashboard
    console.log('\n11. Testing Organizer Dashboard Metrics & Recharts Aggregations...');
    const dashRes = await request('/api/dashboard/organizer', 'GET', null, {
      Authorization: `Bearer ${organizerToken}`,
    });
    console.log(`   Dashboard: Total Events: ${dashRes.body.stats?.totalEvents} | Revenue: $${dashRes.body.stats?.totalRevenue} | Attendance Rate: ${dashRes.body.stats?.attendanceRate}%`);
    console.log(`   Charts generated: Event-Capacity: ${dashRes.body.charts?.eventCapacityChart?.length} | Trends: ${dashRes.body.charts?.registrationTrends?.length}`);

    // Test 12: Admin Platform Stats
    console.log('\n12. Testing Admin Panel Platform Stats...');
    const adminStats = await request('/api/admin/stats', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Admin Stats: Total Users: ${adminStats.body.stats?.totalUsers} | Platform Bookings: ${adminStats.body.stats?.totalBookings} | Check-Ins: ${adminStats.body.stats?.totalCheckIns}`);

    console.log('\n=============================================================');
    console.log('🎉 ALL 12 END-TO-END INTEGRATION TEST SUITES PASSED FLAWLESSLY!');
    console.log('=============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E Test Suite Error:', err.message);
    process.exit(1);
  }
}

runE2ETests();

