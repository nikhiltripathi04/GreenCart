const Driver = require('../models/Driver'); // Import the Driver model

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Managers only)
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({});
    res.status(200).json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching drivers' });
  }
};

// @desc    Get single driver by ID
// @route   GET /api/drivers/:id
// @access  Private (Managers only)
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (driver) {
      res.status(200).json(driver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching driver' });
  }
};

// @desc    Add a new driver
// @route   POST /api/drivers
// @access  Private (Managers only)
const addDriver = async (req, res) => {
  const { name, currentShiftHours, past7DayWorkHours } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ message: 'Driver name is required' });
  }

  try {
    const newDriver = new Driver({
      name,
      currentShiftHours: currentShiftHours || 0,
      past7DayWorkHours: past7DayWorkHours || 0,
    });
    const createdDriver = await newDriver.save();
    res.status(201).json(createdDriver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding driver' });
  }
};

// @desc    Update an existing driver
// @route   PUT /api/drivers/:id
// @access  Private (Managers only)
const updateDriver = async (req, res) => {
  const { name, currentShiftHours, past7DayWorkHours } = req.body;

  try {
    const driver = await Driver.findById(req.params.id);

    if (driver) {
      driver.name = name || driver.name;
      driver.currentShiftHours = currentShiftHours !== undefined ? currentShiftHours : driver.currentShiftHours;
      driver.past7DayWorkHours = past7DayWorkHours !== undefined ? past7DayWorkHours : driver.past7DayWorkHours;

      const updatedDriver = await driver.save();
      res.status(200).json(updatedDriver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating driver' });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private (Managers only)
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (driver) {
      await driver.deleteOne(); // Use deleteOne()
      res.status(200).json({ message: 'Driver removed' });
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting driver' });
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  addDriver,
  updateDriver,
  deleteDriver,
};
