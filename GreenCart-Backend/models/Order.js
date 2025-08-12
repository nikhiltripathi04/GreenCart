const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  valueRs: {
    type: Number,
    required: true,
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route', // Reference to the Route model
  },
  // CHANGED: Renamed from deliveryTimestamp to actualDeliveryDurationMinutes
  // This will store the actual time taken for delivery in minutes, as parsed from orders.csv
  actualDeliveryDurationMinutes: {
    type: Number,
    required: true, // This field is crucial for calculations
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
