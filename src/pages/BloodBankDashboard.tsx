import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Archive, ArrowRight, BarChart, ShieldCheck } from 'lucide-react';
import apiClient from '../api/apiClient';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const BloodBankDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<Record<string, number>>({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data?.data?.bloodInventory) {
          setInventory(res.data.data.bloodInventory);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve inventory.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdate = async (type: string, delta: number) => {
    const newVal = Math.max(0, inventory[type] + delta);
    const nextInventory = { ...inventory, [type]: newVal };
    setInventory(nextInventory);

    setUpdating(true);
    try {
      await apiClient.put('/users/profile', { bloodInventory: nextInventory });
    } catch (err) {
      console.error('Failed to sync bank inventory', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Retrieving bank telemetry..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Blood Bank Logistics Center</h1>
          <p className="text-gray-500 text-sm">Update stored whole blood quantities, logistics schedules, and track cross-facility dispatches.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Inventory Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Archive className="h-5 w-5 mr-2 text-red-600" />
                Whole Blood Inventory Reserves
              </h2>
              {updating && <span className="text-xs text-gray-400">Saving...</span>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(inventory).map(type => (
                <div key={type} className="border border-gray-100 p-4 rounded-xl text-center space-y-3 hover:border-red-200 transition-colors">
                  <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full text-sm">{type}</span>
                  <p className="text-2xl font-black text-gray-900 mt-2">{inventory[type]} <span className="text-xs text-gray-400 font-normal">units</span></p>
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleUpdate(type, -1)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleUpdate(type, 1)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700"
                    >
                      +1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics sidebar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-600" />
              Telemetry Analytics
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Reserves</span>
                <span className="font-bold text-gray-950">{Object.values(inventory).reduce((a, b) => a + b, 0)} units</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Average Unit Level</span>
                <span className="font-bold text-gray-950">{(Object.values(inventory).reduce((a, b) => a + b, 0) / 8).toFixed(1)} units</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">License Verification</span>
                <span className="flex items-center text-green-600 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Active Valid License
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankDashboard;
