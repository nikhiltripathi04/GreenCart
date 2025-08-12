const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors'); // Assuming 'colors' is installed for console styling

dotenv.config();

const connectDB = async () => {
  try {
    // Connect to MongoDB without the deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.underline.bold);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;