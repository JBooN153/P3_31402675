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
