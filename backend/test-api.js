const http = require('http');

async function test() {
  const app = require('./server');
  // Wait a moment for server to listen
  await new Promise(r => setTimeout(r, 2500));

  const doRequest = (path, method = 'GET', body = null, headers = {}) => {
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
        res.on('data', (c) => data += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch(e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('Testing Health API...');
    const health = await doRequest('/api/health');
    console.log('Health:', health.status, health.body.status);

    console.log('Testing Events API...');
    const events = await doRequest('/api/events');
    console.log('Events count:', events.body.count);

    console.log('Testing Login API (Attendee)...');
    const login = await doRequest('/api/auth/login', 'POST', {
      email: 'attendee@eventify.com',
      password: 'attendee123',
    });
    console.log('Attendee Login:', login.status, login.body.user ? login.body.user.name : login.body.message);

    console.log('Testing Ticket verification for valid ticket...');
    const ticketRes = await doRequest('/api/tickets/TKT-AI26-9A8B7C');
    console.log('Ticket query:', ticketRes.status, ticketRes.body.ticket ? ticketRes.body.ticket.ticketCode : 'Not found');

    console.log('All backend API tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

test();

