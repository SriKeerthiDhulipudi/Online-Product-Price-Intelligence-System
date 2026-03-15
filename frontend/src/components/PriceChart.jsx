import React from "react";

export default function PriceChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxPrice = Math.max(...data.map((p) => Number(p.price)));

  return (
    <div style={{ marginBottom: "30px" }}>
      <h2>📉 Price Comparison</h2>

      {data.slice(0, 5).map((item, index) => (
        <div key={index} style={{ marginBottom: "15px" }}>
          <b>{item.source}</b>
          <div
            style={{
              background: "#eee",
              height: "12px",
              borderRadius: "6px",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                width: `${(item.price / maxPrice) * 100}%`,
                background: "#2563eb",
                height: "12px",
                borderRadius: "6px",
              }}
            />
          </div>
          ₹{item.price}
        </div>
      ))}
    </div>
  );
}
