export interface User {
  id: string;
  email: string;
  name: string;
  bloodType: BloodType;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  isAvailable: boolean;
  isDonor: boolean;
  isRecipient: boolean;
  donationCount: number;
  points: number;
  badges: Badge[];
  lastDonation?: Date;
  joinDate: Date;
  role: 'donor' | 'recipient' | 'hospital' | 'blood_bank' | 'admin';
  emergencyContacts?: {
    primaryContact?: {
      name: string;
      phone: string;
      relation: string;
    };
    secondaryContact?: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  privacy: {
    shareLocation: boolean;
    shareContact: boolean;
    receiveAlerts: boolean;
  };
}

export interface BloodRequest {
  id: string;
  recipientId: string;
  recipient: User;
  bloodType: BloodType;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address: string;
    hospital: string;
  };
  description: string;
  unitsNeeded: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'fulfilled' | 'expired';
  responses: DonorResponse[];
}

export interface DonorResponse {
  id: string;
  donorId: string;
  donor: User;
  requestId: string;
  response: 'yes' | 'no';
  estimatedArrival?: string;
  message?: string;
  createdAt: Date;
}

export interface Donation {
  id: string;
  donorId: string;
  donor: User;
  recipientId: string;
  recipient: User;
  bloodType: BloodType;
  units: number;
  location: string;
  date: Date;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: 'donor' | 'recipient') => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  bloodType: BloodType;
  userType: 'donor' | 'recipient';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface EmergencyRequest {
  bloodType: BloodType;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  unitsNeeded: number;
  hospital: string;
  description: string;
  contactPerson: string;
  contactPhone: string;
}