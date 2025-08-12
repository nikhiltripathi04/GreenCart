const mongoose = require('mongoose');

// Define the schema for storing simulation results
const simulationResultSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the creation timestamp
  },
  numberOfDrivers: {
    type: Number,
    required: true,
  },
  routeStartTime: { // Stored as HH:MM string for simplicity
    type: String,
    required: true,
  },
  maxHoursPerDay: {
    type: Number,
    required: true,
  },
  totalProfit: {
    type: Number,
    required: true,
  },
  efficiencyScore: {
    type: Number,
    required: true,
  },
  onTimeDeliveries: {
    type: Number,
    required: true,
  },
  totalDeliveries: {
    type: Number,
    required: true,
  },
  totalFuelCost: {
    type: Number,
    required: true,
  },
  // You can add more detailed results if needed for future analysis or display:
  // lateDeliveries: { type: Number, default: 0 },
  // totalBonusPaid: { type: Number, default: 0 },
  // totalPenaltiesApplied: { type: Number, default: 0 },
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create the Mongoose model from the schema
const SimulationResult = mongoose.model('SimulationResult', simulationResultSchema);

module.exports = SimulationResult;
