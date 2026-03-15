import React, { useEffect, useState } from "react";
import { TrendingDown, Star, ExternalLink, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CompareView() {
  const [comparisonList, setComparisonList] = useState([]);
  const navigate = useNavigate();

  const loadList = () => {
    const saved = JSON.parse(localStorage.getItem("comparisonList")) || [];
    setComparisonList(saved);
  };

  useEffect(() => {
    loadList();
    window.addEventListener('comparisonUpdated', loadList);
    return () => window.removeEventListener('comparisonUpdated', loadList);
  }, []);

  const removeItem = (link) => {
    const updated = comparisonList.filter(item => item.link !== link);
    localStorage.setItem("comparisonList", JSON.stringify(updated));
    window.dispatchEvent(new Event('comparisonUpdated'));
  };

  const clearAll = () => {
    localStorage.removeItem("comparisonList");
    window.dispatchEvent(new Event('comparisonUpdated'));
    navigate(-1);
  };

  if (comparisonList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 mt-20 text-center">
         <h2 className="text-2xl font-bold text-gray-400">No products selected for comparison</h2>
         <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 font-bold flex items-center gap-2 mx-auto">
            <ArrowLeft size={18} /> Back to Search
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Compare Products</h2>
          <p className="text-gray-500">Side-by-side analysis of your top picks.</p>
        </div>
        <button
          onClick={clearAll}
          className="px-6 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold rounded-xl transition-all active:scale-95"
        >
          Clear Comparison
        </button>
      </div>

      <div className="overflow-x-auto pb-6">
        <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-6 text-left text-sm font-bold text-gray-400 uppercase tracking-widest min-w-[200px]">Feature</th>
              {comparisonList.map((item, i) => (
                <th key={i} className="p-6 min-w-[280px] group relative">
                  <button 
                    onClick={() => removeItem(item.link)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                       <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-center font-bold text-gray-900 line-clamp-2 px-2">
                      {item.title}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Price Row */}
            <tr>
              <td className="p-6 text-sm font-bold text-gray-500">Price</td>
              {comparisonList.map((item, i) => (
                <td key={i} className="p-6 text-center">
                  <span className="text-2xl font-display font-bold text-gray-900">${item.price_val || item.price}</span>
                </td>
              ))}
            </tr>
            {/* Store Row */}
            <tr>
              <td className="p-6 text-sm font-bold text-gray-500">Store</td>
              {comparisonList.map((item, i) => (
                <td key={i} className="p-6 text-center">
                  <span className="px-3 py-1 bg-dark-50 text-dark-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.source || 'Unknown'}
                  </span>
                </td>
              ))}
            </tr>
            {/* Rating Row */}
            <tr>
              <td className="p-6 text-sm font-bold text-gray-500">Rating</td>
              {comparisonList.map((item, i) => (
                <td key={i} className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                    <Star size={16} className="fill-current" /> {item.rating || "4.0"}
                  </div>
                </td>
              ))}
            </tr>
            {/* Shipping Row */}
            <tr>
              <td className="p-6 text-sm font-bold text-gray-500">Shipping</td>
              {comparisonList.map((item, i) => (
                <td key={i} className="p-6 text-center text-gray-600 font-medium italic">
                  {item.shipping || "N/A"}
                </td>
              ))}
            </tr>
            {/* Action Row */}
            <tr>
              <td className="p-6 text-sm font-bold text-gray-500">Store Link</td>
              {comparisonList.map((item, i) => (
                <td key={i} className="p-6 text-center">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 active:scale-95 text-sm"
                  >
                    View Store <ExternalLink size={16} />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareView;
