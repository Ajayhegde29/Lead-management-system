const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const User = require('../models/User');

let token;
let admin;

const createLeadPayload = (overrides = {}) => ({
  leadName: 'Asha Kumar',
  companyName: 'Example Technologies',
  mobile: '+91 9876543210',
  email: 'asha@example.com',
  serviceRequired: 'SEO',
  leadSource: 'Google',
  estimatedValue: 50000,
  assignedTo: admin.id,
  leadStatus: 'New',
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-jwt';
  process.env.JWT_EXPIRES_IN = '1h';
  await mongoose.connect('mongodb://127.0.0.1:27017/lead-management-system-jest-test');
  await Promise.all([User.deleteMany({}), Lead.deleteMany({}), FollowUp.deleteMany({})]);
  admin = await User.create({ username: 'admin', password: 'Admin@123', role: 'admin' });
  const login = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123' });
  token = login.body.data.token;
});

afterEach(async () => {
  await Promise.all([Lead.deleteMany({}), FollowUp.deleteMany({})]);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('authentication', () => {
  test('logs in with valid credentials and returns a JWT', async () => {
    const response = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123' });
    expect(response.status).toBe(200);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({ username: 'admin', role: 'admin' });
  });

  test('rejects invalid and missing credentials', async () => {
    const invalid = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
    const missing = await request(app).post('/api/auth/login').send({});
    expect(invalid.status).toBe(401);
    expect(missing.status).toBe(400);
  });

  test('hashes the seeded user password', async () => {
    const user = await User.findOne({ username: 'admin' }).select('+password');
    expect(user.password).not.toBe('Admin@123');
    expect(await bcrypt.compare('Admin@123', user.password)).toBe(true);
  });
});

describe('lead APIs', () => {
  test('requires a token', async () => {
    const response = await request(app).get('/api/leads');
    expect(response.status).toBe(401);
  });

  test('creates, searches, filters, sorts, updates, and deletes a lead', async () => {
    const create = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(createLeadPayload());
    expect(create.status).toBe(201);
    const leadId = create.body.data._id;

    const list = await request(app).get('/api/leads').set('Authorization', `Bearer ${token}`).query({ search: 'asha@example.com', status: 'New', service: 'SEO', sortBy: 'estimatedValue', sortOrder: 'desc', page: 1, limit: 10 });
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.pagination.total).toBe(1);

    const update = await request(app).put(`/api/leads/${leadId}`).set('Authorization', `Bearer ${token}`).send({ leadStatus: 'Proposal Sent', estimatedValue: 75000 });
    expect(update.status).toBe(200);
    expect(update.body.data).toMatchObject({ leadStatus: 'Proposal Sent', estimatedValue: 75000 });

    const get = await request(app).get(`/api/leads/${leadId}`).set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.email).toBe('asha@example.com');

    const remove = await request(app).delete(`/api/leads/${leadId}`).set('Authorization', `Bearer ${token}`);
    expect(remove.status).toBe(200);
  });

  test('rejects invalid payloads and duplicate email/mobile records', async () => {
    const invalid = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send({});
    expect(invalid.status).toBe(400);
    expect(invalid.body.errors).toEqual(expect.any(Array));

    await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(createLeadPayload());
    const duplicate = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(createLeadPayload({ leadName: 'Duplicate' }));
    expect(duplicate.status).toBe(409);
  });
});

describe('follow-ups and dashboard', () => {
  test('adds and retrieves follow-up history and returns dashboard statistics', async () => {
    const first = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(createLeadPayload());
    const second = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(createLeadPayload({ leadName: 'Ravi Shah', mobile: '+91 9876543211', email: 'ravi@example.com', leadStatus: 'Won', estimatedValue: 90000 }));

    const followUp = await request(app).post(`/api/leads/${first.body.data._id}/follow-ups`).set('Authorization', `Bearer ${token}`).send({ date: '2026-08-26', followUpType: 'Call', remarks: 'Discussed requirements', nextFollowUpDate: '2026-08-28' });
    expect(followUp.status).toBe(201);

    const history = await request(app).get(`/api/leads/${first.body.data._id}/follow-ups`).set('Authorization', `Bearer ${token}`);
    expect(history.status).toBe(200);
    expect(history.body.data).toHaveLength(1);

    const dashboard = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data).toMatchObject({ totalLeads: 2, newLeads: 1, won: 1, potentialBusinessValue: 50000 });
    expect(second.status).toBe(201);
  });
});
