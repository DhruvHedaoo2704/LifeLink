import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { LogOut, User, Smartphone, Users, Shield, Heart, Zap, Search } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const steps = [
    {
      icon: User,
      title: 'Create Your Profile',
      description: 'Sign up with your basic details. We securely store your blood group, last donation date, and medical history.',
      color: 'bg-red-50'
    },
    {
      icon: Smartphone,
      title: 'Register as a Donor',
      description: 'Complete the quick eligibility check and confirm your availability. Your profile becomes visible to emergency requests nearby.',
      color: 'bg-blue-50'
    },
    {
      icon: Heart,
      title: 'Receive an Emergency Alert',
      description: 'If someone needs your blood type urgently within a 50km radius, you get a real-time notification with precise location details.',
      color: 'bg-green-50'
    },
    {
      icon: Zap,
      title: 'Accept & Donate',
      description: 'Accept the request and follow the navigation to the nearest hospital. The process takes less than an hour of your time.',
      color: 'bg-purple-50'
    },
    {
      icon: Shield,
      title: 'Track Your Impact',
      description: 'After donation, earn badges, track your life-saved count, and get reminders for your next donation cycle.',
      color: 'bg-yellow-50'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-red-100 px-4 py-2 rounded-full mb-6">
            <Heart className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700 font-semibold text-sm uppercase tracking-wide">How It Works</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            From <span className="text-red-600">Donation</span> to <span className="text-red-600">Delivery</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A seamless, life-saving journey powered by real-time matching and community spirit.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-8 w-8 text-red-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing community of lifesavers and be ready when a call comes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => isAuthenticated ? logout() : navigate('/login')}
              className="bg-red-600 text-white hover:bg-red-700 border-red-200 hover:border-red-300"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {isAuthenticated ? 'Logout' : 'Login Now'}
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Heart className="h-5 w-5 mr-2" />
              Become a Donor
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;
