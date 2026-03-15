import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, X, ChevronRight } from 'lucide-react';

export default function CompareBar() {
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

  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-dark-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-6 min-w-[300px]">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutGrid size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Comparison</p>
            <p className="text-sm font-bold">{comparisonList.length}/4 Selected</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {comparisonList.map((item, i) => (
            <div key={i} className="relative group">
              <div className="w-12 h-12 bg-white rounded-lg p-1 overflow-hidden transition-transform group-hover:scale-105">
                <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <button 
                onClick={() => removeItem(item.link)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {Array.from({ length: 4 - comparisonList.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-12 h-12 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white/10 text-xs text-center leading-none">+</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/compare')}
          disabled={comparisonList.length < 2}
          className={`ml-4 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary-600/20 ${
            comparisonList.length >= 2 
            ? 'bg-primary-600 hover:bg-primary-700 text-white' 
            : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Compare <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
