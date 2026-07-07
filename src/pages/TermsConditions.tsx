import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ShieldAlert, HeartHandshake } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-100 pb-6"
        >
          <div className="flex items-center space-x-3 text-red-600 mb-2">
            <Scale className="h-8 w-8" />
            <span className="font-bold text-sm uppercase tracking-wider">Service Rules</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-500 text-xs mt-1">Last Updated: June 8, 2026</p>
        </motion.div>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and registering an account on LifeLink, you agree to be bound by these Terms and Conditions.
              This platform is strictly for matching emergency blood donors with recipients and medical facilities.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">2. Emergency Genuineness</h2>
            <p>
              Users must not create false or misleading emergency requests. Falsifying medical urgency or submitting mock coordinates
              to solicit donor contacts is strictly prohibited and will result in immediate profile suspension and logging in the audit logs
              for legal action.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">3. Non-Commercialization</h2>
            <p>
              Blood donation on LifeLink is entirely voluntary and altruistic. Exchanging money, gifts, or other financial compensations
              for blood requests or donor participation is strictly illegal. Accounts participating in commercialized blood trades
              will be permanently banned.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">4. Medical Disclaimer</h2>
            <p>
              LifeLink does not perform medical screenings. The recipient hospital remains responsible for blood compatibility verification,
              infectious disease testing, and all clinical procedures. Donors must answer all questionnaires honestly at the donation center.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
