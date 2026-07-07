import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

interface HistoryItem {
  id: string;
  date: string;
  type: 'donation' | 'request';
  details: string;
  bloodType: string;
  units: number;
  status: string;
}

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'donations') {
        const res = await apiClient.get('/users/donations');
        if (res.data?.success) {
          const donationItems = res.data.data.map((d: any) => ({
            id: d._id,
            date: new Date(d.createdAt || d.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            type: 'donation',
            details: `Donated to ${d.location || 'Hospital'}`,
            bloodType: d.bloodType,
            units: d.units,
            status: 'Completed'
          }));
          setItems(donationItems);
        }
      } else {
        const res = await apiClient.get(`/requests?recipientId=${user?._id}`);
        if (res.data?.success) {
          const requestItems = res.data.data.requests.map((r: any) => ({
            id: r._id,
            date: new Date(r.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            type: 'request',
            details: `Requested for ${r.hospital}`,
            bloodType: r.bloodType,
            units: r.unitsNeeded,
            status: r.status
          }));
          setItems(requestItems);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch history details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeTab]);

  return (
    <div className="font-sans max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 flex items-center gap-2">
            <Clock className="h-6 w-6 text-red-600" />
            Donation & Request History
          </h1>
          <div className="w-8 h-1 bg-red-600 rounded mt-1.5"></div>
        </div>

        {/* Tab Controls matching Mockup 8 */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-all ${
              activeTab === 'donations'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-center font-bold text-sm border-b-2 transition-all ${
              activeTab === 'requests'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Requests
          </button>
        </div>

        {/* Loading and error indicators */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Activity className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading history logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button onClick={loadHistory} className="text-xs text-red-600 underline font-bold">Try again</button>
          </div>
        ) : (
          /* History List */
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm font-medium">No records found for this tab.</p>
              </div>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-4 border border-gray-50 hover:border-red-100 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  {/* Date column */}
                  <div className="w-32 text-xs font-extrabold text-gray-400">
                    {item.date}
                  </div>

                  {/* Details column */}
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-gray-950">{item.details}</h4>
                  </div>

                  {/* Blood Group and Units */}
                  <div className="w-40 text-xs font-extrabold text-red-600">
                    {item.bloodType} Blood • {item.units} Unit{item.units > 1 ? 's' : ''}
                  </div>

                  {/* Status Column & Track Link */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.status === 'Completed' || item.status === 'Donation Completed'
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                    }`}>
                      {item.status === 'Donation Completed' ? 'Completed' : item.status}
                    </span>

                    {item.type === 'request' && (
                      <button
                        onClick={() => navigate(`/tracking/${item.id}`)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                        title="Track Request"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default History;