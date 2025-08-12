// Import necessary modules
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors'); // For Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Your MongoDB connection function
const path = require('path'); // Kept as per original, though not directly used in this snippet

// --- Route Imports ---
// Authentication Routes
const authRoutes = require('./routes/authRoutes');
// CRUD Routes
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const orderRoutes = require('./routes/orderRoutes');
// Simulation Routes
const simulationRoutes = require('./routes/simulationRoutes'); // CORRECTED TYPO HERE
const { errorHandler } = require('./middleware/errorMiddleware'); // Import error handler


// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON requests
app.use(cors()); // Enable CORS for all routes

// --- API Routes ---
app.use('/api/auth', authRoutes); // Authentication routes (e.g., /api/auth/login)
app.use('/api/drivers', driverRoutes); // Driver CRUD routes
app.use('/api/routes', routeRoutes);    // Route CRUD routes
app.use('/api/orders', orderRoutes);    // Order CRUD routes
app.use('/api/simulation', simulationRoutes); // Simulation route

// Basic route for API health check
app.get('/', (req, res) => {
    res.send('GreenCart Logistics API is running...');
});

// --- Error Handling Middleware (MUST be last middleware before app.listen) ---
app.use(errorHandler); // Use your centralized error handler

// Define the port to listen on
const PORT = process.env.PORT || 5000; // Render injects its own PORT env variable

// Connect to MongoDB and then start the server
connectDB()
    .then(() => {
        console.log('Database connected successfully! 🎉');

        // Start the server only after successful database connection
        app.listen(PORT, () => {
            // Log the actual port being used, which will be Render's assigned port in deployment
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process with failure
    });

// REMOVED: The redundant global error handling middleware was here.
// Your `errorHandler` from `middleware/errorMiddleware.js` is now sufficient.
