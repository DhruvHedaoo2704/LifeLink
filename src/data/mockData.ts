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
];export const mockUsers: User[] = [
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
    role: 'donor',
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
    role: 'recipient',
    privacy: {
      shareLocation: true,
      shareContact: true,
      receiveAlerts: true,
    },
  },
  {
    id: '3',
    email: 'sarah.donor@email.com',
    name: 'Sarah Connor',
    bloodType: 'A+',
    phone: '+1-555-0789',
    location: {
      lat: 40.7306,
      lng: -73.9352,
      address: '789 Pine Rd, Queens, NY',
    },
    isAvailable: true,
    isDonor: true,
    isRecipient: false,
    donationCount: 8,
    points: 800,
    badges: [badges[0]],
    lastDonation: new Date('2024-02-10'),
    joinDate: new Date('2023-08-20'),
    role: 'donor',
    privacy: {
      shareLocation: true,
      shareContact: false,
      receiveAlerts: true,
    },
  },
  {
    id: '4',
    email: 'david.donor@email.com',
    name: 'David Miller',
    bloodType: 'B-',
    phone: '+1-555-0987',
    location: {
      lat: 40.6782,
      lng: -73.9442,
      address: '101 Elm St, Brooklyn, NY',
    },
    isAvailable: true,
    isDonor: true,
    isRecipient: false,
    donationCount: 15,
    points: 1500,
    badges: [badges[0], badges[1], badges[2]],
    lastDonation: new Date('2024-03-01'),
    joinDate: new Date('2023-05-10'),
    role: 'donor',
    privacy: {
      shareLocation: true,
      shareContact: true,
      receiveAlerts: true,
    },
  }
];

export const mockBloodRequests: BloodRequest[] = [];
export const mockDonations: Donation[] = [];

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