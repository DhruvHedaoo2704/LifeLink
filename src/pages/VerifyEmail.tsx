import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Droplet, CheckCircle2, XCircle } from 'lucide-react';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setError('Missing verification token.');
        setLoading(false);
        return;
      }

      try {
        await apiClient.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Email verification failed. The link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

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

        {loading && (
          <div className="space-y-4">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we confirm your email address.</p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">
              Thank you for verifying your email address. Your LifeLink account is now fully active.
            </p>
            <Link to="/login" className="block w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Continue to Login
            </Link>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-6">
            <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-red-700 bg-red-50 p-4 border border-red-100 rounded-lg text-sm">
              {error}
            </p>
            <p className="text-gray-600 text-sm">
              The link might be invalid or expired. Try checking your verification email again or request a new link from your profile.
            </p>
            <Link to="/login" className="block text-red-600 font-medium hover:text-red-700">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
