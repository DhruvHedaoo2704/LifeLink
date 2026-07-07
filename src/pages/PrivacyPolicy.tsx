import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, EyeOff, Lock, UserCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-100 pb-6"
        >
          <div className="flex items-center space-x-3 text-red-600 mb-2">
            <ShieldAlert className="h-8 w-8" />
            <span className="font-bold text-sm uppercase tracking-wider">Security First</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 text-xs mt-1">Last Updated: June 8, 2026</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-2">
            <EyeOff className="h-6 w-6 text-red-600" />
            <h3 className="font-bold text-gray-900">Coordinate Cloaking</h3>
            <p className="text-gray-600 text-xs">Geolocation is only shared when responding to an emergency request.</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-2">
            <Lock className="h-6 w-6 text-blue-600" />
            <h3 className="font-bold text-gray-900">Aadhaar Encryption</h3>
            <p className="text-gray-600 text-xs">IDs are encrypted at rest using AES-256-CBC and are never exposed in raw formats.</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-2">
            <UserCheck className="h-6 w-6 text-green-600" />
            <h3 className="font-bold text-gray-900">Consent Control</h3>
            <p className="text-gray-600 text-xs">Control notification settings, contact shares, and visibility via user settings.</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
            <p>
              To coordinate emergency blood donations, we gather user accounts profile information, including Full Name, email addresses,
              mobile numbers, gender, date of birth, blood group, and geographical coordinates. To authenticate profiles for hospital operations,
              government IDs or Aadhaar numbers may be stored under heavy encryption.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">2. How We Use Location Data</h2>
            <p>
              Your current coordinates are used by the platform to locate compatible donors within a 10km radius of an active emergency.
              Your real-time geolocation is only transmitted when you are traveling to a hospital to fulfill an accepted request.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">3. Data Retention and Safety Logs</h2>
            <p>
              We maintain security audit trails tracking last login, failed login logs, and session activities. Account deletions permanently
              remove all personal identifications, archiving only anonymized donation counts for healthcare research statistics.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
