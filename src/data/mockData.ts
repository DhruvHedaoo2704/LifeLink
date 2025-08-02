import { User, BloodRequest, Donation, Badge, BloodType } from '../types';

export const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const badges: Badge[] = [
  {
    id: '1',
    name: 'First Drop',
    description: 'Made your first donation',
    icon: 'droplet',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Life Saver',
    description: 'Saved 5 lives through donations',
    icon: 'heart',
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Guardian Angel',
    description: 'Made 10 emergency donations',
    icon: 'star',
    rarity: 'epic',
  },
  {
    id: '4',
    name: 'Blood Hero',
    description: 'Donated 50+ times',
    icon: 'award',
    rarity: 'legendary',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.donor@email.com',
    name: 'John Smith',
    bloodType: 'O+',
    phone: '+1-555-0123',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY',
    },
    isAvailable: true,
    isDonor: true,
    isRecipient: false,
    donationCount: 12,
    points: 1200,
    badges: [badges[0], badges[1]],
    lastDonation: new Date('2024-01-15'),
    joinDate: new Date('2023-06-15'),
    privacy: {
      shareLocation: true,
      shareContact: true,
      receiveAlerts: true,
    },
  },
  {
    id: '2',
    email: 'jane.recipient@email.com',
    name: 'Jane Doe',
    bloodType: 'AB-',
    phone: '+1-555-0456',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Oak Ave, New York, NY',
    },
    isAvailable: false,
    isDonor: false,
    isRecipient: true,
    donationCount: 0,
    points: 0,
    badges: [],
    joinDate: new Date('2024-02-01'),
    privacy: {
      shareLocation: true,
      shareContact: true,
      receiveAlerts: true,
    },
  },
];

export const mockBloodRequests: BloodRequest[] = [
  {
    id: '1',
    recipientId: '2',
    recipient: mockUsers[1],
    bloodType: 'AB-',
    urgency: 'critical',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Oak Ave, New York, NY',
      hospital: 'New York General Hospital',
    },
    description: 'Emergency surgery required, need immediate blood transfusion',
    unitsNeeded: 3,
    createdAt: new Date('2024-01-20T10:30:00'),
    expiresAt: new Date('2024-01-20T16:30:00'),
    status: 'active',
    responses: [],
  },
];

export const mockDonations: Donation[] = [
  {
    id: '1',
    donorId: '1',
    donor: mockUsers[0],
    recipientId: '2',
    recipient: mockUsers[1],
    bloodType: 'O+',
    units: 1,
    location: 'City Hospital',
    date: new Date('2024-01-15'),
    points: 100,
  },
];

export const getCompatibleBloodTypes = (bloodType: BloodType): BloodType[] => {
  const compatibility: Record<BloodType, BloodType[]> = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  };
  
  return compatibility[bloodType] || [];
};