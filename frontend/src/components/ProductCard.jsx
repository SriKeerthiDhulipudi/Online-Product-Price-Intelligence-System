import React, { useState } from 'react';
import { ExternalLink, Star, Award, TrendingDown, DollarSign, Truck, BarChart3, Bell, X, Heart } from 'lucide-react';
import PriceHistoryChart from './PriceHistoryChart';
import axios from 'axios';

export default function ProductCard({ product, isBestDeal }) {
  if (!product) return null;
  const [showHistory, setShowHistory] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ email: '', targetPrice: '' });
  const [alertStatus, setAlertStatus] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    return saved.some(item => item.link === product.link);
  });
  const [activeAlert, setActiveAlert] = useState(() => {
    const alerts = JSON.parse(localStorage.getItem("priceAlerts")) || {};
    return alerts[product.title]?.targetPrice || null;
  });

  const fetchHistory = async () => {
    if (historyData) {
      setShowHistory(true);
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      // Trying to fetch by product name since product.id might not be available or correct in search results
      const response = await axios.get(`http://localhost:8000/api/history/${encodeURIComponent(product.title)}`);
      // Transform simple array history to the grouped history the chart expects if needed
      // Or we can adjust the backend to return the right format. 
      // For now, let's assume the backend fix I made handles it or we transform it.
      
      const grouped = {};
      response.data.forEach(p => {
        if (!grouped[p.store]) grouped[p.store] = [];
        grouped[p.store].push({ date: p.date, price: p.price });
      });
      
      setHistoryData(grouped);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSetAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/prices/create-alert', {
        product: product.title,
        target_price: parseFloat(alertConfig.targetPrice),
        email: alertConfig.email
      });
      setAlertStatus('success');
      
      // Save to localStorage for UI persistence
      const alerts = JSON.parse(localStorage.getItem("priceAlerts")) || {};
      alerts[product.title] = {
        product: product,
        targetPrice: alertConfig.targetPrice
      };
      localStorage.setItem("priceAlerts", JSON.stringify(alerts));
      setActiveAlert(alertConfig.targetPrice);
      
      // Dispatch custom event for Navbar count update
      window.dispatchEvent(new Event('alertsUpdated'));

      setTimeout(() => {
        setShowAlertDialog(false);
        setAlertStatus(null);
      }, 2000);
    } catch (error) {
      setAlertStatus('error');
    }
  };
  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    let updated;
    
    if (isInWishlist) {
      updated = saved.filter(item => item.link !== product.link);
      setIsInWishlist(false);
    } else {
      updated = [...saved, product];
      setIsInWishlist(true);
    }
    
    localStorage.setItem("wishlist", JSON.stringify(updated));
    // Dispatch custom event for Navbar count update
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  // Store branding mapping based on source name
  const getStoreStyle = (source) => {
    const s = source?.toLowerCase() || '';
    if (s.includes('amazon')) return 'bg-amber-500 text-white';
    if (s.includes('ebay')) return 'bg-blue-600 text-white';
    if (s.includes('walmart')) return 'bg-sky-500 text-white';
    return 'bg-gray-800 text-white';
  };

  const getStoreLogoText = (source) => {
    const s = source?.toLowerCase() || '';
    if (s.includes('amazon')) return 'Amazon';
    if (s.includes('ebay')) return 'eBay';
    if (s.includes('walmart')) return 'Walmart';
    if (s.includes('fakestore')) return 'FakeStore';
    return source || 'Unknown Store';
  };

  return (
    <div className={`relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl transition-all duration-300 ${isBestDeal ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/20 md:scale-[1.02]' : 'border border-gray-100 shadow-md hover:shadow-lg'}`}>
      {/* Best Deal Badge ... same as before ... */}
      {isBestDeal && (
        <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm transform rotate-3">
          <Award size={16} /> Best Value
        </div>
      )}

      {/* Product Image */}
      <div className="w-full sm:w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center p-4 overflow-hidden shrink-0 border border-gray-100 flex-col">
          <div className={`mb-3 px-3 py-1 rounded text-xs font-bold w-full text-center tracking-wide ${getStoreStyle(product.source)}`}>
            {getStoreLogoText(product.source)}
          </div>
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            <div className="text-gray-400 font-medium text-sm">No Image</div>
          )}
      </div>

      {/* Details Section */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 md:line-clamp-3 mb-2 flex-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleWishlist}
                className={`p-2 rounded-full transition-all ${isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => setShowAlertDialog(true)}
                className={`p-2 rounded-full transition-colors relative ${activeAlert ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                title={activeAlert ? `Alert set at $${activeAlert}` : "Alert me on price drop"}
              >
                <Bell size={20} className={activeAlert ? "animate-pulse" : ""} />
                {activeAlert && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                    ${activeAlert}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded flex-shrink-0">
              <Star size={14} className="fill-current" />
              <span className="font-semibold text-gray-800">{product.rating?.toFixed(1) || "4.0"}</span>
            </div>
            
            <button 
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <BarChart3 size={14} /> {isLoadingHistory ? 'Loading...' : 'Price History'}
            </button>
            
            {(product.shipping && product.shipping !== "Free") && (
              <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                <Truck size={14} /> {product.shipping}
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
             <div className="flex items-start gap-0.5 text-dark-900">
              <span className="text-xl font-bold mt-1.5">$</span>
              <span className="text-4xl font-display font-bold tracking-tight">{Number(product.price_val || 0).toFixed(2).split('.')[0]}</span>
              <span className="text-xl font-bold mt-1.5 align-top">.{Number(product.price_val || 0).toFixed(2).split('.')[1]}</span>
            </div>
          </div>
          
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all transform active:scale-95 ${
              isBestDeal 
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 hover:-translate-y-0.5' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-black'
            }`}
          >
            Buy Now <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Price Intelligence</h2>
                <p className="text-sm text-gray-500 line-clamp-1">{product.title}</p>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <PriceHistoryChart history={historyData} />
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Set Price Alert</h2>
              <button onClick={() => setShowAlertDialog(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSetAlert} className="p-6 space-y-4">
              {alertStatus === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center font-medium">
                  Alert set successfully! We'll notify you.
                </div>
              )}
              {alertStatus === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center font-medium">
                  Failed to set alert. Please try again.
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">When price drops to:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    required
                    placeholder="Enter target price"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    value={alertConfig.targetPrice}
                    onChange={(e) => setAlertConfig({...alertConfig, targetPrice: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address:</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={alertConfig.email}
                  onChange={(e) => setAlertConfig({...alertConfig, email: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] mt-2"
              >
                Set Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
