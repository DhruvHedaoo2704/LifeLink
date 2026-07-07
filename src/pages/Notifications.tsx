import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Activity, AlertCircle, Trash2 } from 'lucide-react';
import Button from '../components/UI/Button';
import apiClient from '../api/apiClient';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const Notifications: React.FC = () => {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const res = await apiClient.get('/notifications');
      if (res.data?.success) {
        const mapped = res.data.data.map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          unread: n.status !== 'read'
        }));
        setList(mapped);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load notifications. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await apiClient.post('/notifications/mark-all-read');
      if (res.data?.success) {
        setList(prev => prev.map(n => ({ ...n, unread: false })));
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to mark notifications as read.');
    }
  };

  const handleToggleRead = async (id: string, isUnread: boolean) => {
    if (!isUnread) return; // Already read
    try {
      const res = await apiClient.patch(`/notifications/${id}`);
      if (res.data?.success) {
        setList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="font-sans max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        
        {/* Header with Mark all as read */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Bell className="h-5.5 w-5.5 text-red-600" />
              Notifications
            </h1>
            <div className="w-8 h-1 bg-red-600 rounded mt-1.5"></div>
          </div>

          {list.some(n => n.unread) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold text-red-500 hover:underline hover:text-red-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Loading and error indicators */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Activity className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button onClick={fetchNotifications} className="text-xs text-red-600 underline font-bold">Try again</button>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm font-medium">All caught up! No notifications.</p>
              </div>
            ) : (
              list.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => handleToggleRead(n.id, n.unread)}
                  className={`p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between gap-4 transition-all ${
                    n.unread ? 'border-red-100 hover:border-red-200 cursor-pointer' : 'border-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Red status circle for unread, otherwise grey */}
                    <div className="pt-1.5 flex-shrink-0">
                      <div className={`h-2.5 w-2.5 rounded-full ${n.unread ? 'bg-red-500 ring-4 ring-red-100' : 'bg-gray-200'}`} />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-gray-950">{n.title}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{n.message}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{n.time}</p>
                    </div>
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

export default Notifications;
