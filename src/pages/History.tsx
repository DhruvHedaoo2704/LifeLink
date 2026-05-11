import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Clock, 
  MapPin, 
  Award, 
  TrendingUp, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDonations } from '../data/mockData';
import Button from '../components/UI/Button';

const History: React.FC = () => {
  const { user } = useAuth();
  const [donations] = useState(mockDonations);
  const [filter, setFilter] = useState<'all' | 'received' | 'donated'>('all');

  if (!user) return null;

  const filteredDonations = donations.filter(donation => {
    if (filter === 'received') return donation.recipientId === user.id;
    if (filter === 'donated') return donation.donorId === user.id;
    return donation.donorId === user.id || donation.recipientId === user.id;
  });

  const totalPoints = filteredDonations
    .filter(d => d.donorId === user.id)
    .reduce((sum, d) => sum + d.points, 0);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const nextDonationDate = user.lastDonation 
    ? new Date(new Date(user.lastDonation).getTime() + 56 * 24 * 60 * 60 * 1000) 
    : new Date();

  const canDonateAgain = !user.lastDonation || new Date() >= nextDonationDate;
  const daysUntilEligible = user.lastDonation 
    ? Math.max(0, Math.ceil((nextDonationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                Donation History
              </h1>
              <div className="flex items-center space-x-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Activity</option>
                  {user.isDonor && <option value="donated">My Donations</option>}
                  {user.isRecipient && <option value="received">Blood Received</option>}
                </select>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Heart className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">Total Donations</span>
                </div>
                <p className="text-3xl font-bold text-red-900 mt-2">{user.donationCount}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Points Earned</span>
                </div>
                <p className="text-3xl font-bold text-green-900 mt-2">{totalPoints}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Lives Saved</span>
                </div>
                <p className="text-3xl font-bold text-blue-900 mt-2">{user.donationCount}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Next Eligible</span>
                </div>
                <p className="text-lg font-bold text-purple-900 mt-2">
                  {canDonateAgain ? 'Now' : `${daysUntilEligible}d`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
              </div>
              
              <div className="p-6">
                {filteredDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No donation history yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Start donating to build your impact history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredDonations.map((donation, index) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0"
                      >
                        {/* Timeline line */}
                        {index < filteredDonations.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className="bg-red-100 p-3 rounded-full">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {donation.donorId === user.id ? 'Blood Donated' : 'Blood Received'}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                {donation.units} unit(s) of {donation.bloodType} at {donation.location}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {getTimeAgo(donation.date)}
                                </span>
                                {donation.donorId === user.id && (
                                  <span className="flex items-center text-green-600 font-medium">
                                    <Award className="h-4 w-4 mr-1" />
                                    +{donation.points} points
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {donation.bloodType}
                            </span>
                          </div>
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
            {/* Donation Eligibility */}
            {user.isDonor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Status</h3>
                
                <div className={`p-4 rounded-lg ${canDonateAgain ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center mb-2">
                    <Clock className={`h-5 w-5 mr-2 ${canDonateAgain ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className={`font-medium ${canDonateAgain ? 'text-green-800' : 'text-yellow-800'}`}>
                      {canDonateAgain ? 'Eligible to Donate' : 'Cooldown Period'}
                    </span>
                  </div>
                  <p className={`text-sm ${canDonateAgain ? 'text-green-700' : 'text-yellow-700'}`}>
                    {canDonateAgain 
                      ? 'You can donate blood now!' 
                      : `Next donation available in ${daysUntilEligible} days`
                    }
                  </p>
                </div>
                
                {user.lastDonation && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Last donation: {getTimeAgo(user.lastDonation)}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              
              {(user.badges?.length || 0) === 0 ? (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No badges earned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <Award className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">{badge.name}</p>
                        <p className="text-xs text-yellow-600">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Monthly Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Donations</span>
                  <span className="text-2xl font-bold text-red-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Points Earned</span>
                  <span className="text-2xl font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rank</span>
                  <span className="text-2xl font-bold text-blue-600">#42</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Keep up the great work! 💪
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;