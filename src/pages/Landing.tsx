import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users, Activity, FileText } from 'lucide-react';
import Button from '../components/UI/Button';

const BloodDropIllustration: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center">
      {/* Background radial soft red glow */}
      <div className="absolute w-80 h-80 rounded-full bg-red-100/50 blur-3xl -z-10 animate-pulse"></div>

      <svg viewBox="0 0 400 400" className="w-full max-w-[420px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#EF4444" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Soft Background circles */}
        <circle cx="200" cy="220" r="150" fill="#FEF2F2" />
        <circle cx="200" cy="220" r="120" stroke="#FEE2E2" strokeWidth="2.5" strokeDasharray="8 8" />

        {/* Abstract Cradling Hands */}
        <g stroke="#FCA5A5" strokeWidth="6" strokeLinecap="round" fill="none" strokeLinejoin="round">
          {/* Left Hand */}
          <path d="M110 280 C110 330, 165 340, 195 330" />
          <path d="M110 280 C98 260, 115 240, 135 230 C155 220, 172 240, 182 260" />
          <path d="M125 260 C135 230, 158 220, 172 245" />
          <path d="M140 250 C150 225, 168 220, 178 240" />

          {/* Right Hand */}
          <path d="M290 280 C290 330, 235 340, 205 330" />
          <path d="M290 280 C302 260, 285 240, 265 230 C245 220, 228 240, 218 260" />
          <path d="M275 260 C265 230, 242 220, 228 245" />
          <path d="M260 250 C250 225, 232 220, 222 240" />
        </g>

        {/* Animated Blood Drop */}
        <motion.g 
          filter="url(#shadow)"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M200 80 C200 80, 260 160, 260 215 C260 248.137, 233.137 275, 200 275 C166.863 275, 140 248.137, 140 215 C140 160, 200 80, 200 80 Z"
            fill="url(#dropGrad)"
          />
          
          {/* Animated White Pulse Line inside the drop */}
          <motion.path
            d="M165 215 H185 L192 195 L200 230 L208 200 L213 220 L217 215 H235"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
          />
        </motion.g>
      </svg>
    </div>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Every Drop <br className="hidden md:inline" />
                Can <span className="text-red-600">Save a Life</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                LifeLink connects blood donors with people in need. Be a hero. Donate blood.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="px-8 shadow-md shadow-red-200">
                  Get Started
                </Button>
              </Link>
              <Link to="/register?role=donor">
                <Button size="lg" variant="secondary" className="px-8 border border-red-600 text-red-600 bg-white hover:bg-red-50">
                  Become a Donor
                </Button>
              </Link>
            </motion.div>

            {/* Stat Box Underneath */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 pt-6"
            >
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-950">12,540+</p>
                  <p className="text-xs text-gray-500 font-medium">Donors</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-950">8,320+</p>
                  <p className="text-xs text-gray-500 font-medium">Requests</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-950">6,945+</p>
                  <p className="text-xs text-gray-500 font-medium">Lives Saved</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-950">120+</p>
                  <p className="text-xs text-gray-500 font-medium">Cities</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <BloodDropIllustration />
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-50 border-t border-gray-100 py-6 mt-16 text-center text-sm text-gray-500">
        <p>© 2024 LifeLink. All rights reserved. Created with ❤️ by Karthik.</p>
      </footer>
    </div>
  );
};

export default Landing;