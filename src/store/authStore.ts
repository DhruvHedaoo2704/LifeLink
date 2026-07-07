import { create } from 'zustand';
import { User, RegisterData } from '../types';
import apiClient from '../api/apiClient';

const mapUserFields = (user: any): User | null => {
  if (!user) return null;
  return {
    ...user,
    id: user._id || user.id,
    bloodType: user.bloodGroup || user.bloodType || 'O+',
    phone: user.mobile || user.phone || '',
    address: user.address || user.location?.address || '',
    location: {
      lat: user.currentLocation?.coordinates?.[1] || user.location?.lat || 17.3850,
      lng: user.currentLocation?.coordinates?.[0] || user.location?.lng || 78.4867,
      address: user.address || user.location?.address || ''
    },
    isAvailable: user.availabilityStatus !== undefined ? user.availabilityStatus : (user.isAvailable || false),
    isDonor: user.role === 'donor' || user.isDonor || false,
    isRecipient: user.role === 'recipient' || user.isRecipient || false,
  };
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  login: (identifier: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('lifelink_token'),
  isAuthenticated: !!localStorage.getItem('lifelink_token'),
  isLoading: false,
  error: null,

  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem('lifelink_token', accessToken);
    } else {
      localStorage.removeItem('lifelink_token');
    }
    set({ accessToken, isAuthenticated: !!accessToken });
  },

  setUser: (user) => set({ user: mapUserFields(user) }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),


  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', {
        email: identifier.includes('@') ? identifier : undefined,
        mobile: !identifier.includes('@') ? identifier : undefined,
        password
      });

      const { user, accessToken } = response.data.data;
      
      // Save state
      get().setAccessToken(accessToken);
      set({ user: mapUserFields(user), isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  googleLogin: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/google-login', { token });
      const { user, accessToken } = response.data.data;

      // Save state
      get().setAccessToken(accessToken);
      set({ user: mapUserFields(user), isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Google login failed' });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        mobile: userData.phone, // Map phone to mobile on backend
        password: userData.password,
        bloodGroup: userData.bloodType,
        role: userData.userType,
        location: userData.location
      });

      const { user, accessToken } = response.data.data;

      // Save state
      get().setAccessToken(accessToken);
      set({ user: mapUserFields(user), isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    try {
      const token = get().accessToken;
      await apiClient.post('/auth/logout', { refreshToken: token });
    } catch (err) {
      // Ignore failures
    } finally {
      get().setAccessToken(null);
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  fetchProfile: async () => {
    if (!get().accessToken) return;
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/users/profile');
      set({ user: mapUserFields(response.data.data), isLoading: false });
    } catch (err: any) {
      get().setAccessToken(null);
      set({ user: null, isLoading: false, error: err.message });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.phone !== undefined ? profileData.phone : (profileData as any).mobile,
        bloodGroup: profileData.bloodType !== undefined ? profileData.bloodType : (profileData as any).bloodGroup,
        address: profileData.address !== undefined ? profileData.address : profileData.location?.address,
        isAvailable: profileData.isAvailable !== undefined ? profileData.isAvailable : (profileData as any).availabilityStatus,
        privacy: profileData.privacy,
        location: profileData.location
      };
      const response = await apiClient.put('/users/profile', payload);
      set({ user: mapUserFields(response.data.data), isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Profile update failed' });
      throw err;
    }
  }
}));
