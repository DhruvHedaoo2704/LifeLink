import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Map emailOrPhone to email parameter for backend.
      // In case they logged in with userType, our authStore defaults or can try to login.
      await login(formData.emailOrPhone, formData.password, 'donor');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login failed:', err);
      alert(err.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id_here' || clientId.includes('your_')) {
      setGoogleConfigured(false);
      return;
    }

    setGoogleConfigured(true);

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        // Google button takes standard container id and renders branded iframe
        setTimeout(() => {
          const btnElem = document.getElementById('google-signin-btn');
          if (btnElem && (window as any).google) {
            (window as any).google.accounts.id.renderButton(
              btnElem,
              { theme: 'outline', size: 'large', width: 384 }
            );
          }
        }, 100);
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Top Header Row matching Mockup 2 */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-1">
          <Droplet className="h-7 w-7 text-red-600 fill-red-600" />
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">LifeLink</span>
        </Link>
        <div className="text-xs font-bold text-red-600">
          Emergency: <span className="hover:underline">9399239147</span>
        </div>
      </header>

      {/* Main Form Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Tabs header */}
          <div className="flex border-b border-gray-100">
            <button className="flex-1 py-4 text-center font-bold text-sm border-b-2 border-red-600 text-red-600">
              Login
            </button>
            <Link to="/register" className="flex-1 py-4 text-center font-semibold text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Sign Up
            </Link>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-sm text-gray-400">Login to continue to your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email or Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email or Phone
                </label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Enter email or phone"
                />
              </div>

              {/* Password Input with Forgot Password link directly above it */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-red-500 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-300"
                  placeholder="Enter your password"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Login'}
              </Button>
            </form>

            {/* Divider "or" */}
            <div className="flex items-center justify-center my-4">
              <div className="border-b border-gray-100 flex-grow"></div>
              <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">or</span>
              <div className="border-b border-gray-100 flex-grow"></div>
            </div>

            {/* Continue with Google button */}
            {googleConfigured ? (
              <div className="flex justify-center w-full">
                <div id="google-signin-btn" className="w-full"></div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => alert('Google Authentication is not configured. Please define VITE_GOOGLE_CLIENT_ID in your environment variables to enable Google Login.')}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all bg-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}

            {/* Bottom text link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Link to="/register" className="text-red-500 font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        Demo credentials: john.donor@email.com / password
      </footer>
    </div>
  );
};

export default Login;