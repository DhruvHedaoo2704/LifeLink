import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, HeartHandshake, Eye, Brain, Users } from 'lucide-react';

const AboutUs: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We place the lives and wellbeing of recipients and donors at the core of all decisions.'
    },
    {
      icon: Shield,
      title: 'High Security',
      description: 'Your health records, Aadhaar numbers, and locations are protected with enterprise encryption.'
    },
    {
      icon: HeartHandshake,
      title: 'Reliability',
      description: 'Our real-time matching coordinates alerts to donors within minutes of critical hospital notifications.'
    },
    {
      icon: Brain,
      title: 'Innovation',
      description: 'Leveraging advanced AI and precise geolocation, we are redefining the standards of emergency response.'
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'Empowering local communities to support each other through a transparent and efficient donation ecosystem.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <span className="text-red-600 font-bold uppercase tracking-wider text-sm">Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Connecting Hearts, Saving Lives
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            LifeLink is a centralized, real-time platform matching blood request coordinates to available local donors.
            We eliminate communication gaps in emergency blood banking.
          </p>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="bg-white/10 p-6 rounded-full">
            <Eye className="h-16 w-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-red-100 text-lg leading-relaxed">
              Our vision is to  a world where no medical emergency is delayed due to blood shortages. By integrating hospital request logs,
              blood bank inventories, and real-time mapping coordinates, LifeLink establishes a single source of truth for critical donations.
            </p>
          </div>
        </motion.div>

        {/* Values Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center text-red-600 mb-4">
                  <val.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
