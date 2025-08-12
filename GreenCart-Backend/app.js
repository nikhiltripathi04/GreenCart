// Import necessary modules
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors'); // For Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Your MongoDB connection function
const path = require('path'); // Although not used directly in this snippet, it's kept as per original

// --- Route Imports ---
// Authentication Routes
const authRoutes = require('./routes/authRoutes');
// CRUD Routes
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const orderRoutes = require('./routes/orderRoutes');
// Simulation Routes
const simulationRoutes = require('./routes/simulatonRoutes');
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

// --- Error Handling Middleware (MUST be last middleware) ---
app.use(errorHandler);

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start the server
connectDB()
    .then(() => {
        console.log('Database connected successfully! 🎉');

        // Start the server only after successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process with failure
    });

// Global error handling middleware - placed after all other routes and middleware
// This catches any errors passed to `next(err)`
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the stack trace for debugging
    res.status(500).json({ message: 'Server Error' }); // Send a generic error response
});
