import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, User, LogOut, Bell, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return (
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">Life Link</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Droplet className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">Life Link</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive('/dashboard')
                  ? 'text-red-600 font-medium'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              Dashboard
            </Link>
            {(user.isDonor || user.userType === 'donor') && (
              <Link
                to="/map"
                className={`transition-colors ${
                  isActive('/map')
                    ? 'text-red-600 font-medium'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                Donor Map
              </Link>
            )}
            {(user.isRecipient || user.userType === 'recipient') && (
              <Link
                to="/emergency"
                className={`transition-colors ${
                  isActive('/emergency')
                    ? 'text-red-600 font-medium'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                Emergency
              </Link>
            )}
            <Link
              to="/history"
              className={`transition-colors ${
                isActive('/history')
                  ? 'text-red-600 font-medium'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              History
            </Link>
            <Link
              to="/leaderboard"
              className={`transition-colors ${
                isActive('/leaderboard')
                  ? 'text-red-600 font-medium'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              Leaderboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </motion.button>
            
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block">{user.name}</span>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;