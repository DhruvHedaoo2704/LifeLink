import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Heart, Shield, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Droplet className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">Life Link</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Connecting donors and recipients in real-time to save lives through emergency blood donations.
              Every drop counts, every moment matters.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-400">Saving lives since 2024</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-500" />
                <span className="text-gray-400">24/7 Hotline</span>
              </div>
              <p className="text-white font-semibold">1-800-LIFE-LINK</p>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="text-gray-400">Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Life Link. All rights reserved. Saving lives together.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;