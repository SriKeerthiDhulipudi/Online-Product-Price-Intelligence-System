import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceHistoryChart({ history }) {
  if (!history || Object.keys(history).length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium italic">No price history available yet.</p>
      </div>
    );
  }

  // Generate a list of all unique dates across all stores to use as the X-axis labels
  const allDates = Array.from(
    new Set(
      Object.values(history)
        .flat()
        .map((entry) => new Date(entry.date).toLocaleDateString())
    )
  ).sort((a, b) => new Date(a) - new Date(b));

  const colors = [
    'rgba(37, 99, 235, 1)',   // Blue
    'rgba(245, 158, 11, 1)',  // Amber
    'rgba(16, 185, 129, 1)',  // Emerald
    'rgba(239, 68, 68, 1)',   // Red
    'rgba(139, 92, 246, 1)',  // Violet
  ];

  const datasets = Object.keys(history).map((store, index) => {
    const storeData = history[store];
    const dataPoints = allDates.map((date) => {
      const entry = storeData.find(
        (e) => new Date(e.date).toLocaleDateString() === date
      );
      return entry ? entry.price : null;
    });

    return {
      label: store,
      data: dataPoints,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
      tension: 0.3,
      fill: true,
      spanGaps: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const chartData = {
    labels: allDates,
    datasets: datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return '₹' + value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl">
      <Line data={chartData} options={options} />
    </div>
  );
}
