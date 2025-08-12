const express = require('express');
const router = express.Router();
const {
  getRoutes,
  getRouteById,
  addRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

// All route routes require authentication and manager role
router.route('/')
  .get(protect, authorizeRoles('manager', 'admin'), getRoutes) // Get all routes
  .post(protect, authorizeRoles('manager', 'admin'), addRoute); // Add new route

router.route('/:id')
  .get(protect, authorizeRoles('manager', 'admin'), getRouteById) // Get route by ID
  .put(protect, authorizeRoles('manager', 'admin'), updateRoute) // Update route by ID
  .delete(protect, authorizeRoles('manager', 'admin'), deleteRoute); // Delete route by ID

module.exports = router;
