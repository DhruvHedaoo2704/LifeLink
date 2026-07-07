import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Navigation,
  Activity,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { connectSocket } from '../services/socket';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom red icon for recipient/hospital
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom green icon for donor
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RequestTracking: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donorCoords, setDonorCoords] = useState<[number, number] | null>(null);
  const [socket, setSocket] = useState<any>(null);

  const fetchRequest = async () => {
    try {
      const res = await apiClient.get(`/requests/${requestId}`);
      if (res.data?.success) {
        setRequest(res.data.data);
      } else {
        setError('Failed to fetch request information.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading request tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  // Set up socket listener
  useEffect(() => {
    if (!requestId) return;

    const socketConn = connectSocket();
    setSocket(socketConn);

    // Join room for this request
    socketConn.emit('track-request', requestId);

    const handleRequestUpdated = (updated: any) => {
      if (updated.requestId === requestId) {
        fetchRequest();
      }
    };

    const handleDonorLocationUpdate = (data: any) => {
      if (data.location) {
        setDonorCoords([data.location.lat, data.location.lng]);
      }
    };

    socketConn.on('request-updated', handleRequestUpdated);
    socketConn.on('donor-location-update', handleDonorLocationUpdate);

    return () => {
      socketConn.off('request-updated', handleRequestUpdated);
      socketConn.off('donor-location-update', handleDonorLocationUpdate);
    };
  }, [requestId]);

  // Handle donor location sharing if status is traveling
  const acceptedResponse = request?.responses?.find((r: any) => r.status === 'yes' || r.status === 'traveling' || r.status === 'arrived');
  const isDonorUser = acceptedResponse && acceptedResponse.donorId?._id === user?._id;

  useEffect(() => {
    if (request?.status === 'Donor Traveling' && isDonorUser && socket) {
      // Setup live geolocation tracking
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDonorCoords([lat, lng]);
          socket.emit('share-location', {
            requestId,
            location: { lat, lng }
          });
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [request?.status, isDonorUser, socket, requestId]);

  // Fallback coords setup if donor location loaded from profile
  useEffect(() => {
    if (acceptedResponse?.donorId?.currentLocation?.coordinates) {
      const coords = acceptedResponse.donorId.currentLocation.coordinates;
      setDonorCoords([coords[1], coords[0]]);
    }
  }, [request]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await apiClient.patch(`/requests/${requestId}/status`, { status: newStatus });
      if (res.data?.success) {
        setRequest(res.data.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Activity className="h-10 w-10 text-red-600 animate-spin" />
        <p className="text-gray-500 font-semibold">Loading tracking statistics...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Tracking Error</h2>
        <p className="text-sm text-gray-500">{error || 'Request not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const hospitalCoords: [number, number] = request.location?.coordinates
    ? [request.location.coordinates[1], request.location.coordinates[0]]
    : [17.4120, 78.4480];

  const steps = [
    { 
      label: 'Request Created', 
      time: new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      done: true 
    },
    { 
      label: 'Searching for Donors', 
      time: request.statusHistory?.some((h: any) => h.status === 'Searching') ? 'Completed' : 'Active', 
      done: true 
    },
    { 
      label: acceptedResponse 
        ? `Donor Found: ${acceptedResponse.donorId.name} accepted your request` 
        : 'Searching for nearby donors...', 
      time: acceptedResponse ? new Date(acceptedResponse.createdAt || request.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending', 
      done: !!acceptedResponse 
    },
    { 
      label: 'Donor On The Way', 
      time: request.status === 'Donor Traveling' ? 'Active' : 'Pending', 
      done: ['Donor Traveling', 'Donation Completed'].includes(request.status) 
    },
    { 
      label: 'Donation Completed', 
      time: request.status === 'Donation Completed' ? 'Done' : 'Pending', 
      done: request.status === 'Donation Completed' 
    }
  ];

  const handleCall = () => {
    if (acceptedResponse?.donorId?.mobile) {
      window.location.href = `tel:${acceptedResponse.donorId.mobile}`;
    } else {
      alert('Contact number not available');
    }
  };

  const routePath: [number, number][] = donorCoords ? [donorCoords, hospitalCoords] : [hospitalCoords];

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(user?.role === 'hospital' ? '/hospital' : '/dashboard')}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Tracking Stepper Details */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  Request #{request._id.substring(request._id.length - 8).toUpperCase()}
                  <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase">
                    {request.urgency}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-red-500" /> {request.hospital}
                </p>
                <p className="text-[10px] text-gray-400 font-medium ml-4">
                  Requested at {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1 uppercase">
                <CheckCircle className="h-3.5 w-3.5" /> {request.status}
              </span>
            </div>

            {/* Stepper tracking */}
            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {/* Vertical line indicator */}
                  {idx < steps.length - 1 && (
                    <div className={`absolute left-2.5 top-5 w-0.5 h-10 -ml-px ${
                      step.done && steps[idx + 1].done ? 'bg-green-500' : 'bg-gray-100'
                    }`} />
                  )}

                  {/* Dot */}
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 mt-0.5 ${
                    step.done 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {step.done && <CheckCircle className="h-3 w-3 text-white fill-green-500" />}
                  </div>

                  {/* Step details */}
                  <div>
                    <p className={`text-xs font-bold ${step.done ? 'text-gray-950' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons for travel tracking */}
          {isDonorUser && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Donor Control Center</h4>
              {request.status === 'Accepted' && (
                <button
                  onClick={() => handleStatusUpdate('Donor Traveling')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  <Navigation className="h-4 w-4 animate-pulse" /> Start Traveling to Hospital
                </button>
              )}
              {request.status === 'Donor Traveling' && (
                <button
                  onClick={() => handleStatusUpdate('Donation Completed')}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  <CheckCircle className="h-4 w-4" /> I Have Completed the Donation
                </button>
              )}
            </div>
          )}

          {/* Recipient control buttons */}
          {request.recipientId?._id === user?._id && request.status === 'Donor Traveling' && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => handleStatusUpdate('Donation Completed')}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle className="h-4 w-4" /> Mark Donation as Completed
              </button>
            </div>
          )}

          {/* Responding Donor Info Card */}
          {acceptedResponse ? (
            <div className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between bg-gray-50/50 shadow-sm mt-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 text-red-600 font-extrabold rounded-full flex items-center justify-center text-sm shadow-sm">
                  {acceptedResponse.donorId.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-950">{acceptedResponse.donorId.name}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {acceptedResponse.donorId.bloodGroup} • {acceptedResponse.donorId.mobile}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCall}
                  className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all"
                  title="Call Donor"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400 mt-4 font-medium">
              Waiting for a donor to accept request...
            </div>
          )}
        </div>

        {/* Right Column: Routing Map Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[450px] lg:h-auto min-h-[400px]">
          <div className="h-full relative min-h-[350px]">
            <MapContainer center={hospitalCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Hospital Marker */}
              <Marker position={hospitalCoords} icon={hospitalIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <strong className="block text-red-600 font-bold">{request.hospital}</strong>
                    <span className="block text-gray-500 mt-1">Recipient Destination</span>
                  </div>
                </Popup>
              </Marker>

              {/* Donor Marker */}
              {donorCoords && (
                <Marker position={donorCoords} icon={donorIcon}>
                  <Popup>
                    <div className="font-sans text-xs">
                      <strong className="block text-green-600 font-bold">
                        {acceptedResponse?.donorId?.name || 'Donor'}
                      </strong>
                      <span className="block text-gray-500 mt-1">Traveling Donor Location</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Path Routing Polyline */}
              {donorCoords && (
                <Polyline positions={routePath} color="#DC2626" weight={4} dashArray="5, 10" />
              )}
            </MapContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestTracking;
