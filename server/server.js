const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

//cors

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;
// dotenv 

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB schema and model
const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: String,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Seed database from third-party API
app.get('/seed-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Clear existing data
    await Transaction.deleteMany({});

    // Insert new data into MongoDB
    await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error.message);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// List all transactions with search and pagination
app.get('/transactions', async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const skip = (page - 1) * perPage;
    const filter = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ],
    } : {};

    const transactions = await Transaction.find(filter)
      .skip(skip)
      .limit(parseInt(perPage))
      .exec();

    const totalCount = await Transaction.countDocuments(filter);

    res.status(200).json({ transactions, totalCount });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// API for statistics
// Total sale amount, total sold items, total unsold items of selected month
app.get('/statistics', async (req, res) => {
    try {
      const { month } = req.query;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
      }
  
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
  
      console.log(`Fetching statistics for month: ${month}, startDate: ${startDate}, endDate: ${endDate}`);
  
      const totalSaleAmount = await Transaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startDate, $lt: endDate },
            sold: true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$price' },
            totalSoldItems: { $sum: 1 },
          },
        },
      ]);
  
      const totalNotSoldItems = await Transaction.countDocuments({
        dateOfSale: { $gte: startDate, $lt: endDate },
        sold: false,
      });
  
      res.status(200).json({
        totalSaleAmount: totalSaleAmount.length ? totalSaleAmount[0].totalAmount : 0,
        totalSoldItems: totalSaleAmount.length ? totalSaleAmount[0].totalSoldItems : 0,
        totalNotSoldItems,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

// API for bar chart - price range and item counts for selected month
app.get('/bar-chart', async (req, res) => {
    try {
      const { month } = req.query;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
      }
  
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
  
      console.log(`Generating bar chart for month: ${month}, startDate: ${startDate}, endDate: ${endDate}`);
  
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity },
      ];
  
      const priceRangeCounts = await Promise.all(priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: startDate, $lt: endDate },
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: `${range.min}-${range.max}`, count };
      }));
  
      console.log(`Bar chart data: ${JSON.stringify(priceRangeCounts)}`);
  
      res.status(200).json(priceRangeCounts);
    } catch (error) {
      console.error('Error generating bar chart:', error);
      res.status(500).json({ error: 'Failed to generate bar chart' });
    }
  });

// API for pie chart - unique categories and item counts for selected month
// API for pie chart - unique categories and item counts for selected month
app.get('/pie-chart', async (req, res) => {
    try {
      const { month } = req.query;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
      }
  
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
  
      console.log(`Generating pie chart for month: ${month}, startDate: ${startDate}, endDate: ${endDate}`);
  
      const categoryCounts = await Transaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
  
      console.log(`Pie chart data: ${JSON.stringify(categoryCounts)}`);
  
      res.status(200).json(categoryCounts);
    } catch (error) {
      console.error('Error generating pie chart:', error);
      res.status(500).json({ error: 'Failed to generate pie chart' });
    }
});  

// Combined API fetching data from all above APIs
app.get('/combined-data', async (req, res) => {
    try {
      const { month } = req.query;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
      }
  
      console.log(`Fetching combined data for month: ${month}`);
  
      const [statistics, barChart, pieChart] = await Promise.all([
        fetch(`http://localhost:3000/statistics?month=${month}`).then(response => response.json()),
        fetch(`http://localhost:3000/bar-chart?month=${month}`).then(response => response.json()),
        fetch(`http://localhost:3000/pie-chart?month=${month}`).then(response => response.json())
      ]);
  
      console.log(`Statistics: ${JSON.stringify(statistics)}`);
      console.log(`Bar Chart: ${JSON.stringify(barChart)}`);
      console.log(`Pie Chart: ${JSON.stringify(pieChart)}`);
  
      res.status(200).json({ statistics, barChart, pieChart });
    } catch (error) {
      console.error('Error fetching combined data:', error);
      res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});