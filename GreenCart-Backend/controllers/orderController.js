const Order = require('../models/Order'); // Import the Order model
const Route = require('../models/Route'); // Need Route model to find assignedRoute by its routeId

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Managers only)
const getOrders = async (req, res) => {
  try {
    // Populate the assignedRoute to include route details in the response
    const orders = await Order.find({}).populate('assignedRoute');
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Get single order by ID (MongoDB _id)
// @route   GET /api/orders/:id
// @access  Private (Managers only)
const getOrderById = async (req, res) => {
  try {
    // Populate the assignedRoute to include route details in the response
    const order = await Order.findById(req.params.id).populate('assignedRoute');
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @desc    Add a new order
// @route   POST /api/orders
// @access  Private (Managers only)
const addOrder = async (req, res) => {
  // CHANGED: Destructure actualDeliveryDurationMinutes instead of deliveryTimestamp
  const { orderId, valueRs, routeId, actualDeliveryDurationMinutes } = req.body;

  // Basic validation - ensure actualDeliveryDurationMinutes is present
  if (!orderId || valueRs === undefined || !routeId || actualDeliveryDurationMinutes === undefined) {
    return res.status(400).json({ message: 'Please provide orderId, valueRs, routeId, and actualDeliveryDurationMinutes.' });
  }

  try {
    // Check if orderId already exists to ensure uniqueness
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order with this orderId already exists.' });
    }

    // Find the Route by its unique routeId string to get its MongoDB _id
    const assignedRouteDoc = await Route.findOne({ routeId });
    if (!assignedRouteDoc) {
      return res.status(404).json({ message: `Route with ID ${routeId} not found.` });
    }

    const newOrder = new Order({
      orderId,
      valueRs,
      assignedRoute: assignedRouteDoc._id, // Store the MongoDB _id of the route
      actualDeliveryDurationMinutes: Number(actualDeliveryDurationMinutes), // Ensure it's a number
    });
    const createdOrder = await newOrder.save();

    // Populate the route details before sending the response
    await createdOrder.populate('assignedRoute');

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    // Provide more specific error message for validation failures
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error adding order' });
  }
};

// @desc    Update an existing order
// @route   PUT /api/orders/:id
// @access  Private (Managers only)
const updateOrder = async (req, res) => {
  // CHANGED: Destructure actualDeliveryDurationMinutes instead of deliveryTimestamp
  const { orderId, valueRs, routeId, actualDeliveryDurationMinutes } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // If orderId is provided, ensure it's not taken by another order
      if (orderId && orderId !== order.orderId) {
        const existingOrder = await Order.findOne({ orderId });
        if (existingOrder && existingOrder._id.toString() !== order._id.toString()) {
          return res.status(400).json({ message: 'Another order with this orderId already exists.' });
        }
        order.orderId = orderId;
      }

      order.valueRs = valueRs !== undefined ? valueRs : order.valueRs;

      if (routeId) {
        const assignedRouteDoc = await Route.findOne({ routeId });
        if (!assignedRouteDoc) {
          return res.status(404).json({ message: `Route with ID ${routeId} not found.` });
        }
        order.assignedRoute = assignedRouteDoc._id;
      }

      // CHANGED: Update actualDeliveryDurationMinutes
      if (actualDeliveryDurationMinutes !== undefined) {
        order.actualDeliveryDurationMinutes = Number(actualDeliveryDurationMinutes);
      }

      const updatedOrder = await order.save();
      // Populate the route details before sending the response
      await updatedOrder.populate('assignedRoute');

      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    // Provide more specific error message for validation failures
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private (Managers only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.deleteOne();
      res.status(200).json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting order' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
};
