import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "How does LifeLink connect me to donors?",
      answer: "LifeLink uses geolocation APIs to match your emergency request with nearby registered donors of the required blood type. This drastically reduces the time spent finding a willing donor."
    },
    {
      question: "Is LifeLink free to use?",
      answer: "Yes, LifeLink is completely free for both donors and patients. Our mission is to save lives, not make a profit from emergencies."
    },
    {
      question: "How do I know if the blood is safe?",
      answer: "LifeLink connects you with potential donors. However, the actual donation must happen at a certified hospital or blood bank where medical professionals will screen the donor and the blood for safety."
    },
    {
      question: "Can I register as a donor if I don't know my blood type?",
      answer: "We strongly recommend finding out your blood type from a medical professional before registering as a donor, so that we can accurately match you during emergencies."
    },
    {
      question: "What if I am registered but cannot donate right now?",
      answer: "You can easily toggle your 'Availability Status' in your dashboard. If you mark yourself as 'Unavailable', you will not receive emergency alerts until you change it back."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">
          Find answers to common questions about LifeLink and the donation process.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
