import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Endpoint Tests', () => {
  const mockUser = {
    name: 'Test Donor User',
    email: 'test.donor@email.com',
    mobile: '+919999999999',
    password: 'securepassword123',
    bloodGroup: 'O+',
    role: 'donor',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'Bengaluru Office'
    }
  };

  test('POST /api/v1/auth/register - Register a new User account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(mockUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(mockUser.email);
    expect(res.body.data.user.mobile).toBe(mockUser.mobile);
    expect(res.body.data.accessToken).toBeDefined();

    const dbUser = await User.findOne({ email: mockUser.email });
    expect(dbUser).toBeTruthy();
    expect(dbUser.name).toBe(mockUser.name);
  });

  test('POST /api/v1/auth/login - Login via email address', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(mockUser.email);
  });

  test('POST /api/v1/auth/login - Login via mobile number', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        mobile: mockUser.mobile,
        password: mockUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('POST /api/v1/auth/login - Reject wrong password credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: mockUser.email,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login - Lock account after multiple failed attempts', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(mockUser);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: 'incorrect_password'
        });
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('locked');
  });
});
