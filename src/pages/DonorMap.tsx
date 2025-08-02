import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Users, Filter, Heart, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { getCurrentLocation, calculateDistance, formatDistance } from '../utils/location';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const DonorMap: React.FC = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState(mockUsers.filter(u => u.isDonor && u.isAvailable));
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const position = await getCurrentLocation();
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        // Use user's stored location as fallback
        if (user?.location) {
          setUserLocation({
            lat: user.location.lat,
            lng: user.location.lng,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [user]);

  const filteredDonors = donors.filter(donor => 
    selectedBloodType === 'all' || donor.bloodType === selectedBloodType
  );

  const donorsWithDistance = userLocation
    ? filteredDonors.map(donor => ({
        ...donor,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          donor.location.lat,
          donor.location.lng
        ),
      })).sort((a, b) => a.distance - b.distance)
    : filteredDonors;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading donor map..." />
      </div>
    );
  }

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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapPin className="h-6 w-6 text-red-600 mr-2" />
                Nearby Donors
              </h1>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Blood Types</option>
                  <option value="O-">O-</option>
                  <option value="O+">O+</option>
                  <option value="A-">A-</option>
                  <option value="A+">A+</option>
                  <option value="B-">B-</option>
                  <option value="B+">B+</option>
                  <option value="AB-">AB-</option>
                  <option value="AB+">AB+</option>
                </select>
                <Button variant="secondary" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Available Donors</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">{filteredDonors.length}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Navigation className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Within 5km</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {userLocation ? donorsWithDistance.filter(d => d.distance <= 5).length : '-'}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">Emergency Ready</span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {filteredDonors.filter(d => d.donationCount > 5).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Interactive Map</h2>
          </div>
          <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-b-xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Map</h3>
                <p className="text-gray-500">
                  In production, this would show a real map with donor locations
                </p>
              </div>
            </div>
            
            {/* Animated pins */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                  <MapPin className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Donor List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Donor Directory</h2>
          </div>
          
          <div className="p-6">
            {donorsWithDistance.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No donors found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donorsWithDistance.map((donor, index) => (
                  <motion.div
                    key={donor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Heart className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                          <p className="text-sm text-gray-600">Blood Type: {donor.bloodType}</p>
                        </div>
                      </div>
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                        {donor.bloodType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {userLocation && `${formatDistance(donor.distance)} away`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{donor.donationCount} donations</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-green-600 font-medium">Available now</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Contact
                      </Button>
                      <Button size="sm" variant="secondary">
                        View Profile
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorMap;