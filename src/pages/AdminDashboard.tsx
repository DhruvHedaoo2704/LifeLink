import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  BarChart2, 
  Loader,
  AlertCircle,
  Check,
  X,
  Lock
} from 'lucide-react';
import Button from '../components/UI/Button';
import apiClient from '../api/apiClient';

const AdminDashboard: React.FC = () => {
  const [viewLogs, setViewLogs] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [requestsCount, setRequestsCount] = useState(0);
  const [livesImpacted, setLivesImpacted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all users
      const usersRes = await apiClient.get('/users/all-users');
      if (usersRes.data?.success) {
        setUsers(usersRes.data.data);
      }

      // 2. Fetch all requests
      const requestsRes = await apiClient.get('/requests?limit=1000');
      if (requestsRes.data?.success) {
        const reqList = requestsRes.data.data.requests || [];
        setRequestsCount(reqList.length);
        setLivesImpacted(reqList.filter((r: any) => r.status === 'Donation Completed').length);
      }

      // 3. Fetch audit logs
      const logsRes = await apiClient.get('/users/audit-logs');
      if (logsRes.data?.success) {
        setAuditLogs(logsRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load administrator data panel. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (userId: string, newStatus: 'verified' | 'unverified') => {
    try {
      const res = await apiClient.patch(`/users/${userId}/verify`, { status: newStatus });
      if (res.data?.success) {
        // Update local state
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, profileVerificationStatus: newStatus } : u));
        // Refresh logs
        const logsRes = await apiClient.get('/users/audit-logs');
        if (logsRes.data?.success) {
          setAuditLogs(logsRes.data.data);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader className="h-10 w-10 text-red-600 animate-spin" />
        <p className="text-gray-500 font-semibold">Loading system parameters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  const activeDonorsCount = users.filter(u => u.role === 'donor' && u.availabilityStatus).length;

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-red-500 bg-red-50' },
    { label: 'Active Donors', value: activeDonorsCount.toString(), icon: ShieldCheck, color: 'text-green-500 bg-green-50' },
    { label: 'Total Requests', value: requestsCount.toString(), icon: FileText, color: 'text-blue-500 bg-blue-50' },
    { label: 'Lives Impacted', value: livesImpacted.toString(), icon: Database, color: 'text-purple-500 bg-purple-50' }
  ];

  // Group demand math
  const bloodTypeCounts: Record<string, number> = {};
  users.forEach(u => {
    if (u.bloodGroup) {
      bloodTypeCounts[u.bloodGroup] = (bloodTypeCounts[u.bloodGroup] || 0) + 1;
    }
  });
  const totalBloodTypes = Object.values(bloodTypeCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950">Admin Dashboard</h1>
          <div className="w-8 h-1 bg-red-600 rounded mt-1.5"></div>
        </div>
        <button
          onClick={() => setViewLogs(!viewLogs)}
          className="text-xs font-bold text-red-500 border border-red-200 px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 transition-all shadow-sm"
        >
          {viewLogs ? 'Show Operations Registry' : 'View Security Logs'}
        </button>
      </div>

      {/* Stats cards matching Mockup 11 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!viewLogs ? (
          // Operations / Directory & Breakdown
          <motion.div
            key="charts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Panel: User Verification Directory */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-red-500" />
                  User Account Directories
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-bold uppercase">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Email</th>
                        <th className="py-2.5">Role</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                      {users.slice(0, 10).map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-extrabold text-gray-950">{u.name}</td>
                          <td className="py-3">{u.email}</td>
                          <td className="py-3 capitalize text-red-600">{u.role}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.profileVerificationStatus === 'verified'
                                ? 'bg-green-50 text-green-600'
                                : u.profileVerificationStatus === 'pending'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {u.profileVerificationStatus || 'unverified'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {u.profileVerificationStatus !== 'verified' && (
                                <button
                                  onClick={() => handleVerify(u._id, 'verified')}
                                  className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded"
                                  title="Approve Profile"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {u.profileVerificationStatus !== 'unverified' && (
                                <button
                                  onClick={() => handleVerify(u._id, 'unverified')}
                                  className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                                  title="Reject Profile"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Blood Group Breakdown */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="h-4.5 w-4.5 text-red-500" />
                  Registered Blood Group Breakdowns
                </h3>

                <div className="space-y-3 pt-2">
                  {['O+', 'A+', 'B+', 'AB+'].map(bg => {
                    const count = bloodTypeCounts[bg] || 0;
                    const pct = Math.round((count / totalBloodTypes) * 100) || 0;
                    return (
                      <div key={bg} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{bg}</span>
                          <span>{count} Users ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Security Audit Logs
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-red-500" />
                Security Audit Logs
              </h3>
              <p className="text-xs text-gray-400">All administrative logins, database modifications, and access reviews are audited below.</p>
              
              <div className="space-y-3 pt-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No security events recorded.</p>
                ) : (
                  auditLogs.slice(0, 30).map((log, idx) => (
                    <div key={log._id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-gray-900">{log.action}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          User: {log.userId?.name || 'Guest'} ({log.userId?.email || 'N/A'}) • IP: {log.ipAddress}
                        </p>
                      </div>
                      <span className="font-bold text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
