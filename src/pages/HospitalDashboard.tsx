import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Activity, Check, Plus, Minus, ArrowUpRight, Loader } from 'lucide-react';
import Button from '../components/UI/Button';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';

const HospitalDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [inventory, setInventory] = useState<Record<string, number>>({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // 1. Fetch Requests
      const reqRes = await apiClient.get('/requests?limit=100');
      if (reqRes.data?.success) {
        setRequests(reqRes.data.data.requests);
      }

      // 2. Fetch Profile to get Inventory (uses user from auth store which has latest populated fields)
      const profileRes = await apiClient.get('/users/profile');
      if (profileRes.data?.success) {
        const profile = profileRes.data.data;
        if (profile.bloodInventory) {
          setInventory({
            'A+': profile.bloodInventory['A+'] || 0,
            'A-': profile.bloodInventory['A-'] || 0,
            'B+': profile.bloodInventory['B+'] || 0,
            'B-': profile.bloodInventory['B-'] || 0,
            'AB+': profile.bloodInventory['AB+'] || 0,
            'AB-': profile.bloodInventory['AB-'] || 0,
            'O+': profile.bloodInventory['O+'] || 0,
            'O-': profile.bloodInventory['O-'] || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error loading hospital dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to live socket events to sync request states in real-time
  useEffect(() => {
    const socket = connectSocket();

    const handleRequestChange = () => {
      // Refresh requests when a request is created or updated
      loadData();
    };

    socket.on('request-created', handleRequestChange);
    socket.on('request-updated', handleRequestChange);

    return () => {
      socket.off('request-created', handleRequestChange);
      socket.off('request-updated', handleRequestChange);
    };
  }, []);

  const handleUpdate = async (type: string, delta: number) => {
    const updatedValue = Math.max(0, (inventory[type] || 0) + delta);
    const updatedInventory = {
      ...inventory,
      [type]: updatedValue
    };
    
    // Optimistic UI update
    setInventory(updatedInventory);

    try {
      await apiClient.put('/users/profile', { bloodInventory: updatedInventory });
    } catch (err) {
      console.error('Failed to sync inventory update to DB:', err);
      // Rollback on failure
      setInventory(inventory);
    }
  };

  const handleFulfill = async (id: string) => {
    try {
      const res = await apiClient.patch(`/requests/${id}/status`, { status: 'Donation Completed' });
      if (res.data?.success) {
        alert('Request successfully marked as completed!');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fulfill request.');
    }
  };

  // Stats calculations
  const totalRequestsCount = requests.length;
  const pendingCount = requests.filter(r => !['Donation Completed', 'Cancelled', 'Expired'].includes(r.status)).length;
  const fulfilledCount = requests.filter(r => r.status === 'Donation Completed').length;
  const totalUnitsInInventory = Object.values(inventory).reduce((sum, val) => sum + val, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader className="h-10 w-10 text-red-600 animate-spin" />
        <p className="text-gray-500 font-semibold">Loading dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950">Hospital Dashboard</h1>
        <div className="w-8 h-1 bg-red-600 rounded mt-1.5"></div>
      </div>

      {/* Top Stats Row matching Mockup 10 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Requests</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalRequestsCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfilled</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{fulfilledCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-extrabold text-red-500 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Units</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{totalUnitsInInventory}</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Recent Requests */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-red-600 animate-pulse" />
              Recent Requests
            </h3>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No pending emergency requests.</p>
              ) : (
                requests.slice(0, 15).map((req, idx) => {
                  const isPending = !['Donation Completed', 'Cancelled', 'Expired'].includes(req.status);
                  const urgencyColors = {
                    critical: 'bg-red-600',
                    high: 'bg-red-500',
                    medium: 'bg-orange-500',
                    low: 'bg-yellow-500'
                  }[req.urgency as 'low'|'medium'|'high'|'critical'] || 'bg-gray-500';

                  return (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                      className="p-4 border border-gray-50 rounded-xl bg-white shadow-sm flex items-center justify-between gap-4 hover:border-red-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Blood drop indicator */}
                        <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-extrabold text-sm border border-red-100">
                          {req.bloodType}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-950 flex items-center gap-2">
                            {req.bloodType} Blood • {req.unitsNeeded} Unit{req.unitsNeeded > 1 ? 's' : ''}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white capitalize ${urgencyColors}`}>
                              {req.urgency}
                            </span>
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            {req.hospital} • {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      {isPending && (
                        <button
                          onClick={() => handleFulfill(req._id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] transition-all flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Fulfill
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Blood Inventory */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Droplet className="h-4.5 w-4.5 text-red-600" />
              Blood Inventory
            </h3>

            <div className="space-y-3.5">
              {Object.entries(inventory).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2.5 border border-gray-50 rounded-xl hover:border-red-100 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-gray-900 text-sm">{type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-900">{count} Units</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdate(type, -1)}
                        className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-md transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleUpdate(type, 1)}
                        className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-md transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;
