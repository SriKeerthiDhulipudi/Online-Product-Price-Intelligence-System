/* eslint-disable no-undef */
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!query.trim()) {
      alert("Please enter a product name");
      return;
    }

    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  // Open file selector
  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  // Upload image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    console.log("Selected file:", file); // add this

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload/image-search", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("UPLOAD RESULT:", data);

      if (data.product) {
        navigate(`/results?q=${encodeURIComponent(data.product)}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Find the <span className="text-blue-600">Perfect Price</span>
            <br /> in Seconds
          </h1>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center">
              <Search className="h-6 w-6 text-gray-400" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full p-5 pl-14 text-lg border rounded-2xl shadow-xl"
              placeholder="Paste product URL or search by name..."
            />

            <div className="absolute inset-y-2 right-2 flex items-center gap-2">
              {/* Upload Button */}
              <button
                type="button"
                onClick={openFilePicker}
                className="p-3 text-gray-500 hover:text-blue-600 rounded-xl"
                title="Search by Image"
              >
                <Upload size={24} />
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />

              {/* Search Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16 animate-slide-up">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Verified Sellers</h3>
            <p className="text-gray-500 text-sm">
              We only aggregate prices from trusted platforms.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Data</h3>
            <p className="text-gray-500 text-sm">
              Prices are checked the moment you search.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Price History</h3>
            <p className="text-gray-500 text-sm">
              View historical price trends.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
