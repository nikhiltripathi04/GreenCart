// Import the controller function we want to test
const { runSimulation } = require('../controllers/simulationController');

// Mock Mongoose models to prevent actual database interaction during unit tests
jest.mock('../models/Driver', () => ({
  find: jest.fn(),
}));
jest.mock('../models/Route', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../models/Order', () => ({
  find: jest.fn().mockReturnThis(),
  populate: jest.fn(),
}));

const mockSave = jest.fn();
jest.mock('../models/SimulationResult', () => {
  const MockSimulationResult = jest.fn().mockImplementation((data) => {
    return {
      ...data,
      save: mockSave
    };
  });
  MockSimulationResult.find = jest.fn(); // Mock find for getSimulationHistory test
  MockSimulationResult.sort = jest.fn().mockReturnThis(); // chainable mock for sort
  return MockSimulationResult;
});

const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');


describe('runSimulation', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset(); // Reset the mockSave specifically

    req = {
      body: {},
      user: { role: 'manager' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // Test Case 1: Missing Required Inputs (remains unchanged)
  test('should return 400 if required inputs are missing', async () => {
    req.body = { numberOfDrivers: 5, maxHoursPerDay: 8 };

    await runSimulation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Please provide numberOfDrivers, routeStartTime, and maxHoursPerDay.',
    });
  });

  // Test Case 2: Invalid Inputs (remains unchanged)
  test('should return 400 if numberOfDrivers or maxHoursPerDay are non-positive', async () => {
    req.body = { numberOfDrivers: 0, routeStartTime: '08:00', maxHoursPerDay: 8 };

    await runSimulation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Number of drivers and max hours per day must be positive.',
    });
  });

  // Test Case 3: Basic Simulation with No Penalties/Bonuses
  test('should calculate KPIs correctly for basic scenario', async () => {
    req.body = { numberOfDrivers: 1, routeStartTime: '08:00', maxHoursPerDay: 8 };

    Driver.find.mockResolvedValueOnce([{ _id: 'd1', name: 'Driver1' }]);
    Route.find.mockResolvedValueOnce([
        { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 }
    ]);
    Order.find.mockReturnThis();
    Order.populate.mockResolvedValueOnce([
      {
        orderId: 'o1',
        valueRs: 500,
        assignedRoute: { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 },
        // CHANGED: Use actualDeliveryDurationMinutes for the duration (25 minutes)
        actualDeliveryDurationMinutes: 25 // baseTime 30 + 10 = 40. 25 < 40, so on-time.
      }
    ]);
    mockSave.mockResolvedValueOnce({ _id: 'sim1' });

    await runSimulation(req, res);

    // Expected calculations:
    // Order 1: value=500, routeDist=10, traffic=Low, baseTime=30, actualDuration=25
    // Fuel Cost: 5/km * 10km = 50
    // On-time? 25 < (30+10=40). YES.
    // Penalty: 0
    // Bonus: 0 (value <= 1000)
    // Profit: 500 + 0 - 0 - 50 = 450

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalProfit: 450,
      efficiencyScore: 100, // 1/1 * 100
      onTimeDeliveries: 1,
      totalDeliveries: 1,
      totalFuelCost: 50,
      simulationId: 'sim1'
    }));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Late Delivery Penalty
  test('should apply 50 penalty for late delivery', async () => {
    req.body = { numberOfDrivers: 1, routeStartTime: '08:00', maxHoursPerDay: 8 };

    Driver.find.mockResolvedValueOnce([{ _id: 'd1', name: 'Driver1' }]);
    Route.find.mockResolvedValueOnce([
        { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 }
    ]);
    Order.find.mockReturnThis();
    Order.populate.mockResolvedValueOnce([
      {
        orderId: 'o2',
        valueRs: 500,
        assignedRoute: { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 },
        // CHANGED: Use actualDeliveryDurationMinutes for a late duration (45 minutes)
        actualDeliveryDurationMinutes: 45 // baseTime 30 + 10 = 40. 45 > 40, so LATE.
      }
    ]);
    mockSave.mockResolvedValueOnce({ _id: 'sim2' });

    await runSimulation(req, res);

    // Expected calculations:
    // Order 2: value=500, routeDist=10, traffic=Low, baseTime=30, actualDuration=45
    // Fuel Cost: 50
    // On-time? NO.
    // Penalty: 50
    // Bonus: 0
    // Profit: 500 + 0 - 50 - 50 = 400

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalProfit: 400,
      efficiencyScore: 0, // 0/1 * 100
      onTimeDeliveries: 0,
      totalDeliveries: 1,
      totalFuelCost: 50,
    }));
  });

  // Test Case 5: High-Value Bonus and High Traffic Fuel Surcharge
  test('should apply high-value bonus and high traffic surcharge', async () => {
    req.body = { numberOfDrivers: 1, routeStartTime: '08:00', maxHoursPerDay: 8 };

    Driver.find.mockResolvedValueOnce([{ _id: 'd1', name: 'Driver1' }]);
    Route.find.mockResolvedValueOnce([
        { _id: 'r2', routeId: '2', distanceInKm: 20, trafficLevel: 'High', baseTime: 60 }
    ]);
    Order.find.mockReturnThis();
    Order.populate.mockResolvedValueOnce([
      {
        orderId: 'o3',
        valueRs: 1500, // High value
        assignedRoute: { _id: 'r2', routeId: '2', distanceInKm: 20, trafficLevel: 'High', baseTime: 60 },
        // CHANGED: Use actualDeliveryDurationMinutes for on-time duration (65 minutes)
        actualDeliveryDurationMinutes: 65 // baseTime 60 + 10 = 70. 65 < 70, so ON TIME.
      }
    ]);
    mockSave.mockResolvedValueOnce({ _id: 'sim3' });

    await runSimulation(req, res);

    // Expected calculations:
    // Order 3: value=1500, routeDist=20, traffic=High, baseTime=60, actualDuration=65
    // Fuel Cost: (5 + 2)/km * 20km = 7 * 20 = 140
    // On-time? YES.
    // Penalty: 0
    // Bonus: 0.10 * 1500 = 150
    // Profit: 1500 + 150 - 0 - 140 = 1510

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalProfit: 1510,
      efficiencyScore: 100, // 1/1 * 100
      onTimeDeliveries: 1,
      totalDeliveries: 1,
      totalFuelCost: 140,
    }));
  });

  // Test Case 6: Mixed Scenarios with Multiple Orders
  test('should correctly aggregate KPIs for multiple orders with mixed conditions', async () => {
    req.body = { numberOfDrivers: 2, routeStartTime: '09:00', maxHoursPerDay: 10 };

    Driver.find.mockResolvedValueOnce([
        { _id: 'd1', name: 'Driver1' },
        { _id: 'd2', name: 'Driver2' }
    ]);
    Route.find.mockResolvedValueOnce([
        { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 },
        { _id: 'r2', routeId: '2', distanceInKm: 20, trafficLevel: 'High', baseTime: 60 },
        { _id: 'r3', routeId: '3', distanceInKm: 5, trafficLevel: 'Medium', baseTime: 20 }
    ]);
    Order.find.mockReturnThis();
    Order.populate.mockResolvedValueOnce([
      // Order 1: On-time, Low Value, Low Traffic
      {
        orderId: 'o1', valueRs: 500,
        assignedRoute: { _id: 'r1', routeId: '1', distanceInKm: 10, trafficLevel: 'Low', baseTime: 30 },
        actualDeliveryDurationMinutes: 25 // 25min. base+10 = 40min. On-time.
      },
      // Order 2: Late, High Value, High Traffic
      {
        orderId: 'o2', valueRs: 1500,
        assignedRoute: { _id: 'r2', routeId: '2', distanceInKm: 20, trafficLevel: 'High', baseTime: 60 },
        actualDeliveryDurationMinutes: 95 // 95min. base+10 = 70min. LATE.
      },
      // Order 3: On-time, Low Value, Medium Traffic
      {
        orderId: 'o3', valueRs: 800,
        assignedRoute: { _id: 'r3', routeId: '3', distanceInKm: 5, trafficLevel: 'Medium', baseTime: 20 },
        actualDeliveryDurationMinutes: 15 // 15min. base+10 = 30min. On-time.
      }
    ]);
    mockSave.mockResolvedValueOnce({ _id: 'sim4' });

    await runSimulation(req, res);

    // Calculations:
    // Order 1 (r1): Value=500, Dist=10, Traffic=Low, Base=30, ActualDuration=25
    //   Fuel: 5*10 = 50
    //   On-time: YES (25 < 40)
    //   Penalty: 0, Bonus: 0
    //   Profit: 500 - 50 = 450
    //
    // Order 2 (r2): Value=1500, Dist=20, Traffic=High, Base=60, ActualDuration=95
    //   Fuel: (5+2)*20 = 140
    //   On-time: NO (95 > 70)
    //   Penalty: 50, Bonus: 0 (late)
    //   Profit: 1500 - 50 - 140 = 1310
    //
    // Order 3 (r3): Value=800, Dist=5, Traffic=Medium, Base=20, ActualDuration=15
    //   Fuel: 5*5 = 25
    //   On-time: YES (15 < 30)
    //   Penalty: 0, Bonus: 0
    //   Profit: 800 - 25 = 775
    //
    // Total Profit: 450 + 1310 + 775 = 2535
    // On-Time Deliveries: 2 (o1, o3)
    // Total Deliveries: 3
    // Efficiency: (2/3) * 100 = 66.666...
    // Total Fuel Cost: 50 + 140 + 25 = 215

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalProfit: 2535,
      efficiencyScore: expect.closeTo(66.67),
      onTimeDeliveries: 2,
      totalDeliveries: 3,
      totalFuelCost: 215,
    }));
  });

  // Test Case 7: No orders present (remains unchanged)
  test('should handle no orders gracefully', async () => {
    req.body = { numberOfDrivers: 1, routeStartTime: '08:00', maxHoursPerDay: 8 };

    Driver.find.mockResolvedValueOnce([{ _id: 'd1', name: 'Driver1' }]);
    Order.find.mockReturnThis();
    Order.populate.mockResolvedValueOnce([]);
    mockSave.mockResolvedValueOnce({ _id: 'sim5' });

    await runSimulation(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalProfit: 0,
      efficiencyScore: 0,
      onTimeDeliveries: 0,
      totalDeliveries: 0,
      totalFuelCost: 0,
    }));
  });
});
