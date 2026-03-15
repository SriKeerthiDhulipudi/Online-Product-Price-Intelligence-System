import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Bell, X, CheckSquare, Heart, TrendingDown } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(() => {
    return (JSON.parse(localStorage.getItem("wishlist")) || []).length;
  });
  const [alertCount, setAlertCount] = useState(() => {
    return Object.keys(JSON.parse(localStorage.getItem("priceAlerts")) || {}).length;
  });
  const dropdownRef = useRef(null);

  const updateWishlistCount = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(saved.length);
  };

  const updateAlertCount = () => {
    const saved = JSON.parse(localStorage.getItem("priceAlerts")) || {};
    setAlertCount(Object.keys(saved).length);
  };

  useEffect(() => {
    fetchNotifications();
    updateWishlistCount();
    updateAlertCount();

    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    window.addEventListener('alertsUpdated', updateAlertCount);
    window.addEventListener('storage', () => {
      updateWishlistCount();
      updateAlertCount();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      window.removeEventListener('alertsUpdated', updateAlertCount);
      window.removeEventListener('storage', updateWishlistCount);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/prices/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/prices/mark-read/${id}`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 glass-panel border-b-0 rounded-none bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300 group-active:scale-95">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-dark-900 group-hover:text-primary-700 transition-colors duration-300">
              Price<span className="text-primary-600">Intel</span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <input 
                type="text" 
                placeholder="Search products or paste URL to compare..." 
                className="w-full bg-dark-50/50 border border-gray-200 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm group-hover:bg-white/80 hover:shadow-md hover:border-primary-300"
              />
              <Search className="absolute text-gray-400 left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-hover:text-primary-600 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Link 
                to="/wishlist" 
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors relative flex items-center justify-center"
                title="View wishlist"
              >
                <Heart size={22} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="relative">
              <Link 
                to="/alerts" 
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative flex items-center justify-center mr-1"
                title="View active alerts"
              >
                <TrendingDown size={22} className={alertCount > 0 ? "text-primary-600" : ""} />
                {alertCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 transition-colors ${notif.is_read ? 'bg-white' : 'bg-primary-50/30'}`}>
                          <div className="flex justify-between items-start gap-2">
                             <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                              {notif.message}
                            </p>
                            {!notif.is_read && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="shrink-0 text-primary-600 hover:text-primary-700"
                                title="Mark as read"
                              >
                                <CheckSquare size={16} />
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-2 block">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/auth" className="flex items-center gap-2 hover:bg-gray-100 p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-gray-200 active:scale-95">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold border border-primary-200 shadow-sm">
                ?
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
