const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriverById,
  addDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

// All driver routes require authentication and manager role
router.route('/')
  .get(protect, authorizeRoles('manager', 'admin'), getDrivers) // Get all drivers
  .post(protect, authorizeRoles('manager', 'admin'), addDriver); // Add new driver

router.route('/:id')
  .get(protect, authorizeRoles('manager', 'admin'), getDriverById) // Get driver by ID
  .put(protect, authorizeRoles('manager', 'admin'), updateDriver) // Update driver by ID
  .delete(protect, authorizeRoles('manager', 'admin'), deleteDriver); // Delete driver by ID

module.exports = router;
