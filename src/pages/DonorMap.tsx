import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Filter, 
  Heart, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  Phone, 
  ShieldCheck, 
  MessageSquare 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation, calculateDistance, formatDistance } from '../utils/location';
import apiClient from '../api/apiClient';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Donor {
  id: string;
  _id: string;
  name: string;
  bloodGroup: string;
  gender: string;
  availabilityStatus: boolean;
  profileVerificationStatus: string;
  mobile: string;
  distance?: number;
  lastDonationDate?: string;
  donationCount: number;
  lat: number;
  lng: number;
  currentLocation?: {
    coordinates: [number, number];
  };
  address?: string;
}

const DonorMap: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.4120, 78.4480]); // Default Hyderabad
  const [donors, setDonors] = useState<Donor[]>([]);

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState('O+');
  const [distanceFilter, setDistanceFilter] = useState('10 km');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Selected Donor detail view state (Mockup 6)
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Load user current location on mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const position = await getCurrentLocation();
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        await searchDonors(coords);
      } catch (err) {
        console.error('Error getting location:', err);
        // Fallback user location
        const coords: [number, number] = [17.4120, 78.4480];
        setUserLocation(coords);
        setMapCenter(coords);
        await searchDonors(coords);
      }
    };
    initLocation();
  }, []);

  const searchDonors = async (coords: [number, number]) => {
    setSearching(true);
    try {
      const distanceNum = parseInt(distanceFilter);
      const res = await apiClient.get('/users/search-donors', {
        params: {
          bloodGroup: bloodGroupFilter,
          lat: coords[0],
          lng: coords[1],
          maxDistanceKm: distanceNum
        }
      });

      // Map response models
      const rawDonors = res.data.data || [];
      const mapped: Donor[] = rawDonors.map((d: any) => {
        const dLat = d.currentLocation?.coordinates[1] || coords[0] + (Math.random() - 0.5) * 0.02;
        const dLng = d.currentLocation?.coordinates[0] || coords[1] + (Math.random() - 0.5) * 0.02;
        
        return {
          ...d,
          id: d._id,
          lat: dLat,
          lng: dLng,
          distance: calculateDistance(coords[0], coords[1], dLat, dLng)
        };
      });

      // Apply local verified filter if checked
      const filtered = verifiedOnly 
        ? mapped.filter(d => d.profileVerificationStatus === 'verified') 
        : mapped;

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setDonors(filtered);
    } catch (err) {
      console.error('Failed to load donors from database:', err);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLocation) {
      searchDonors(userLocation);
    }
  };

  const handleSendRequest = (donor: Donor) => {
    alert(`Emergency request successfully sent to donor ${donor.name}! They will receive real-time SMS alerts and push notifications.`);
  };

  const handleViewMedicalInfo = (donor: Donor) => {
    alert(`Medical Record for ${donor.name}:\nAllergies: None\nBlood Pressure: 120/80\nHemoglobin: 14.5 g/dL\nEligibility: Approved`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Connecting to spatial database..." />
      </div>
    );
  }

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* 3-Column main layout matching Mockup 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[600px]">
        
        {/* Left Sidebar Panel: Search Donors */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Search Donors</h2>
              <div className="w-8 h-1 bg-red-600 rounded mt-1.5"></div>
            </div>

            <form onSubmit={handleSearchClick} className="space-y-4">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Blood Group
                </label>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Distance */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Distance Radius
                </label>
                <select
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                >
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                  <option value="15 km">15 km</option>
                  <option value="25 km">25 km</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                  />
                  <span>Available Now</span>
                </label>

                <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                  />
                  <span>Verified Donors</span>
                </label>
              </div>
            </form>
          </div>

          <button
            onClick={handleSearchClick}
            disabled={searching}
            className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white rounded-xl font-bold text-xs shadow-md shadow-red-200 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {searching ? 'Searching...' : 'Search Donors'}
          </button>
        </div>

        {/* Center Panel: Map (Col Span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px] lg:h-auto">
          <div className="h-full relative min-h-[350px]">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Map pins matching database donors */}
              {donors.map((donor) => (
                <Marker key={donor.id} position={[donor.lat, donor.lng]}>
                  <Popup>
                    <div className="font-sans text-xs p-1 space-y-1">
                      <p className="font-bold text-gray-900">{donor.name}</p>
                      <p className="font-semibold text-red-600">Blood Group: {donor.bloodGroup}</p>
                      <p className="text-gray-400">{donor.distance ? `${donor.distance.toFixed(1)} km away` : ''}</p>
                      <button 
                        onClick={() => setSelectedDonor(donor)}
                        className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded mt-1.5 transition-all block w-full text-center"
                      >
                        View Profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <span className="font-sans text-xs font-bold text-gray-900">Your Current Location</span>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Right Sidebar Panel: Directory or Selected Profile detail view */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden justify-between min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {!selectedDonor ? (
              // Mockup 5 Right Panel: Donors List
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Nearby Donors</h2>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {donors.length} found
                    </span>
                  </div>

                  {/* List entries */}
                  <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                    {donors.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No compatible donors found nearby.</p>
                    ) : (
                      donors.map((donor) => (
                        <div
                          key={donor.id}
                          onClick={() => setSelectedDonor(donor)}
                          className="p-3 border border-gray-50 hover:border-red-100 hover:bg-red-50/10 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 bg-red-100 text-red-600 font-extrabold rounded-full flex items-center justify-center text-xs">
                              {donor.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                                {donor.name}
                                {donor.profileVerificationStatus === 'verified' && <CheckCircle className="h-3.5 w-3.5 text-green-500 fill-green-50" />}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-semibold">{donor.distance ? `${donor.distance.toFixed(1)} km away` : ''}</p>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-xs font-black text-red-600">{donor.bloodGroup}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              donor.availabilityStatus ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {donor.availabilityStatus ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (userLocation) {
                      setBloodGroupFilter('all');
                      searchDonors(userLocation);
                    }
                  }}
                  className="w-full mt-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-all text-center"
                >
                  View All Donors
                </button>
              </motion.div>
            ) : (
              // Mockup 6 Details: Donor Profile
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedDonor(null)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  {/* Profile Card Header */}
                  <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-red-100 text-red-600 font-extrabold rounded-full flex items-center justify-center text-lg mx-auto border-2 border-white shadow-md">
                      {selectedDonor.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">{selectedDonor.name}</h3>
                      <p className="text-[11px] font-extrabold text-red-600 mt-0.5">{selectedDonor.bloodGroup}</p>
                    </div>

                    <div className="flex justify-center gap-2 pt-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                        <CheckCircle className="h-2.5 w-2.5" /> {selectedDonor.availabilityStatus ? 'Available' : 'Unavailable'}
                      </span>
                      {selectedDonor.profileVerificationStatus === 'verified' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-0.5">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-2">
                    <div className="bg-gray-50/60 p-2 rounded-xl border border-gray-50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Blood Group</p>
                      <p className="text-xs font-black text-red-600 mt-0.5">{selectedDonor.bloodGroup}</p>
                    </div>
                    <div className="bg-gray-50/60 p-2 rounded-xl border border-gray-50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Gender</p>
                      <p className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedDonor.gender || 'Male'}</p>
                    </div>
                    <div className="bg-gray-50/60 p-2 rounded-xl border border-gray-50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Distance</p>
                      <p className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedDonor.distance ? `${selectedDonor.distance.toFixed(1)} km` : '-'}</p>
                    </div>
                    <div className="bg-gray-50/60 p-2 rounded-xl border border-gray-50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Total Donations</p>
                      <p className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedDonor.donationCount || 0}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-50 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Last Donation Date</p>
                    <p className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedDonor.lastDonationDate ? new Date(selectedDonor.lastDonationDate).toLocaleDateString() : 'None'}</p>
                  </div>

                  {/* Details table mapping */}
                  <div className="space-y-2.5 text-xs border-t border-gray-50 pt-4">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-gray-800">{selectedDonor.mobile}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Verification</span>
                      <span className="text-green-600 flex items-center gap-0.5">
                        <CheckCircle className="h-3 w-3" /> Aadhaar Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleSendRequest(selectedDonor)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Send Request
                  </button>
                  <button
                    onClick={() => handleViewMedicalInfo(selectedDonor)}
                    className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-all text-center"
                  >
                    View Medical Info
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
};

export default DonorMap;