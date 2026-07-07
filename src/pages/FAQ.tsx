import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: 'Who is eligible to donate blood?',
      a: 'Generally, donors must be in good health, weigh at least 50 kg (110 lbs), and be between 18 and 65 years old. You should not have donated blood in the last 90 days, and should not have active infectious diseases.'
    },
    {
      q: 'Is my geolocation visible to everyone?',
      a: 'No, donor safety and privacy are critical. Your coordinates are only visible on active emergency requests when you explicitly click "Accept" to respond. You can toggle location sharing off in your profile settings at any time.'
    },
    {
      q: 'How does the emergency matching work?',
      a: 'When a recipient or hospital submits a critical request, our backend calculates proximity using MongoDB geospatial math. Available compatible donors within a 10km radius are immediately notified via Socket.IO real-time channels.'
    },
    {
      q: 'What are LifeLink Points used for?',
      a: 'LifeLink rewards donor heroism. Points earned through completed emergency donations let you unlock rare achievements, badges, and recognition on the local Leaderboard.'
    },
    {
      q: 'How do hospitals verify a donation?',
      a: 'Once you arrive at the medical facility and complete the donation, the hospital records the completed status on their Hospital Dashboard. This automatically archives the emergency request, logs your donation history, and updates your points.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleOpen = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HelpCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <h1 className="text-4xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-2 text-sm">Find answers to general questions about donation protocols and the LifeLink engine.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleOpen(idx)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-base">{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-gray-50"
                    >
                      <div className="p-5 text-gray-600 text-sm leading-relaxed bg-gray-50/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
