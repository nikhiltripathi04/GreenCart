const Route = require('../models/Route'); // Import the Route model

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private (Managers only)
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching routes' });
  }
};

// @desc    Get single route by ID (MongoDB _id)
// @route   GET /api/routes/:id
// @access  Private (Managers only)
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (route) {
      res.status(200).json(route);
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching route' });
  }
};

// @desc    Add a new route
// @route   POST /api/routes
// @access  Private (Managers only)
const addRoute = async (req, res) => {
  const { routeId, distanceInKm, trafficLevel, baseTime } = req.body;

  // Basic validation
  if (!routeId || distanceInKm === undefined || !trafficLevel || baseTime === undefined) {
    return res.status(400).json({ message: 'Please provide routeId, distanceInKm, trafficLevel, and baseTime.' });
  }

  try {
    // Check if routeId already exists to ensure uniqueness
    const existingRoute = await Route.findOne({ routeId });
    if (existingRoute) {
      return res.status(400).json({ message: 'Route with this routeId already exists.' });
    }

    const newRoute = new Route({
      routeId,
      distanceInKm,
      trafficLevel,
      baseTime,
    });
    const createdRoute = await newRoute.save();
    res.status(201).json(createdRoute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding route' });
  }
};

// @desc    Update an existing route
// @route   PUT /api/routes/:id
// @access  Private (Managers only)
const updateRoute = async (req, res) => {
  const { routeId, distanceInKm, trafficLevel, baseTime } = req.body;

  try {
    const route = await Route.findById(req.params.id);

    if (route) {
      // If routeId is provided, ensure it's not taken by another route
      if (routeId && routeId !== route.routeId) {
        const existingRoute = await Route.findOne({ routeId });
        if (existingRoute && existingRoute._id.toString() !== route._id.toString()) {
          return res.status(400).json({ message: 'Another route with this routeId already exists.' });
        }
        route.routeId = routeId;
      }

      route.distanceInKm = distanceInKm !== undefined ? distanceInKm : route.distanceInKm;
      route.trafficLevel = trafficLevel || route.trafficLevel;
      route.baseTime = baseTime !== undefined ? baseTime : route.baseTime;

      const updatedRoute = await route.save();
      res.status(200).json(updatedRoute);
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating route' });
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
// @access  Private (Managers only)
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (route) {
      await route.deleteOne();
      res.status(200).json({ message: 'Route removed' });
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting route' });
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  addRoute,
  updateRoute,
  deleteRoute,
};
