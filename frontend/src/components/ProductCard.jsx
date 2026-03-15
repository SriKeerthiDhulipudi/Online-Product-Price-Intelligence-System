import React, { useState } from 'react';
import { ExternalLink, Star, Award, TrendingDown, DollarSign, Truck, BarChart3, Bell, X, Heart, CheckSquare } from 'lucide-react';
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
    if (!product) return false;
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    return saved.some(item => item.link === product.link);
  });
  const [isComparing, setIsComparing] = useState(() => {
    if (!product) return false;
    const saved = JSON.parse(localStorage.getItem("comparisonList")) || [];
    return saved.some(item => item.link === product.link);
  });
  const [activeAlert, setActiveAlert] = useState(() => {
    if (!product) return null;
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

  const toggleCompare = (e) => {
    const saved = JSON.parse(localStorage.getItem("comparisonList")) || [];
    let updated;
    
    if (isComparing) {
      updated = saved.filter(item => item.link !== product.link);
      setIsComparing(false);
    } else {
      if (saved.length >= 4) {
        alert("You can compare up to 4 products at a time.");
        return;
      }
      updated = [...saved, product];
      setIsComparing(true);
    }
    
    localStorage.setItem("comparisonList", JSON.stringify(updated));
    window.dispatchEvent(new Event('comparisonUpdated'));
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
    <div className={`relative flex flex-col gap-4 p-5 bg-white rounded-3xl transition-all duration-300 ${isBestDeal ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/20 md:scale-[1.02]' : 'border border-gray-100 shadow-md hover:shadow-lg'}`}>
      {/* Best Deal Badge */}
      {isBestDeal && (
        <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm">
          <Award size={16} /> Best Value
        </div>
      )}

      {/* Product Image */}
      <div className="w-full h-56 bg-gray-50 rounded-2xl flex items-center justify-center p-6 overflow-hidden shrink-0 border border-gray-50 relative group">
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider z-10 shadow-sm ${getStoreStyle(product.source)}`}>
          {getStoreLogoText(product.source)}
        </div>
        
        {/* Wishlist and Alert buttons moved to overlay the image for a cleaner grid look */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleWishlist}
            className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${isInWishlist ? 'text-red-500 bg-white' : 'text-gray-500 bg-white/80 hover:text-red-500 hover:bg-white'}`}
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setShowAlertDialog(true)}
            className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${activeAlert ? 'text-primary-600 bg-white' : 'text-gray-500 bg-white/80 hover:text-primary-600 hover:bg-white'}`}
          >
            <Bell size={18} className={activeAlert ? "animate-pulse" : ""} />
            {activeAlert && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                ${activeAlert}
              </span>
            )}
          </button>
        </div>

        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="text-gray-300 font-display font-bold text-lg">No Image</div>
        )}
      </div>

      {/* Details Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer mb-2 h-10">
            {product.title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-bold">
                <Star size={12} className="fill-current" />
                <span>{product.rating?.toFixed(1) || "4.0"}</span>
              </div>
              <button
                onClick={fetchHistory}
                disabled={isLoadingHistory}
                className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-1"
              >
                <BarChart3 size={12} /> History
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isComparing}
                  onChange={toggleCompare}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border-2 border-gray-200 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all flex items-center justify-center text-white">
                  <CheckSquare size={10} className={isComparing ? "opacity-100 scale-100" : "opacity-0 scale-50"} />
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compare</span>
            </label>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50 mt-auto">
          <div className="flex items-start gap-0.5 text-dark-900">
            <span className="text-lg font-bold mt-1">$</span>
            <span className="text-3xl font-display font-bold tracking-tight">{Number(product.price_val || 0).toFixed(2).split('.')[0]}</span>
            <span className="text-base font-bold mt-1 align-top">.{Number(product.price_val || 0).toFixed(2).split('.')[1]}</span>
          </div>

          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-xl transition-all transform active:scale-90 ${isBestDeal
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-primary-600'
              }`}
            title="Buy Now"
          >
            <ExternalLink size={20} />
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
                    onChange={(e) => setAlertConfig({ ...alertConfig, targetPrice: e.target.value })}
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
                  onChange={(e) => setAlertConfig({ ...alertConfig, email: e.target.value })}
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
