import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';

let mongoServer;
let recipientToken;
let recipientId;
let donorToken;
let donorId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  // Clear databases
  await User.deleteMany({});
  await BloodRequest.deleteMany({});

  // Seed Recipient User
  const recipientRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Patient User',
      email: 'patient.user@email.com',
      mobile: '+918888888888',
      password: 'patientpassword123',
      bloodGroup: 'AB+',
      role: 'recipient',
      location: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Bengaluru Core Hospital'
      }
    });

  recipientToken = recipientRes.body.data.accessToken;
  recipientId = recipientRes.body.data.user._id;

  // Seed Compatible Available Donor User (O+) nearby
  const donorRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Hero Donor User',
      email: 'hero.donor@email.com',
      mobile: '+917777777777',
      password: 'donorpassword123',
      bloodGroup: 'O+',
      role: 'donor',
      location: {
        lat: 12.9720,
        lng: 77.5950,
        address: 'Bengaluru Core Cafe'
      }
    });

  donorToken = donorRes.body.data.accessToken;
  donorId = donorRes.body.data.user._id;
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Blood Requests API Endpoint Tests', () => {
  let createdRequestId;

  test('POST /api/v1/requests - Create an emergency request as Recipient', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        bloodType: 'AB+',
        urgency: 'critical',
        unitsNeeded: 2,
        hospital: 'St. Johns General Hospital',
        address: 'Healthcare St, Bengaluru',
        description: 'Requires transfusion after trauma',
        location: {
          lat: 12.9716,
          lng: 77.5946
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Created');
    expect(res.body.data.bloodType).toBe('AB+');
    
    createdRequestId = res.body.data._id;
  });

  test('GET /api/v1/requests - Retrieve blood requests list with proximity filters', async () => {
    const res = await request(app)
      .get('/api/v1/requests')
      .set('Authorization', `Bearer ${donorToken}`)
      .query({
        lat: 12.9716,
        lng: 77.5946,
        maxDistanceKm: 5
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requests.length).toBeGreaterThan(0);
    expect(res.body.data.requests[0]._id).toBe(createdRequestId);
  });

  test('POST /api/v1/requests/:id/respond - Donor responds YES to blood request', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${createdRequestId}/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        response: 'yes',
        estimatedArrival: '10 mins',
        message: 'I am on my way to donate!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Accepted');
    expect(res.body.data.responses.length).toBe(1);
    expect(res.body.data.responses[0].donorId).toBe(donorId);
  });

  test('PATCH /api/v1/requests/:id/status - Update request status to traveling', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        status: 'Donor Traveling',
        note: 'Donor has boarded a vehicle'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Donor Traveling');
  });

  test('PATCH /api/v1/requests/:id/status - Mark request as Donation Completed (rewards donor)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        status: 'Donation Completed',
        note: 'Transfusion successful'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Donation Completed');

    const updatedDonor = await User.findById(donorId);
    expect(updatedDonor.points).toBeGreaterThan(0);
    expect(updatedDonor.donationCount).toBe(1);
    expect(updatedDonor.badges.length).toBeGreaterThan(0);
  });
});
