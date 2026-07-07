import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Activity, Award } from 'lucide-react';

const Features: React.FC = () => {
  const featuresList = [
    {
      icon: Bell,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about nearby donation requests and track your donation history in real-time.',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: Activity,
      title: 'Emergency Response',
      description: 'Connect directly with hospitals and medical centers for critical, time-sensitive blood requests.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Award,
      title: 'Impact Tracking',
      description: 'Monitor your donation history, earn points, and unlock achievements as you save lives in your community.',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-red-50 to-pink-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Why Choose <span className="text-red-600">Life Link</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the most advanced and compassionate blood donation platform designed to save lives.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className={`flex items-center justify-center w-16 h-16 ${feature.color} rounded-full mb-6`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default Features;