const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order'); // Make sure this is the updated Order model
const SimulationResult = require('../models/SimulationResult');

// Helper functions (remain unchanged)
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// @desc    Run delivery simulation and calculate KPIs
// @route   POST /api/simulation
// @access  Private (Managers only)
const runSimulation = async (req, res) => {
  const { numberOfDrivers, routeStartTime, maxHoursPerDay } = req.body;

  if (numberOfDrivers === undefined || routeStartTime === undefined || maxHoursPerDay === undefined) {
    return res.status(400).json({ message: 'Please provide numberOfDrivers, routeStartTime, and maxHoursPerDay.' });
  }
  if (numberOfDrivers <= 0 || maxHoursPerDay <= 0) {
    return res.status(400).json({ message: 'Number of drivers and max hours per day must be positive.' });
  }

  try {
    const allDrivers = await Driver.find({});
    const availableDrivers = allDrivers.slice(0, numberOfDrivers);
    const allOrders = await Order.find({}).populate('assignedRoute');
    const allRoutes = await Route.find({});

    let totalProfit = 0;
    let onTimeDeliveries = 0;
    let totalDeliveries = allOrders.length;
    let totalFuelCost = 0;

    for (const order of allOrders) {
      if (!order.assignedRoute) {
        console.warn(`Order ${order.orderId} has no assigned route, skipping calculations.`);
        continue;
      }

      const route = order.assignedRoute;

      // Rule 4: Fuel Cost Calculation
      let fuelCostPerKm = 5;
      if (route.trafficLevel === 'High') {
        fuelCostPerKm += 2;
      }
      const orderFuelCost = fuelCostPerKm * route.distanceInKm;
      totalFuelCost += orderFuelCost;

      // Rule 1: Late Delivery Penalty
      // CHANGED: Compare actualDeliveryDurationMinutes with onTimeThresholdMinutes
      const onTimeThresholdMinutes = route.baseTime + 10;
      let isLate = false;

      // If the actual duration for the order delivery exceeds the base route time + 10 minutes
      if (order.actualDeliveryDurationMinutes > onTimeThresholdMinutes) {
          orderPenalty = 50;
          isLate = true;
      } else {
          orderPenalty = 0; // Ensure penalty is 0 if not late
      }


      // Rule 3: High-Value Bonus
      let orderBonus = 0;
      if (order.valueRs > 1000 && !isLate) {
        orderBonus = 0.10 * order.valueRs;
      }

      // Rule 5: Overall Profit Calculation (per order)
      const orderProfit = order.valueRs + orderBonus - orderPenalty - orderFuelCost;
      totalProfit += orderProfit;

      if (!isLate) {
        onTimeDeliveries++;
      }
    }

    // Rule 6: Efficiency Score
    const efficiencyScore = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    // Save simulation results
    const simulationResult = new SimulationResult({
      timestamp: new Date(),
      numberOfDrivers,
      routeStartTime,
      maxHoursPerDay,
      totalProfit,
      efficiencyScore,
      onTimeDeliveries,
      totalDeliveries,
      totalFuelCost,
    });
    const savedResult = await simulationResult.save();
    console.log('Simulation results saved:', savedResult);

    res.status(200).json({
      totalProfit,
      efficiencyScore,
      onTimeDeliveries,
      totalDeliveries,
      totalFuelCost,
      simulationId: savedResult._id,
      message: 'Simulation completed and KPIs calculated successfully.',
    });

  } catch (error) {
    console.error('Error during simulation:', error);
    res.status(500).json({ message: 'Server error during simulation calculation', error: error.message });
  }
};

const getSimulationHistory = async (req, res) => {
  try {
    const history = await SimulationResult.find({}).sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching simulation history' });
  }
};

module.exports = { runSimulation, getSimulationHistory };
