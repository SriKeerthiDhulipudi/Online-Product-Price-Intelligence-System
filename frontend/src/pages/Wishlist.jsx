import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(saved);
  };

  useEffect(() => {
    loadWishlist();
    
    // Listen for updates from ProductCard
    window.addEventListener('wishlistUpdated', loadWishlist);
    return () => window.removeEventListener('wishlistUpdated', loadWishlist);
  }, []);

  const clearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      localStorage.removeItem("wishlist");
      setWishlist([]);
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">❤️ My Wishlist</h2>
          <p className="text-gray-500">Items you've saved for later.</p>
        </div>
        
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl transition-all border border-red-100 active:scale-95"
          >
            Clear All
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 glass-panel bg-white/50 border-dashed border-2">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-gray-300">❤️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-400">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2">Start searching for products to add them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item, i) => (
            <ProductCard 
              key={`${item.link}-${i}`} 
              product={item} 
              isBestDeal={false} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
