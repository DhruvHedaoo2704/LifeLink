import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import { bloodTypes } from '../data/mockData';
import { getCurrentLocation } from '../utils/location';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
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
      const address = `Hyderabad, TS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      
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
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Top Header Row matching Mockup 2 */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-1">
          <Droplet className="h-7 w-7 text-red-600 fill-red-600" />
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">LifeLink</span>
        </Link>
        <div className="text-xs font-bold text-red-600">
          Emergency: <span className="hover:underline">9399239147</span>
        </div>
      </header>

      {/* Main Form Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden my-4"
        >
          {/* Tabs header */}
          <div className="flex border-b border-gray-100">
            <Link to="/login" className="flex-1 py-4 text-center font-semibold text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Login
            </Link>
            <button className="flex-1 py-4 text-center font-bold text-sm border-b-2 border-red-600 text-red-600">
              Sign Up
            </button>
          </div>

          <div className="p-8 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-sm text-gray-400">Join LifeLink to start saving lives.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Option Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Register As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, userType: 'donor' }))}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                      formData.userType === 'donor'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, userType: 'recipient' }))}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                      formData.userType === 'recipient'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Recipient / Patient
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Enter mobile number"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Create password"
                />
              </div>

              {/* Blood Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Blood Group
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all text-gray-700"
                >
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Location Input with Action Button */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Home Location / City
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                    placeholder="Enter city or address"
                  />
                  <Button
                    type="button"
                    onClick={getLocation}
                    disabled={locationLoading}
                    variant="secondary"
                    className="px-3 hover:bg-gray-100 transition-all"
                  >
                    {locationLoading ? <LoadingSpinner size="sm" /> : <MapPin className="h-4 w-4 text-red-500" />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Register'}
              </Button>
            </form>

            {/* Bottom text link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <Link to="/login" className="text-red-500 font-bold hover:underline">
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        Demo credentials: john.donor@email.com / password
      </footer>
    </div>
  );
};

export default Register;