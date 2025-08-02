import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Crown, Heart, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import BloodDropAnimation from '../components/UI/BloodDropAnimation';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('month');
  
  // Sort users by donation count for leaderboard
  const leaderboardUsers = [...mockUsers]
    .filter(u => u.isDonor)
    .sort((a, b) => b.donationCount - a.donationCount);

  const getPosition = (userId: string) => {
    return leaderboardUsers.findIndex(u => u.id === userId) + 1;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Award className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    }
  };

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
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <Award className="h-8 w-8 mr-3" />
                  Life Savers Leaderboard
                </h1>
                <p className="text-purple-100 text-lg">
                  Celebrating our community heroes who save lives
                </p>
              </div>
              <BloodDropAnimation size="lg" className="text-white" />
            </div>
            
            {user && user.isDonor && (
              <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Your Current Rank</p>
                    <p className="text-2xl font-bold">#{getPosition(user.id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100">Total Donations</p>
                    <p className="text-2xl font-bold">{user.donationCount}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Top Donors</h2>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {leaderboardUsers.map((donor, index) => (
                    <motion.div
                      key={donor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`
                        flex items-center space-x-4 p-4 rounded-lg border-2 transition-all
                        ${donor.id === user?.id 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                        ${getRankBadgeColor(index + 1)}
                      `}>
                        {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            {donor.name}
                            {donor.id === user?.id && (
                              <span className="text-purple-600 text-sm ml-2">(You)</span>
                            )}
                          </h3>
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                            {donor.bloodType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-red-500" />
                            {donor.donationCount} donations
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {donor.points} points
                          </span>
                          <span className="flex items-center">
                            <Award className="h-4 w-4 mr-1 text-blue-500" />
                            {donor.badges.length} badges
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{donor.donationCount}</p>
                        <p className="text-sm text-gray-500">donations</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Competition Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Competition</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Monthly Leader</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-900 mt-1">
                    {leaderboardUsers[0]?.name || 'No leader yet'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Total Community</span>
                  </div>
                  <p className="text-lg font-bold text-green-900 mt-1">
                    {mockUsers.filter(u => u.isDonor).length} Donors
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Lives Saved</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 mt-1">
                    {leaderboardUsers.reduce((sum, user) => sum + user.donationCount, 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Badges</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Drop</p>
                    <p className="text-xs text-gray-600">Make your first donation</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Life Saver</p>
                    <p className="text-xs text-gray-600">Save 5 lives</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Guardian Angel</p>
                    <p className="text-xs text-gray-600">10 emergency donations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;