const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true,
  },
  distanceInKm: {
    type: Number,
    required: true,
  },
  trafficLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  baseTime: { // Base time in minutes
    type: Number,
    required: true,
  },
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;