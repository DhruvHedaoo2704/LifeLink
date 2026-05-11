import React from 'react';
import { ShieldCheck, AlertCircle, HeartPulse, Stethoscope } from 'lucide-react';

const SafetyGuidelines = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety & Guidelines</h1>
        <p className="text-xl text-gray-600">
          Your health and safety are our top priorities. Please read through these guidelines before donating.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <HeartPulse className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Pre-Donation Guidelines</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Ensure you are in good health and feeling well.</li>
              <li>You must be at least 18 years old and weigh at least 50kg (110 lbs).</li>
              <li>Have a healthy meal before donating—avoid fatty foods.</li>
              <li>Drink plenty of water and stay hydrated.</li>
              <li>Bring a valid photo ID.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who Should Not Donate</h2>
            <p className="text-gray-600 mb-4">You should abstain from donating blood if you:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Have had a tattoo, piercing, or acupuncture in the last 6 months.</li>
              <li>Are currently pregnant or have given birth in the last 6 months.</li>
              <li>Have tested positive for HIV, Hepatitis B, or Hepatitis C.</li>
              <li>Have traveled to areas with high malaria risk recently.</li>
              <li>Are taking certain medications (consult with the medical staff).</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Post-Donation Care</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Rest for at least 10-15 minutes immediately after donating.</li>
              <li>Drink extra fluids over the next 24 hours.</li>
              <li>Avoid heavy lifting or strenuous exercise for the rest of the day.</li>
              <li>Keep the bandage on for a few hours.</li>
              <li>If you feel dizzy, lie down with your feet elevated.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SafetyGuidelines;
