import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Phone, Droplet, Send, ShieldAlert, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bloodTypes } from '../data/mockData';
import { getCurrentLocation } from '../utils/location';
import apiClient from '../api/apiClient';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Emergency: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<'current' | 'manual'>('manual');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [coordsMessage, setCoordsMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: 'O+',
    unitsNeeded: '1',
    hospital: '',
    description: '',
    contactPhone: user?.phone || '',
    urgency: 'high',
    emergencyBroadcast: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleToggleBroadcast = () => {
    setFormData(prev => ({ ...prev, emergencyBroadcast: !prev.emergencyBroadcast }));
  };

  const getLocation = async () => {
    setLocationLoading(true);
    setCoordsMessage(null);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      setCoords([latitude, longitude]);
      setCoordsMessage(`GPS Location Identified: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      
      // Auto-populate hospital field with GPS tag if empty
      if (!formData.hospital) {
        setFormData(prev => ({
          ...prev,
          hospital: `Current Location Hospital (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not retrieve your GPS location. Please check browser permissions.');
      setLocationMode('manual');
    } finally {
      setLocationLoading(false);
    }
  };

  // Automatically trigger location fetch when 'current' mode is selected
  useEffect(() => {
    if (locationMode === 'current') {
      getLocation();
    } else {
      setCoords(null);
      setCoordsMessage(null);
    }
  }, [locationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Package description with patient details & contact numbers
      const compiledDescription = `Patient Name: ${formData.patientName} | Contact: ${formData.contactPhone} | Broadcast Enabled: ${formData.emergencyBroadcast ? 'YES' : 'NO'} | Info: ${formData.description || 'No additional comments'}`;

      const requestPayload = {
        bloodType: formData.bloodType,
        urgency: formData.urgency,
        unitsNeeded: parseInt(formData.unitsNeeded),
        hospital: formData.hospital,
        address: formData.hospital,
        description: compiledDescription,
        location: {
          lat: coords ? coords[0] : 17.4120, // default Hyderabad coordinates if manual location mode is used
          lng: coords ? coords[1] : 78.4480
        }
      };

      const response = await apiClient.post('/requests', requestPayload);
      if (response.data?.success) {
        const newRequest = response.data.data;
        alert('Emergency blood request successfully registered! Broadcasting alerts to nearby compatible donors, hospitals, and blood banks.');
        navigate(`/tracking/${newRequest._id}`); // Route to live tracking stepper screen
      }
    } catch (error: any) {
      console.error('Failed to submit emergency request:', error);
      alert(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Card */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              Create Emergency Request
            </h1>
            <p className="text-sm text-gray-400 mt-1">Fill out the fields below to trigger an emergency broadcast.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                placeholder="Enter patient full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Group Required */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Blood Group Required <span className="text-red-500">*</span>
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all font-semibold text-gray-700"
                >
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Quantity Required */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Quantity Required (Units) <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitsNeeded"
                  value={formData.unitsNeeded}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all font-semibold text-gray-700"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => (
                    <option key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Selection Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Location Selection <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setLocationMode('current')}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 ${
                    locationMode === 'current'
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Navigation className="h-3.5 w-3.5" /> Current GPS Location
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 ${
                    locationMode === 'manual'
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> Manual Selection
                </button>
              </div>

              {locationLoading && (
                <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 py-1">
                  <LoadingSpinner size="sm" /> <span>Searching GPS satellites...</span>
                </div>
              )}

              {coordsMessage && (
                <div className="text-[11px] text-green-600 font-bold bg-green-50 border border-green-100 rounded-lg p-2.5 flex items-center gap-1.5">
                  <CheckCircleMock /> {coordsMessage}
                </div>
              )}

              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                placeholder={locationMode === 'current' ? 'GPS Coordinates Populated (You can add hospital name)' : 'Enter hospital / delivery address'}
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                placeholder="Enter telephone / mobile number"
              />
            </div>

            {/* Urgency Level selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['low', 'medium', 'high', 'critical'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, urgency: lvl }))}
                    className={`py-2 px-1.5 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide text-center ${
                      formData.urgency === lvl
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Broadcast Toggle */}
            <div className="p-4 border border-gray-150 rounded-xl bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-600 animate-pulse" /> Emergency Broadcast
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-relaxed">
                    Instantly alert nearby compatible donors, hospitals, and blood banks via WebSocket notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBroadcast}
                  className={`w-11 h-6 rounded-full transition-all relative ${formData.emergencyBroadcast ? 'bg-red-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${formData.emergencyBroadcast ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Additional Description / Details (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-semibold text-gray-700"
                placeholder="Include any specific medical information or instructions..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <><Send className="h-4 w-4" /> Submit Emergency Request</>}
            </Button>
          </form>
        </div>

        {/* Right Column: Hotline Banner Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center items-center space-y-4">
          <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100 shadow-sm animate-pulse">
            <Phone className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Need Help?</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              If this is a life threatening emergency, call us now.
              9399239147
            </p>
          </div>
          <a
            href="tel:9399239147"
            className="text-2xl font-black text-red-600 hover:underline hover:text-red-700 transition-all tracking-wide flex items-center gap-1.5"
          >
            9399239147
          </a>
        </div>

      </div>
    </div>
  );
};

// Simple inline check circle mockup component
const CheckCircleMock: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-green-100 stroke-green-600" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Emergency;