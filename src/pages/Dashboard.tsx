import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Users, 
  Star, 
  Award, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  ChevronRight,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { connectSocket } from '../services/socket';

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real MongoDB data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active blood requests
      const reqsRes = await apiClient.get('/requests?status=Created,Searching');
      setRequests(reqsRes.data.data.requests || []);

      // Fetch user activities
      const actsRes = await apiClient.get('/users/activities');
      setActivities(actsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time synchronization using Socket.io
  useEffect(() => {
    const socket = connectSocket();

    const handleRequestCreated = (newRequest: any) => {
      // Add if compatible
      setRequests(prev => {
        if (prev.some(r => r._id === newRequest.requestId)) return prev;
        return [
          {
            _id: newRequest.requestId,
            bloodType: newRequest.bloodType,
            urgency: newRequest.urgency,
            hospital: newRequest.hospital,
            distance: 'Calculated nearby',
            time: 'Just now'
          },
          ...prev
        ];
      });
    };

    const handleRequestUpdated = (updated: any) => {
      if (updated.status === 'Donation Completed' || updated.status === 'Cancelled') {
        // Remove completed requests
        setRequests(prev => prev.filter(r => r._id !== updated.requestId));
      } else {
        setRequests(prev => prev.map(r => r._id === updated.requestId ? { ...r, status: updated.status } : r));
      }
    };

    socket.on('request-created', handleRequestCreated);
    socket.on('request-updated', handleRequestUpdated);

    return () => {
      socket.off('request-created', handleRequestCreated);
      socket.off('request-updated', handleRequestUpdated);
    };
  }, []);

  const handleAccept = async (reqId: string) => {
    try {
      await apiClient.post(`/requests/${reqId}/respond`, { response: 'yes' });
      alert('Thank you! Response recorded in database. Redirecting to tracking map...');
      navigate(`/tracking/${reqId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handlePass = (reqId: string) => {
    setRequests(prev => prev.filter(r => r._id !== reqId));
  };

  const handleToggleAvailability = async () => {
    if (!user) return;
    try {
      const nextStatus = !user.isAvailable;
      await updateUser({ isAvailable: nextStatus });
    } catch (err) {
      alert('Failed to update availability status.');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner text="Connecting to MongoDB command deck..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Greeting Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
            Hi, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Be a hero today, save a life.</p>
        </div>
      </div>

      {/* Grid Stats Header cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl text-red-500 bg-red-50">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Group</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{user.bloodType || 'O+'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl text-blue-500 bg-blue-50">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donations</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{user.donationCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl text-orange-500 bg-orange-50">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Points</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{user.points || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl text-green-500 bg-green-50">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Badges</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{user.badges?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Requests Nearby */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-950">Active Requests Nearby</h2>
              <Link to="/find-donors" className="text-xs font-semibold text-red-500 hover:underline flex items-center">
                View Directory <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="p-6 space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Droplet className="h-10 w-10 text-gray-200 mx-auto" />
                  <p className="text-gray-400 text-sm">No active emergency requests nearby in MongoDB.</p>
                </div>
              ) : (
                requests.map((req, idx) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.15 }}
                    className="p-5 border border-gray-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-100 transition-all bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Blood Group Indicator */}
                      <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center font-extrabold text-red-600 text-lg border border-red-100 flex-shrink-0">
                        {req.bloodType}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-gray-950 text-sm">{req.bloodType} Blood Required</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-red-500`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold">{req.hospital}</p>
                        
                        <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-red-400" /> {req.address || '2.4 km away'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" /> {req.createdAt ? new Date(req.createdAt).toLocaleTimeString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePass(req._id)}
                        className="p-2 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-400 rounded-xl transition-all"
                        title="Pass"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-red-200 transition-all flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* User Activity feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              Recent Activity History
            </h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No recent donation or request activities recorded.</p>
              ) : (
                activities.slice(0, 4).map((act, idx) => (
                  <div key={idx} className="p-3 border border-gray-50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-gray-950">{act.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Type: {act.activityType.replace('_', ' ')}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Your Impact & Availability toggle */}
        <div className="lg:col-span-4 space-y-6">
          {/* Availability toggle card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-950">Availability Status</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-950">{user.isAvailable ? 'Available Now' : 'Currently Unavailable'}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Toggle status to appear on search maps</p>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`w-12 h-6.5 rounded-full transition-all relative ${user.isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4.5 h-4.5 rounded-full transition-all ${user.isAvailable ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 text-center">
            <h3 className="text-sm font-bold text-gray-950 text-left">Your Impact</h3>

            {/* Radial progress mockup */}
            <div className="relative flex justify-center items-center py-4">
              <svg className="w-36 h-36" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="8" fill="transparent" />
                {/* Active Colored Ring (85%) */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#DC2626"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.85)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.85) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-3xl font-extrabold text-gray-900">85%</span>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-0.5">You're amazing!</span>
              </div>
            </div>

            {/* Impact details grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Donations</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{user.donationCount || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lives Impacted</p>
                <p className="text-2xl font-extrabold text-red-500 mt-1">{(user.donationCount || 0) * 3 || '0'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;