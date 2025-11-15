const request = require('supertest');
const app = require('../app');
const { AppDataSource } = require('../config/databaseConfig');
const bcrypt = require('bcrypt');

async function ensureInitialized() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

async function registerAndLogin() {
  const email = `errtest_${Date.now()}@example.com`;
  const pass = 'Password1!';
  await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
  const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
  return r.body.token;
}

beforeAll(async () => {
  await ensureInitialized();
});

describe('Negative tests - Controllers', () => {
  test('Auth: invalid token yields 401 on protected endpoint', async () => {
    const res = await request(app).post('/v2/categories').set('Authorization', 'Bearer invalid.token').send({ name: 'X' });
    expect([401, 403]).toContain(res.status);
  });

  test('Category: duplicate creation returns 409', async () => {
    const token = await registerAndLogin();
    const name = `DupCat-${Date.now()}`;
    const r1 = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r1.status).toBe(201);
    const r2 = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r2.status).toBe(409);
    expect(r2.body.status).toBe('fail');
  });

  test('Category: update to existing name returns 409', async () => {
    const token = await registerAndLogin();
    const a = `CatA-${Date.now()}`;
    const b = `CatB-${Date.now()}`;
    const ra = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: a });
    const rb = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: b });
    expect(ra.status).toBe(201);
    expect(rb.status).toBe(201);
    const update = await request(app).put(`/v2/categories/${rb.body.data.id}`).set('Authorization', `Bearer ${token}`).send({ name: a });
    expect(update.status).toBe(409);
  });

  test('Category: delete not found returns 404', async () => {
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/categories/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('Category: cannot delete when related products exist (409)', async () => {
    const token = await registerAndLogin();
    // create category and tag
    const creCat = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: `Cprod-${Date.now()}` });
    expect(creCat.status).toBe(201);
    const creTag = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name: `Tprod-${Date.now()}` });
    expect(creTag.status).toBe(201);
    // create product associated
    const payload = {
      name: `GameForCat-${Date.now()}`,
      developer: 'Dev',
      publisher: 'Pub',
      releaseDate: '2020-01-01',
      price: 10.0,
      stock: 1,
      genre: 'Test',
      platform: 'PS4',
      categoryId: creCat.body.data.id,
      tags: [creTag.body.data.id]
    };
    const gp = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(gp.status).toBe(201);
    // attempt to delete category
    const del = await request(app).delete(`/v2/categories/${creCat.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(409);
  }, 20000);

  test('Tag: duplicate creation returns 409', async () => {
    const token = await registerAndLogin();
    const name = `DupTag-${Date.now()}`;
    const r1 = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r1.status).toBe(201);
    const r2 = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r2.status).toBe(409);
  });

  test('Tag: update non-existent returns 404', async () => {
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/tags/999999').set('Authorization', `Bearer ${token}`).send({ name: 'No' });
    expect(res.status).toBe(404);
  });

  test('Tag: cannot delete when related products exist (409)', async () => {
    const token = await registerAndLogin();
    const creCat = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: `CatForTag-${Date.now()}` });
    const creTag = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name: `TagForProd-${Date.now()}` });
    expect(creCat.status).toBe(201);
    expect(creTag.status).toBe(201);
    const payload = {
      name: `GameForTag-${Date.now()}`,
      developer: 'Dev',
      publisher: 'Pub',
      releaseDate: '2020-01-01',
      price: 12.0,
      stock: 2,
      genre: 'Test',
      platform: 'PS4',
      categoryId: creCat.body.data.id,
      tags: [creTag.body.data.id]
    };
    const gp = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(gp.status).toBe(201);
    const del = await request(app).delete(`/v2/tags/${creTag.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(409);
  }, 20000);

  test('Product: create without name returns 400', async () => {
    const token = await registerAndLogin();
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send({ price: 1.0 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  test('Product: create with invalid price/stock returns 400', async () => {
    const token = await registerAndLogin();
    const payload = { name: 'BadNums', price: 'NaN', stock: 'NaN' };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(400);
  });

  test('Product: create with non-existent category returns 404', async () => {
    const token = await registerAndLogin();
    const payload = { name: 'NoCat', price: 1.0, categoryId: 999999 };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(404);
  });

  test('Product: create with non-existent tags returns 404', async () => {
    const token = await registerAndLogin();
    const payload = { name: 'NoTags', price: 1.0, tags: [999999] };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(404);
  });

  test('Product: get with invalid id returns 400', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/v2/games/invalid-id').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('Product: get not found returns 404', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/v2/games/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('Product: update invalid id returns 400', async () => {
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/games/abc').set('Authorization', `Bearer ${token}`).send({ name: 'x' });
    expect(res.status).toBe(400);
  });

  test('Product: update not found returns 404', async () => {
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/games/999999').set('Authorization', `Bearer ${token}`).send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  test('Product: update with non-existent category/tags returns 404', async () => {
    const token = await registerAndLogin();
    // create a product to update
    const creCat = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: `UC-${Date.now()}` });
    const creTag = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name: `UT-${Date.now()}` });
    const payload = { name: `UpProd-${Date.now()}`, price: 5.0, categoryId: creCat.body.data.id, tags: [creTag.body.data.id] };
    const gp = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(gp.status).toBe(201);
    const id = gp.body.data.id;
    const res1 = await request(app).put(`/v2/games/${id}`).set('Authorization', `Bearer ${token}`).send({ categoryId: 999999 });
    expect(res1.status).toBe(404);
    const res2 = await request(app).put(`/v2/games/${id}`).set('Authorization', `Bearer ${token}`).send({ tags: [999999] });
    expect(res2.status).toBe(404);
  }, 20000);

  test('Product: delete invalid id returns 400', async () => {
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/games/abc').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('Product: delete not found returns 404', async () => {
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/games/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
