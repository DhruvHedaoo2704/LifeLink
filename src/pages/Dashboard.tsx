import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockBloodRequests, mockDonations } from '../data/mockData';
import BloodDropAnimation from '../components/UI/BloodDropAnimation';
import Button from '../components/UI/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRequests, setActiveRequests] = useState(mockBloodRequests);
  const [recentDonations, setRecentDonations] = useState(mockDonations);

  if (!user) return null;

  const urgencyColors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
    critical: 'bg-red-200 text-red-900 border-red-400',
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-red-100 text-lg">
                  {user.isDonor ? 'Ready to save lives today?' : 'Your health dashboard'}
                </p>
              </div>
              <BloodDropAnimation size="lg" className="text-white" />
            </div>

            {user.isDonor && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.donationCount}</p>
                  <p className="text-red-100">Donations</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.points}</p>
                  <p className="text-red-100">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.badges.length}</p>
                  <p className="text-red-100">Badges</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {user.lastDonation ? Math.floor((new Date().getTime() - new Date(user.lastDonation).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                  <p className="text-red-100">Days Since</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Active Blood Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    Emergency Requests
                  </h2>
                  {user.isRecipient && (
                    <Link to="/emergency">
                      <Button size="sm">
                        Create Request
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6">
                {activeRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active emergency requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                                {request.bloodType}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[request.urgency]}`}>
                                {request.urgency.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {request.location.hospital}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {request.location.address}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {getTimeAgo(request.createdAt)}
                              </span>
                            </div>
                          </div>
                          {user.isDonor && (
                            <div className="flex space-x-2 ml-4">
                              <Button size="sm" variant="success">
                                Accept
                              </Button>
                              <Button size="sm" variant="secondary">
                                Pass
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Activity
                </h2>
              </div>

              <div className="p-6">
                {recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Heart className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Donation at {donation.location}
                            </p>
                            <p className="text-sm text-gray-600">
                              {donation.units} unit(s) of {donation.bloodType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            +{donation.points} points
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(donation.date)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user.isDonor && (
                  <Link to="/map" className="block">
                    <Button className="w-full justify-start" variant="secondary">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Donor Map
                    </Button>
                  </Link>
                )}
                {user.isRecipient && (
                  <Link to="/emergency" className="block">
                    <Button className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Request
                    </Button>
                  </Link>
                )}
                <Link to="/history" className="block">
                  <Button className="w-full justify-start" variant="secondary">
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <Link to="/leaderboard" className="block">
                  <Button className="w-full justify-start" variant="secondary">
                    <Award className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Availability Status */}
            {user.isDonor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {user.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <Button
                  className="w-full"
                  variant={user.isAvailable ? 'secondary' : 'primary'}
                >
                  {user.isAvailable ? 'Set Unavailable' : 'Set Available'}
                </Button>
              </motion.div>
            )}

            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Type</span>
                  <span className="font-medium text-red-600">{user.bloodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium">
                    {user.isDonor ? 'Donor' : 'Recipient'}
                  </span>
                </div>
                {user.isDonor && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Donations</span>
                      <span className="font-medium">{user.donationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points</span>
                      <span className="font-medium text-green-600">{user.points}</span>
                    </div>
                  </>
                )}
              </div>
              <Link to="/profile" className="block mt-4">
                <Button className="w-full" variant="secondary">
                  Edit Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;