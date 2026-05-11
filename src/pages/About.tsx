import React from 'react';
import { Shield, Heart, Users, Clock } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About LifeLink</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We are on a mission to bridge the gap between blood donors and those in critical need, making blood donation faster, smarter, and more accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4 text-lg">
            LifeLink was born out of a simple yet critical realization: during medical emergencies, finding the right blood type in time is often the biggest hurdle. Traditional systems can be slow, and time is a luxury patients don't have.
          </p>
          <p className="text-gray-600 text-lg">
            By leveraging real-time location data and a dedicated community of donors, we've created a platform that connects those in need directly with nearby donors who are ready to help.
          </p>
        </div>
        <div className="bg-red-50 p-8 rounded-2xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Save Lives</h3>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Clock className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Real-time</h3>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Community</h3>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Secure</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
