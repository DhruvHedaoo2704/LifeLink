import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, Heart, User, Mail, Phone, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import { bloodTypes } from '../data/mockData';
import { getCurrentLocation } from '../utils/location';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    bloodType: 'O+',
    userType: 'donor',
    location: {
      lat: 0,
      lng: 0,
      address: '',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      // Simulate reverse geocoding
      const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setFormData(prev => ({
        ...prev,
        location: {
          lat: latitude,
          lng: longitude,
          address,
        },
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your location. Please enter it manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    try {
      const token = credentialResponse.credential;
      await googleLogin(token, formData.userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup failed:', error);
      alert('Google signup failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup failed');
    alert('Google signup failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <Droplet className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Join Life Link</h2>
          <p className="text-gray-600 mt-2">Create your account to start saving lives</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${formData.userType === 'donor' 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-red-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="userType"
                  value="donor"
                  checked={formData.userType === 'donor'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Heart className="h-5 w-5 mr-2" />
                Donate Blood
              </motion.label>
              
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${formData.userType === 'recipient' 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-red-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="userType"
                  value="recipient"
                  checked={formData.userType === 'recipient'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <User className="h-5 w-5 mr-2" />
                Need Blood
              </motion.label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your address"
                  />
                </div>
                <Button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  variant="secondary"
                  className="px-3"
                >
                  {locationLoading ? <LoadingSpinner size="sm" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Signup */}
        <div className="mt-6">
          {googleLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signup_with"
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;