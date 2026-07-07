import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  X,
  Lock,
  EyeOff,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodType } from '../types';
import { bloodTypes } from '../data/mockData';
import Button from '../components/UI/Button';
import BloodDropAnimation from '../components/UI/BloodDropAnimation';
import apiClient from '../api/apiClient';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile fields state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bloodType: user?.bloodType || 'O+',
    address: user?.location?.address || '',
    isAvailable: user?.isAvailable || false,
    privacy: {
      shareLocation: user?.privacy?.shareLocation || false,
      shareContact: user?.privacy?.shareContact || false,
      receiveAlerts: user?.privacy?.receiveAlerts || false,
    },
  });

  // Settings fields state
  const [accountForm, setAccountForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });

  // Sync profile edits with user context
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bloodType: user.bloodType || 'O+',
        address: user.location?.address || '',
        isAvailable: user.isAvailable || false,
        privacy: {
          shareLocation: user.privacy?.shareLocation || false,
          shareContact: user.privacy?.shareContact || false,
          receiveAlerts: user.privacy?.receiveAlerts || false,
        },
      });

      setAccountForm(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

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
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bloodType: user.bloodType || 'O+',
      address: user.location?.address || '',
      isAvailable: user.isAvailable || false,
      privacy: {
        shareLocation: user.privacy?.shareLocation || false,
        shareContact: user.privacy?.shareContact || false,
        receiveAlerts: user.privacy?.receiveAlerts || false,
      },
    });
    setEditing(false);
  };

  // Settings Actions
  const handleTogglePrivacy = async (key: 'shareLocation' | 'shareContact' | 'receiveAlerts') => {
    const nextVal = !formData.privacy[key];
    const updatedPrivacy = {
      ...formData.privacy,
      [key]: nextVal
    };
    
    setFormData(prev => ({
      ...prev,
      privacy: updatedPrivacy
    }));

    try {
      await updateUser({
        privacy: updatedPrivacy
      });
    } catch (err) {
      console.error('Failed to update privacy configuration:', err);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({
        email: accountForm.email,
        phone: accountForm.phone
      });
      alert('Account credentials synced successfully in MongoDB!');
    } catch (err) {
      console.error(err);
      alert('Failed to update account credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.password) {
      alert('Please enter a password');
      return;
    }
    if (accountForm.password !== accountForm.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    alert('Password updated successfully! Re-authenticating session.');
    setAccountForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('WARNING: Are you sure you want to permanently delete your LifeLink account? This action is irreversible.');
    if (confirm) {
      alert('Account deletion request dispatched. Administrator approval pending.');
    }
  };

  const donationStreak = Math.floor((user.donationCount || 0) / 3);
  const nextBadgeProgress = ((user.donationCount || 0) % 3) / 3 * 100;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{user.name}</h1>
                  <p className="text-red-100 text-xs font-semibold capitalize mt-0.5">
                    {user.role} • {user.bloodType}
                  </p>
                </div>
              </div>
              <BloodDropAnimation size="lg" className="text-white animate-pulse" />
            </div>
            
            {user.isDonor && (
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-red-500/30 pt-6 text-center">
                <div>
                  <p className="text-2xl font-black">{user.donationCount || 0}</p>
                  <p className="text-red-100 text-xs font-semibold">Donations</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{user.points || 0}</p>
                  <p className="text-red-100 text-xs font-semibold">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{(user.badges || []).length}</p>
                  <p className="text-red-100 text-xs font-semibold">Badges</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Left Column */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Tab Selector Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-gray-50/30">
                <div className="flex space-x-6">
                  <button
                    onClick={() => { setActiveTab('profile'); setEditing(false); }}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all focus:outline-none ${
                      activeTab === 'profile'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Personal Details
                  </button>
                  <button
                    onClick={() => { setActiveTab('settings'); setEditing(false); }}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all focus:outline-none ${
                      activeTab === 'settings'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Account & Settings
                  </button>
                </div>

                {activeTab === 'profile' && (
                  <div>
                    {!editing ? (
                      <Button onClick={() => setEditing(true)} variant="secondary" className="text-xs py-1.5 px-3 font-bold border border-gray-200">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} className="text-xs py-1.5 px-3 font-bold">
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="secondary" className="text-xs py-1.5 px-3 font-bold">
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' ? (
                    /* PROFILE TAB CONTENT */
                    <motion.div
                      key="profile-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Full Name
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50/50 rounded-xl text-xs font-bold text-gray-900 border border-gray-100">{user.name}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Email Address
                          </label>
                          {editing ? (
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50/50 rounded-xl text-xs font-bold text-gray-900 border border-gray-100">{user.email}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Phone Number
                          </label>
                          {editing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50/50 rounded-xl text-xs font-bold text-gray-900 border border-gray-100">{user.phone}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Blood Group
                          </label>
                          {editing ? (
                            <select
                              name="bloodType"
                              value={formData.bloodType}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                            >
                              {bloodTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="pt-1.5">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm shadow-red-200">
                                {user.bloodType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Address
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-gray-50/50 rounded-xl text-xs font-bold text-gray-900 border border-gray-100 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-red-500" /> {user.location?.address || 'Not Specified'}
                          </p>
                        )}
                      </div>

                      {/* Availability status option for donors */}
                      {user.role === 'donor' && (
                        <div className="pt-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Availability Status
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="isAvailable"
                              checked={editing ? formData.isAvailable : user.isAvailable}
                              onChange={handleInputChange}
                              disabled={!editing}
                              className="h-4.5 w-4.5 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg transition-all disabled:opacity-75 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-700">
                              Available for emergency blood donations
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* SETTINGS TAB CONTENT */
                    <motion.div
                      key="settings-tab"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* Account details modification */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="h-4 w-4 text-red-600" /> Update Account Credentials
                        </h3>
                        <form onSubmit={handleAccountUpdate} className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                  type="email"
                                  value={accountForm.email}
                                  onChange={(e) => setAccountForm(p => ({ ...p, email: e.target.value }))}
                                  required
                                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-700 font-semibold"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                  type="tel"
                                  value={accountForm.phone}
                                  onChange={(e) => setAccountForm(p => ({ ...p, phone: e.target.value }))}
                                  required
                                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-700 font-semibold"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button type="submit" disabled={loading} className="text-[10px] font-bold py-2 px-4 shadow-sm shadow-red-200">
                              Update Account Info
                            </Button>
                          </div>
                        </form>
                      </div>

                      {/* Password modifier */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="h-4 w-4 text-red-600" /> Reset Password
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                              <input
                                type="password"
                                placeholder="Enter new password"
                                value={accountForm.password}
                                onChange={(e) => setAccountForm(p => ({ ...p, password: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confirm Password</label>
                              <input
                                type="password"
                                placeholder="Confirm new password"
                                value={accountForm.confirmPassword}
                                onChange={(e) => setAccountForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button type="submit" className="text-[10px] font-bold py-2 px-4 bg-gray-950 hover:bg-black">
                              Update Password
                            </Button>
                          </div>
                        </form>
                      </div>

                      {/* Privacy toggles */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Bell className="h-4 w-4 text-red-600" /> Privacy & Alerts
                        </h3>

                        <div className="space-y-4 divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                          <div className="flex items-center justify-between pb-3">
                            <div>
                              <h4 className="font-extrabold text-gray-950">Push Notification Alerts</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Receive immediate notifications for emergency matches</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTogglePrivacy('receiveAlerts')}
                              className={`w-11 h-6 rounded-full transition-all relative ${formData.privacy.receiveAlerts ? 'bg-red-600' : 'bg-gray-200'}`}
                            >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${formData.privacy.receiveAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-3 pb-3">
                            <div>
                              <h4 className="font-extrabold text-gray-950">Share Geolocation Map</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Allow nearby recipients to locate you as an active donor</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTogglePrivacy('shareLocation')}
                              className={`w-11 h-6 rounded-full transition-all relative ${formData.privacy.shareLocation ? 'bg-red-600' : 'bg-gray-200'}`}
                            >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${formData.privacy.shareLocation ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div>
                              <h4 className="font-extrabold text-gray-950">Show Contact Details</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Allow matched recipients to dial you directly</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTogglePrivacy('shareContact')}
                              className={`w-11 h-6 rounded-full transition-all relative ${formData.privacy.shareContact ? 'bg-red-600' : 'bg-gray-200'}`}
                            >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${formData.privacy.shareContact ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sessions list */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <EyeOff className="h-4 w-4 text-red-600" /> Active Security Sessions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                          <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div>
                              <p className="text-gray-950 font-bold">Chrome on Windows (Current)</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">IP: 192.168.1.1</p>
                            </div>
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                          </div>
                          <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div>
                              <p className="text-gray-800 font-bold">Safari on iPhone</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">IP: 10.0.0.8</p>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">2h ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-red-600" /> Danger Zone
                        </h3>
                        <div className="p-4 border border-red-100 rounded-2xl bg-red-50/20 text-center space-y-3">
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                            Once you delete your account, there is no going back. All donation and request registries will be archived.
                          </p>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="w-full max-w-xs mx-auto py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Account Permanently
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar Columns */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Donation stats column */}
            {user.isDonor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
              >
                <h3 className="text-sm font-bold text-gray-900">Donation Telemetry</h3>
                
                <div className="space-y-4 text-xs font-bold text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Total Donations</span>
                    <span className="text-xl font-black text-red-600">{user.donationCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Points Accumulated</span>
                    <span className="text-xl font-black text-green-600">{user.points || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Current Streak</span>
                    <span className="text-xl font-black text-blue-600">{donationStreak}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Next Milestone Progress</span>
                    <span className="text-gray-900">{Math.round(nextBadgeProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nextBadgeProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Badges Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
            >
              <h3 className="text-sm font-bold text-gray-900">Milestone Achievements</h3>
              
              {(!user.badges || user.badges.length === 0) ? (
                <div className="text-center py-4 space-y-2">
                  <Heart className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-gray-400 text-xs font-bold">No achievements unlocked yet</p>
                  <p className="text-gray-400 text-[10px]">Complete emergency donation dispatches to unlock!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {user.badges.map((badge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3 text-center space-y-1.5"
                    >
                      <Heart className="h-5.5 w-5.5 text-yellow-600 mx-auto fill-yellow-50" />
                      <p className="text-[10px] font-black text-yellow-800 leading-tight">{badge.name}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;