import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplet, PhoneCall, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const VerifyMobile: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const sendOTP = async () => {
    setResending(true);
    setError(null);
    setInfoMessage(null);
    try {
      await apiClient.post('/auth/send-otp');
      setInfoMessage('Verification code sent! (Check your phone or the backend console logs)');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setResending(false);
    }
  };

  React.useEffect(() => {
    sendOTP();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      await apiClient.post('/auth/verify-mobile', { otp });
      setSuccess(true);
      await fetchProfile(); // Sync store profile status
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center"
      >
        <div className="mb-6">
          <Droplet className="h-12 w-12 text-red-600 mx-auto" />
        </div>

        {success ? (
          <div className="space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900">Mobile Verified!</h2>
            <p className="text-gray-600">
              Your mobile number has been successfully verified. Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify Mobile Number</h2>
            <p className="text-gray-600 text-sm">
              We sent a verification code to {user?.phone || 'your phone number'}.<br />
              <span className="text-xs text-gray-500">(If Twilio is not configured, find the generated OTP in the backend server console log)</span>
            </p>

            {infoMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-left">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-left">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={sendOTP}
                disabled={resending}
                className="text-red-600 hover:text-red-500 font-medium disabled:opacity-50 mx-auto"
              >
                {resending ? 'Resending Code...' : 'Resend Verification Code'}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Verify Code'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyMobile;
