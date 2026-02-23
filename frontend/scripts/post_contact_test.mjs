import http from 'http';
import { request } from 'node:http';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const payload = {
  name: 'CI Test',
  email: 'ci@example.com',
  subject: 'E2E test',
  message: 'This is a test message from automated E2E.'
};

(async () => {
  try {
    const res = await fetch(BASE + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(2);
  }
})();
