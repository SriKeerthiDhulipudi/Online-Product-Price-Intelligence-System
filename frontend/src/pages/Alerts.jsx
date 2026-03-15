import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { Bell, TrendingDown, Trash2 } from "lucide-react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = () => {
    const saved = JSON.parse(localStorage.getItem("priceAlerts")) || {};
    // Transform object keys/values into an array and filter invalid ones
    const alertsList = Object.entries(saved)
      .map(([title, data]) => {
        if (data && typeof data === 'object' && data.product) {
          return {
            title,
            ...data
          };
        }
        return null;
      })
      .filter(alert => alert !== null);
    setAlerts(alertsList);
  };

  useEffect(() => {
    loadAlerts();
    
    // Listen for updates from ProductCard
    window.addEventListener('alertsUpdated', loadAlerts);
    return () => window.removeEventListener('alertsUpdated', loadAlerts);
  }, []);

  const clearAlerts = () => {
    if (window.confirm("Are you sure you want to clear all price alerts?")) {
      localStorage.removeItem("priceAlerts");
      setAlerts([]);
      window.dispatchEvent(new Event('alertsUpdated'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingDown className="text-primary-600" /> My Price Alerts
          </h2>
          <p className="text-gray-500">Products you're tracking for price drops.</p>
        </div>
        
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="px-6 py-2.5 bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold rounded-xl transition-all border border-primary-100 active:scale-95"
          >
            Clear All Alerts
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-24 glass-panel bg-white/50 border-dashed border-2">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-400">No active alerts</h3>
          <p className="text-gray-500 mt-2">Set price alerts on products to see them here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {alerts.map((alert, i) => (
            <div key={`${alert.title}-${i}`} className="relative">
              <ProductCard 
                product={alert.product} 
                isBestDeal={false} 
              />
              <div className="absolute top-4 right-20 hidden md:flex items-center gap-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-primary-500/30">
                Target: ${alert.targetPrice}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;
