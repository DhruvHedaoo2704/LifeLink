import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'donor' as 'donor' | 'recipient',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.email, formData.password, formData.userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    try {
      const token = credentialResponse.credential;
      await googleLogin(token, formData.userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Droplet className="h-12 w-12 text-red-600 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your Life Link account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${formData.userType === 'donor' 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-red-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="userType"
                  value="donor"
                  checked={formData.userType === 'donor'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Droplet className="h-5 w-5 mr-2" />
                Donor
              </motion.label>
              
              <motion.label
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${formData.userType === 'recipient' 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-red-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="userType"
                  value="recipient"
                  checked={formData.userType === 'recipient'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Droplet className="h-5 w-5 mr-2" />
                Recipient
              </motion.label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="mt-6">
          {googleLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
            />
          )}
        </div>

        <div className="mt-6">
          <div className="text-center">
            <p className="text-gray-600">
              Demo credentials: john.donor@email.com / password
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;