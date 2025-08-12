// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Import Mongoose models
const Driver = require('./models/Driver');
const Route = require('./models/Route');
const Order = require('./models/Order'); // Make sure this is the updated Order model

// MongoDB Connection URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/greencart';

// Function to connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI); // Removed deprecated options
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
}

// Function to read CSV and insert data
async function ingestData() {
  await connectDB();

  try {
    // Clear existing data before ingesting new data (optional, but good for fresh starts)
    console.log('Clearing existing data...');
    await Promise.all([
      Driver.deleteMany({}),
      Route.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('Existing data cleared.');

    // --- Ingest Routes Data ---
    const routesData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, 'data', 'routes.csv'))
        .pipe(csv())
        .on('data', (row) => {
          routesData.push({
            routeId: row.route_id,
            distanceInKm: parseFloat(row.distance_km),
            trafficLevel: row.traffic_level,
            baseTime: parseInt(row.base_time_min),
          });
        })
        .on('end', () => {
          console.log('Routes CSV data parsed.');
          resolve();
        })
        .on('error', reject);
    });

    const insertedRoutes = await Route.insertMany(routesData);
    console.log(`${insertedRoutes.length} routes ingested successfully.`);

    const routeIdMap = new Map(insertedRoutes.map(route => [route.routeId, route._id]));

    // --- Ingest Drivers Data ---
    const driversData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, 'data', 'drivers.csv'))
        .pipe(csv())
        .on('data', (row) => {
          driversData.push({
            name: row.name,
            currentShiftHours: parseFloat(row.shift_hours),
            past7DayWorkHours: row.past_week_hours.split('|').reduce((sum, hours) => sum + parseFloat(hours), 0),
          });
        })
        .on('end', () => {
          console.log('Drivers CSV data parsed.');
          resolve();
        })
        .on('error', reject);
    });

    const insertedDrivers = await Driver.insertMany(driversData);
    console.log(`${insertedDrivers.length} drivers ingested successfully.`);

    // --- Ingest Orders Data ---
    const ordersData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, 'data', 'orders.csv'))
        .pipe(csv())
        .on('data', (row) => {
          // CHANGED: Convert delivery_time (HH:MM) to total minutes for actualDeliveryDurationMinutes
          const [durationHours, durationMinutes] = row.delivery_time.split(':').map(Number);
          const actualDeliveryDuration = (durationHours * 60) + durationMinutes;

          ordersData.push({
            orderId: row.order_id,
            valueRs: parseFloat(row.value_rs),
            assignedRoute: routeIdMap.get(row.route_id),
            actualDeliveryDurationMinutes: actualDeliveryDuration, // Store as duration
          });
        })
        .on('end', () => {
          console.log('Orders CSV data parsed.');
          resolve();
        })
        .on('error', reject);
    });

    const insertedOrders = await Order.insertMany(ordersData);
    console.log(`${insertedOrders.length} orders ingested successfully.`);

    console.log('Data ingestion complete!');

  } catch (error) {
    console.error('Error during data ingestion:', error);
  } finally {
    mongoose.disconnect(); // Disconnect from MongoDB after ingestion
    console.log('MongoDB disconnected.');
  }
}

// Run the ingestion script
ingestData();
