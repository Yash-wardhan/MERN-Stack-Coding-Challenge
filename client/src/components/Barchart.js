import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ month }) => {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    fetchBarData();
  }, [month]);

  const fetchBarData = async () => {
    const response = await axios.get(`http://localhost:3001/bar-chart`, {
      params: { month },
    });
    setBarData(response.data);
  };

  const chartData = {
    labels: barData.map((data) => data.range),
    datasets: [
      {
        label: 'Number of Items',
        data: barData.map((data) => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'category',
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h3>Price Range Bar Chart</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default BarChart;