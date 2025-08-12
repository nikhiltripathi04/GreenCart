const express = require('express');
const router = express.Router();
const { runSimulation, getSimulationHistory } = require('../controllers/simulationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route to run the simulation (requires authentication and manager role)
router.post('/', protect, authorizeRoles('manager', 'admin'), runSimulation);

// Route to get past simulation history (requires authentication and manager role)
router.get('/history', protect, authorizeRoles('manager', 'admin'), getSimulationHistory);

module.exports = router;
