const express = require('express');
const router = express.Router(); // <--- IMPORTANT: Initialize Express Router
const {
  getOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

// All order routes require authentication and manager role
router.route('/')
  .get(protect, authorizeRoles('manager', 'admin'), getOrders) // Using getOrders function
  .post(protect, authorizeRoles('manager', 'admin'), addOrder); // Using addOrder function

router.route('/:id')
  .get(protect, authorizeRoles('manager', 'admin'), getOrderById) // Using getOrderById function
  .put(protect, authorizeRoles('manager', 'admin'), updateOrder) // Using updateOrder function
  .delete(protect, authorizeRoles('manager', 'admin'), deleteOrder); // Using deleteOrder function

module.exports = router; // <--- CRUCIAL: Export the router instance
