const request = require('supertest');
const app = require('../app');
const { AppDataSource } = require('../config/databaseConfig');
const Usuario = require('../models/usuario');
const Categoria = require('../models/Category');
const Tag = require('../models/Tag');
const Game = require('../models/Product');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(Usuario);
    const catRepo = AppDataSource.getRepository(Categoria);
    const tagRepo = AppDataSource.getRepository(Tag);
    const gameRepo = AppDataSource.getRepository(Game);

    await gameRepo.clear();
    await tagRepo.clear();
    await catRepo.clear();
    await userRepo.clear();

    global.__SEEDED_USERS = [];
    global.__SEEDED_TOKENS = [];
    for (let i = 1; i <= 10; i++) {
        const email = `seeduser${i}@example.com`;
        const nombre = `Seed User ${i}`;
        const plain = `Password${i}!`;
        const hashed = await bcrypt.hash(plain, 10);
        const user = userRepo.create({ nombre, email, contrasena: hashed });
        await userRepo.save(user);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        global.__SEEDED_USERS.push({ id: user.id, email, plain });
        global.__SEEDED_TOKENS.push(token);
    }

    const baseCat = catRepo.create({ name: 'SeedCat', description: 'Base category for seeded games' });
    await catRepo.save(baseCat);
    const t1 = tagRepo.create({ name: 'SeedTag1' });
    const t2 = tagRepo.create({ name: 'SeedTag2' });
    await tagRepo.save([t1, t2]);

    for (let i = 1; i <= 10; i++) {
        const name = `Seed Game ${i}`;
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${i}`;
        const g = gameRepo.create({
            name,
            developer: 'SeedDev',
            publisher: 'SeedPub',
            releaseDate: '2019-01-01',
            price: 19.99,
            stock: 5,
            genre: 'Action',
            platform: 'PS4',
            slug,
            category: baseCat,
            tags: [t1, t2]
        });
        await gameRepo.save(g);
    }
});

beforeEach(async () => {
    console.log('Test setup - seeded data available');
});

afterAll(async () => {
    await AppDataSource.destroy();
});

describe('Pruebas de Endpoints de Autenticación', () => {
    it('POST /auth/register, se espera status 201 %% success, return: id, nombre, email.', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({ nombre: 'Alex', email: 'alex@hotmail.com', contrasena: 'Password' });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body.status).toBe('success');
        expect(registerResponse.body.data).toHaveProperty('id');
        expect(registerResponse.body.data.nombre).toBe('Alex');
        expect(registerResponse.body.data.email).toBe('alex@hotmail.com');
    });

    it('POST /auth/login, Se espera retornar status 200 && success, return Token', async () => {
        const seeded = global.__SEEDED_USERS[0];
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: seeded.email, contrasena: seeded.plain });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.status).toBe('success');
        expect(loginResponse.body).toHaveProperty('token');
    });
});

describe('Task 2 - Extended robustness tests (categories, tags, products)', () => {
    let createdCategory;
    let createdTag1;
    let createdTag2;
    let createdProduct;

    async function createAndLogin() {
        if (!global.__SEEDED_TOKENS || global.__SEEDED_TOKENS.length === 0) {
            throw new Error('Seeded tokens are not available');
        }
        const token = global.__SEEDED_TOKENS[Math.floor(Math.random() * global.__SEEDED_TOKENS.length)];
        return token;
    }

    test('Categories CRUD: protected endpoints reject without token', async () => {
        const res = await request(app).post('/v2/categories').send({ name: 'NoAuthCat' });
        expect([401, 403]).toContain(res.status);
    });

    test('Tags CRUD: protected endpoints reject without token', async () => {
        const res = await request(app).post('/v2/tags').send({ name: 'NoAuthTag' });
        expect([401, 403]).toContain(res.status);
    });

    test('Create category (protected) and validate JSend', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        const res = await request(app)
            .post('/v2/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Category ${Date.now()}`, description: 'Category for tests' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('status', 'success');
        createdCategory = res.body.data;
        expect(createdCategory).toHaveProperty('id');
    });

    test('Create tags (protected) and validate JSend', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        const r1 = await request(app)
            .post('/v2/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Tag 1 ${Date.now()}` });
        expect(r1.status).toBe(201);
        createdTag1 = r1.body.data;

        const r2 = await request(app)
            .post('/v2/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Tag 2 ${Date.now()}` });
        expect(r2.status).toBe(201);
        createdTag2 = r2.body.data;
    });

    test('Protected game endpoints fail without token', async () => {
        const createRes = await request(app).post('/v2/games').send({ name: 'x' });
        expect([401, 403]).toContain(createRes.status);

        const getRes = await request(app).get('/v2/games/1');
        expect([401, 403]).toContain(getRes.status);

        const putRes = await request(app).put('/v2/games/1').send({ name: 'x2' });
        expect([401, 403]).toContain(putRes.status);

        const delRes = await request(app).delete('/v2/games/1');
        expect([401, 403]).toContain(delRes.status);
    });

    test('Create a game (protected) and associate category and tags', async () => {
        const token = await createAndLogin();
        const payload = {
            name: `CI Game ${Date.now()}`,
            developer: 'CI Dev',
            publisher: 'CI Pub',
            releaseDate: '2020-10-10',
            price: 39.99,
            stock: 12,
            genre: 'Adventure',
            platform: 'PS4',
            categoryId: createdCategory.id,
            tags: [createdTag1.id, createdTag2.id]
        };

        const r = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
        expect(r.status).toBe(201);
        expect(r.body.status).toBe('success');
        createdProduct = r.body.data;
        expect(createdProduct).toHaveProperty('id');
    });

    test('Public GET /v2/games works without token and supports filters', async () => {
        const r = await request(app).get('/v2/games').query({ page: 1, limit: 5, search: 'Seed Game', platform: 'PS4' });
        expect(r.status).toBe(200);
        expect(r.body.status).toBe('success');
        expect(r.body.data).toHaveProperty('items');
    });

    test('Public GET /v2/p/:composite returns 301 when slug mismatches', async () => {
        const r1 = await request(app).get('/v2/p/1-wrong-slug');
        expect([301, 302]).toContain(r1.status);
    });
});

// ==================== NEGATIVE TESTS - CONTROLLERS ====================
describe('Negative tests - Controllers', () => {
  test('Auth: invalid token yields 401 on protected endpoint', async () => {
    const res = await request(app).post('/v2/categories').set('Authorization', 'Bearer invalid.token').send({ name: 'X' });
    expect([401, 403]).toContain(res.status);
  });

  test('Category: duplicate creation returns 409', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const name = `DupCat-${Date.now()}`;
    const r1 = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r1.status).toBe(201);
    const r2 = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r2.status).toBe(409);
    expect(r2.body.status).toBe('fail');
  });

  test('Category: update to existing name returns 409', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
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
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/categories/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('Category: cannot delete when related products exist (409)', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const creCat = await request(app).post('/v2/categories').set('Authorization', `Bearer ${token}`).send({ name: `Cprod-${Date.now()}` });
    expect(creCat.status).toBe(201);
    const creTag = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name: `Tprod-${Date.now()}` });
    expect(creTag.status).toBe(201);
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
    const del = await request(app).delete(`/v2/categories/${creCat.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(409);
  }, 20000);

  test('Tag: duplicate creation returns 409', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const name = `DupTag-${Date.now()}`;
    const r1 = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r1.status).toBe(201);
    const r2 = await request(app).post('/v2/tags').set('Authorization', `Bearer ${token}`).send({ name });
    expect(r2.status).toBe(409);
  });

  test('Tag: update non-existent returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/tags/999999').set('Authorization', `Bearer ${token}`).send({ name: 'No' });
    expect(res.status).toBe(404);
  });

  test('Tag: cannot delete when related products exist (409)', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
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
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send({ price: 1.0 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  test('Product: create with invalid price/stock returns 400', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const payload = { name: 'BadNums', price: 'NaN', stock: 'NaN' };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(400);
  });

  test('Product: create with non-existent category returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const payload = { name: 'NoCat', price: 1.0, categoryId: 999999 };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(404);
  });

  test('Product: create with non-existent tags returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const payload = { name: 'NoTags', price: 1.0, tags: [999999] };
    const res = await request(app).post('/v2/games').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(404);
  });

  test('Product: get with invalid id returns 400', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).get('/v2/games/invalid-id').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('Product: get not found returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).get('/v2/games/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('Product: update invalid id returns 400', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/games/abc').set('Authorization', `Bearer ${token}`).send({ name: 'x' });
    expect(res.status).toBe(400);
  });

  test('Product: update not found returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).put('/v2/games/999999').set('Authorization', `Bearer ${token}`).send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  test('Product: update with non-existent category/tags returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
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
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/games/abc').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('Product: delete not found returns 404', async () => {
    async function registerAndLogin() {
      const email = `errtest_${Date.now()}@example.com`;
      const pass = 'Password1!';
      await request(app).post('/auth/register').send({ nombre: 'ErrTester', email, contrasena: pass });
      const r = await request(app).post('/auth/login').send({ email, contrasena: pass });
      return r.body.token;
    }
    
    const token = await registerAndLogin();
    const res = await request(app).delete('/v2/games/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
