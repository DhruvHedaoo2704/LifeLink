import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare,
  Send,
  X,
  Sparkles,
  Bot,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { connectSocket } from '../../services/socket';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Chatbot Drawer state
  const [chatOpen, setChatOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ _id?: string; sender: 'bot' | 'user'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Unread Notifications state
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data?.success) {
        const unreadList = res.data.data.filter((n: any) => n.status !== 'read');
        setUnreadNotifications(unreadList.length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications count:', err);
    }
  };

  // Fetch unread notifications count and subscribe to updates
  useEffect(() => {
    fetchUnreadCount();

    const socket = connectSocket();

    const handleNotificationCreated = () => {
      fetchUnreadCount();
    };

    socket.on('notification-created', handleNotificationCreated);

    return () => {
      socket.off('notification-created', handleNotificationCreated);
    };
  }, []);

  // Sync conversation history when chat opens
  useEffect(() => {
    if (chatOpen) {
      const loadHistory = async () => {
        setChatLoading(true);
        try {
          const res = await apiClient.get('/assistant');
          if (res.data?.success) {
            setChatMessages(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load chat history:', err);
        } finally {
          setChatLoading(false);
        }
      };
      loadHistory();
    }
  }, [chatOpen]);

  // Keep chat window scrolled to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  // Sidebar Links based on role
  const getSidebarLinks = () => {
    const defaultLinks = [
      { to: '/emergency-contacts', label: 'Emergency Contacts', icon: Phone }
    ];

    if (user.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard', icon: Bot },
        { to: '/find-donors', label: 'Find Donors', icon: MapPin },
        { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
        { to: '/history', label: 'History', icon: Clock },
        ...defaultLinks
      ];
    }

    if (user.role === 'hospital') {
      return [
        { to: '/hospital', label: 'Dashboard', icon: Bot },
        { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
        { to: '/history', label: 'History', icon: Clock },
        ...defaultLinks
      ];
    }

    if (user.role === 'blood_bank') {
      return [
        { to: '/blood-bank', label: 'Dashboard', icon: Bot },
        { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
        { to: '/history', label: 'History', icon: Clock },
        ...defaultLinks
      ];
    }

    // Donor & Recipient role
    return [
      { to: '/dashboard', label: 'Dashboard', icon: Bot },
      { to: '/find-donors', label: 'Find Donors', icon: MapPin },
      { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
      { to: '/history', label: 'History', icon: Clock },
      ...defaultLinks
    ];
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatSending) return;
    setChatSending(true);

    const tempUserMsg = { sender: 'user' as const, text: textToSend.trim() };
    setChatMessages(prev => [...prev, tempUserMsg]);
    setChatInput('');

    try {
      const res = await apiClient.post('/assistant', { text: textToSend.trim() });
      if (res.data?.success) {
        const { userMessage, botMessage } = res.data.data;
        setChatMessages(prev => {
          const filtered = prev.filter(m => m !== tempUserMsg);
          return [...filtered, userMessage, botMessage];
        });
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to AI server. Please try again later.' }
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handlePresetClick = (presetText: string) => {
    handleSendMessage(presetText);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar - Mockup Style */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <Droplet className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">LifeLink</span>
          </Link>

          <nav className="space-y-1">
            {getSidebarLinks().map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-red-600' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Dashboard Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>Hyderabad, TS</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 hover:opacity-90 focus:outline-none"
              >
                <div className="bg-red-100 text-red-600 h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="text-gray-700 font-semibold text-sm hidden sm:block">{user.name}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    {/* Invisible click-away overlay */}
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Profile & Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Chatbot Assistant - Mockup 12 */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          <span className="text-xs font-bold hidden md:inline">AI Assistant</span>
        </motion.button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[450px]"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <div>
                    <h3 className="font-bold text-sm">LifeLink AI Assistant</h3>
                    <p className="text-[10px] text-red-100">Online | Donation Guide</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)}>
                  <X className="h-4 w-4 text-red-100" />
                </button>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                {chatLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400 font-bold space-y-2">
                    <Sparkles className="h-6 w-6 text-red-500 animate-spin" />
                    <span>Loading chat logs...</span>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                    <Sparkles className="h-8 w-8 text-red-500 animate-pulse" />
                    <h4 className="font-extrabold text-gray-900 text-xs">Welcome to LifeLink AI!</h4>
                    <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed">
                      Ask me about donation guidelines, recovery times, compatibility rules, or nearby blood reserves.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-red-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Preset suggestion chips matching Mockup 12 */}
              <div className="px-4 py-2 flex flex-col gap-1.5 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  disabled={chatSending || chatLoading}
                  onClick={() => handlePresetClick("Can I donate blood after fever?")}
                  className="text-[11px] font-semibold bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all text-left shadow-sm truncate disabled:opacity-50"
                >
                  Can I donate blood after fever?
                </button>
                <button
                  type="button"
                  disabled={chatSending || chatLoading}
                  onClick={() => handlePresetClick("Nearest hospital with O+ blood?")}
                  className="text-[11px] font-semibold bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all text-left shadow-sm truncate disabled:opacity-50"
                >
                  Nearest hospital with O+ blood?
                </button>
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim()) handleSendMessage(chatInput);
                }} 
                className="p-3 border-t border-gray-100 flex gap-2 bg-white"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatSending || chatLoading}
                  placeholder={chatSending ? "AI is typing..." : "Type your message..."}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatSending || chatLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default DashboardLayout;
