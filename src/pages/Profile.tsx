import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Heart, 
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodType } from '../types';
import { bloodTypes } from '../data/mockData';
import Button from '../components/UI/Button';
import BloodDropAnimation from '../components/UI/BloodDropAnimation';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bloodType: user?.bloodType || 'O+',
    address: user?.location.address || '',
    isAvailable: user?.isAvailable || false,
    privacy: {
      shareLocation: user?.privacy?.shareLocation || false,
      shareContact: user?.privacy?.shareContact || false,  
      receiveAlerts: user?.privacy?.receiveAlerts || false,
    },
  });

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('privacy.')) {
      const privacyKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [privacyKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bloodType: formData.bloodType as BloodType,
      location: { ...user.location, address: formData.address },
      isAvailable: formData.isAvailable,
      privacy: formData.privacy,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodType: user.bloodType,
      address: user.location.address,
      isAvailable: user.isAvailable,
      privacy: user.privacy,
    });
    setEditing(false);
  };

  const donationStreak = Math.floor(user.donationCount / 3);
  const nextBadgeProgress = (user.donationCount % 3) / 3 * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-red-100">
                    {user.isDonor ? 'Blood Donor' : 'Recipient'} • {user.bloodType}
                  </p>
                </div>
              </div>
              <BloodDropAnimation size="lg" className="text-white" />
            </div>
            
            {user.isDonor && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{(user.donationCount || 0)}</p>
                  <p className="text-red-100 text-sm">Donations</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.points || 0}</p>
                  <p className="text-red-100 text-sm">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.badges?.length || 0}</p>
                  <p className="text-red-100 text-sm">Badges</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Profile Information
                  </h2>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="secondary" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="secondary" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type
                    </label>
                    {editing ? (
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                          {user.bloodType}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.location.address}</p>
                  )}
                </div>

                {/* Availability */}
                {user.isDonor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Availability Status
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={editing ? formData.isAvailable : user.isAvailable}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        I'm available for emergency blood donations
                      </span>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Share location with other users</span>
                      <input
                        type="checkbox"
                        name="privacy.shareLocation"
                        // Add ?. before privacy and before shareLocation
                        checked={editing ? formData.privacy?.shareLocation : user.privacy?.shareLocation || false}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Share contact information</span>
                      <input
                        type="checkbox"
                        name="privacy.shareContact"
                        checked={editing ? formData.privacy?.shareContact : user.privacy?.shareContact || false}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Receive emergency alerts</span>
                      <input
                        type="checkbox"
                        name="privacy.receiveAlerts"
                        checked={editing ? formData.privacy?.receiveAlerts : user.privacy?.receiveAlerts || false}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            {user.isDonor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Donations</span>
                    <span className="text-2xl font-bold text-red-600">{user.donationCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Points Earned</span>
                    <span className="text-2xl font-bold text-green-600">{user.points || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="text-2xl font-bold text-blue-600">{donationStreak}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Next Badge Progress</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(nextBadgeProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nextBadgeProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              
             {(user.badges?.length || 0) === 0 ? (
                <div className="text-center py-4">
                  <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No badges earned yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start donating to unlock achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {user.badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center"
                    >
                      <Heart className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-yellow-800">{badge.name}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="secondary">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                
                <Button className="w-full justify-start" variant="secondary">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
                
                <Button className="w-full justify-start" variant="secondary">
                  <User className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                
                <div className="pt-3 border-t border-gray-200">
                  <Button className="w-full justify-start" variant="danger">
                    Delete Account
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;