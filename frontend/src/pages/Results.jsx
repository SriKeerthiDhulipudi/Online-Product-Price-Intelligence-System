import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Results() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [products, setProducts] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch(
      `http://127.0.0.1:8000/api/prices/compare?keyword=${query}&min_rating=0`,
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setBestDeal(data.best_deal || null);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      <div className="mb-10">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Search Results
        </h2>
        <p className="text-gray-500">
          Showing results for <span className="text-primary-600 font-semibold">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-16 h-16 bg-primary-100 rounded-full mb-4 animate-bounce"></div>
          <p className="text-gray-500 font-medium font-display">Searching for the best deals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <ProductCard 
              key={i} 
              product={p} 
              isBestDeal={bestDeal && p.link === bestDeal.link} 
            />
          ))}
          
          {products.length === 0 && !loading && (
            <div className="text-center py-20 glass-panel">
              <p className="text-gray-500">No products found for this search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Results;
