const request = require('supertest');
const app = require('../app');

describe('GET /ping', () => {
  it('debe devolver 200 OK', async () => {
    await request(app).get('/ping').expect(200);
  });
});

describe('GET /about', () => {
  it('Debería devolver 200 OK y formato JSend', async () => {
    const res = await request(app).get('/about').expect(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('nombreCompleto');
  });
});
