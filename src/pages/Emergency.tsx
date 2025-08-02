import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  User, 
  Droplet,
  Clock,
  Heart,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmergencyRequest, BloodType } from '../types';
import { bloodTypes } from '../data/mockData';
import { getCurrentLocation } from '../utils/location';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Emergency: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<EmergencyRequest>({
    bloodType: user?.bloodType || 'O+',
    urgency: 'high',
    unitsNeeded: 1,
    hospital: '',
    description: '',
    contactPerson: user?.name || '',
    contactPhone: user?.phone || '',
  });

  const urgencyOptions = [
    { value: 'low', label: 'Low', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'medium', label: 'Medium', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'critical', label: 'Critical', color: 'text-red-700 bg-red-100 border-red-300' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'unitsNeeded' ? parseInt(value) : value 
    }));
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await getCurrentLocation();
      // In a real app, you'd reverse geocode to get the address
      console.log('Current location:', position.coords);
      alert('Location captured! In a real app, this would auto-fill the hospital field.');
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your location. Please enter the hospital manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call to create emergency request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Emergency request sent! Nearby donors will be notified immediately.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit emergency request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isRecipient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only recipients can create emergency requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Emergency Blood Request</h1>
                <p className="text-red-100">Create an urgent request for blood donation</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Blood Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="inline h-4 w-4 mr-1" />
                  Blood Type Required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units Needed
                </label>
                <input
                  type="number"
                  name="unitsNeeded"
                  value={formData.unitsNeeded}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="inline h-4 w-4 mr-1" />
                Urgency Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {urgencyOptions.map(option => (
                  <motion.label
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${formData.urgency === option.value 
                        ? option.color + ' border-2' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={formData.urgency === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    {option.label}
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Location Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Hospital/Medical Facility
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter hospital name and address"
                />
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Details
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Briefly describe the medical emergency and urgency..."
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Primary contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Emergency contact number"
                />
              </div>
            </div>

            {/* Warning Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This request will be sent to all compatible donors within 10km of your location. 
                    Please ensure all information is accurate and the emergency is genuine.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Emergency Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Emergency;