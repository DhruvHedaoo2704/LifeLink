import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Users, ShieldAlert, Save, Edit } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EmergencyContacts: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState({
    primaryContact: { name: '', phone: '', relation: '' },
    secondaryContact: { name: '', phone: '', relation: '' }
  });

  useEffect(() => {
    if (user?.emergencyContacts) {
      const hasPrimary = !!user.emergencyContacts.primaryContact?.name;
      const hasSecondary = !!user.emergencyContacts.secondaryContact?.name;
      setIsEditing(!(hasPrimary || hasSecondary));
      setContacts({
        primaryContact: {
          name: user.emergencyContacts.primaryContact?.name || '',
          phone: user.emergencyContacts.primaryContact?.phone || '',
          relation: user.emergencyContacts.primaryContact?.relation || ''
        },
        secondaryContact: {
          name: user.emergencyContacts.secondaryContact?.name || '',
          phone: user.emergencyContacts.secondaryContact?.phone || '',
          relation: user.emergencyContacts.secondaryContact?.relation || ''
        }
      });
    } else {
      setIsEditing(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await apiClient.put('/users/profile', { emergencyContacts: contacts });
      setSaved(true);
      setIsEditing(false);
      await fetchProfile(); // Sync profile store
    } catch (err) {
      console.error(err);
      alert('Failed to save emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6"
      >
        <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
          <div className="bg-red-50 p-3 rounded-lg text-red-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
            <p className="text-gray-500 text-xs mt-0.5">We notify these contacts in critical emergency matching scenarios.</p>
          </div>
        </div>

        {saved && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            Emergency contacts updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Contact */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-900 flex items-center">
              <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mr-2">1</span>
              Primary Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={contacts.primaryContact.name}
                  onChange={(e) => setContacts({
                    ...contacts,
                    primaryContact: { ...contacts.primaryContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="Contact Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  disabled={!isEditing}
                  value={contacts.primaryContact.phone}
                  onChange={(e) => setContacts({
                    ...contacts,
                    primaryContact: { ...contacts.primaryContact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="Mobile Number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={contacts.primaryContact.relation}
                  onChange={(e) => setContacts({
                    ...contacts,
                    primaryContact: { ...contacts.primaryContact, relation: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="e.g. Spouse, Parent"
                />
              </div>
            </div>
          </div>

          {/* Secondary Contact */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <h3 className="text-md font-bold text-gray-900 flex items-center">
              <span className="bg-gray-400 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mr-2">2</span>
              Secondary Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={contacts.secondaryContact.name}
                  onChange={(e) => setContacts({
                    ...contacts,
                    secondaryContact: { ...contacts.secondaryContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="Contact Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={contacts.secondaryContact.phone}
                  onChange={(e) => setContacts({
                    ...contacts,
                    secondaryContact: { ...contacts.secondaryContact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="Mobile Number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Relationship</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={contacts.secondaryContact.relation}
                  onChange={(e) => setContacts({
                    ...contacts,
                    secondaryContact: { ...contacts.secondaryContact, relation: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  placeholder="Relationship"
                />
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-4">
              {user?.emergencyContacts?.primaryContact?.name && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    if (user?.emergencyContacts) {
                      setContacts({
                        primaryContact: {
                          name: user.emergencyContacts.primaryContact?.name || '',
                          phone: user.emergencyContacts.primaryContact?.phone || '',
                          relation: user.emergencyContacts.primaryContact?.relation || ''
                        },
                        secondaryContact: {
                          name: user.emergencyContacts.secondaryContact?.name || '',
                          phone: user.emergencyContacts.secondaryContact?.phone || '',
                          relation: user.emergencyContacts.secondaryContact?.relation || ''
                        }
                      });
                    }
                  }}
                  className="w-1/3 justify-center"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1 justify-center">
                {loading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Emergency Contacts
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)} className="w-full justify-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Emergency Contacts
            </Button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default EmergencyContacts;
