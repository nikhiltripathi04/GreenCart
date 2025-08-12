const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  currentShiftHours: {
    type: Number,
    default: 0,
  },
  past7DayWorkHours: {
    type: Number,
    default: 0,
  },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;