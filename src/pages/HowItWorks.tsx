import React from 'react';
import { Search, MapPin, Bell, HeartHandshake } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-red-500" />,
      title: "Register & Profile",
      description: "Sign up as a donor or a patient. Donors provide their blood group and location, making themselves available for emergencies."
    },
    {
      icon: <Bell className="h-10 w-10 text-red-500" />,
      title: "Emergency Alert",
      description: "When a patient needs blood, they raise an emergency request specifying the blood type, urgency, and hospital location."
    },
    {
      icon: <MapPin className="h-10 w-10 text-red-500" />,
      title: "Smart Matching",
      description: "Our system instantly notifies nearby compatible donors using geolocation, drastically reducing the time spent searching."
    },
    {
      icon: <HeartHandshake className="h-10 w-10 text-red-500" />,
      title: "Connect & Save",
      description: "Available donors accept the request and coordinate directly with the patient or hospital to complete the life-saving donation."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How LifeLink Works</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A seamless, fast, and location-aware process to ensure blood reaches those who need it, exactly when they need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="mb-6">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
