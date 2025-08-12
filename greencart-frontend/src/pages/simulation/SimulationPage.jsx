import React, { useState, useEffect } from 'react';
import { runSimulation, getSimulationHistory } from '../../services/kpiService';

function SimulationPage() {
  const [numberOfDrivers, setNumberOfDrivers] = useState(5);
  const [routeStartTime, setRouteStartTime] = useState('08:00');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(8);
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);

  // Function to fetch simulation history on component mount
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setError('');
    try {
      const history = await getSimulationHistory();
      setSimulationHistory(history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch simulation history.');
      console.error('Error fetching simulation history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSimulationResults(null); // Clear previous results

    try {
      const results = await runSimulation({
        numberOfDrivers,
        routeStartTime,
        maxHoursPerDay,
      });
      setSimulationResults(results);
      // After running a new simulation, re-fetch history to update the table
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed. Please check inputs.');
      console.error('Error running simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Delivery Simulation</h2>
      <p className="text-gray-600 mb-4">Configure and run delivery simulations to see KPI impacts.</p>

      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </p>
      )}

      {/* Simulation Input Form */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Simulation Inputs</h3>
        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numDrivers" className="block text-sm font-medium text-gray-700">Number of Available Drivers</label>
            <input
              type="number"
              id="numDrivers"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="e.g., 5"
              value={numberOfDrivers}
              onChange={(e) => setNumberOfDrivers(Number(e.target.value))}
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="routeStartTime" className="block text-sm font-medium text-gray-700">Route Start Time (HH:MM)</label>
            <input
              type="time"
              id="routeStartTime"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              value={routeStartTime}
              onChange={(e) => setRouteStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="maxHours" className="block text-sm font-medium text-gray-700">Max Hours per Driver per Day</label>
            <input
              type="number"
              id="maxHours"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="e.g., 8"
              value={maxHoursPerDay}
              onChange={(e) => setMaxHoursPerDay(Number(e.target.value))}
              required
              min="1"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-200 shadow-md"
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
        </form>
      </div>

      {/* Simulation Results Display */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Simulation Results</h3>
        {loading && <p className="text-center text-blue-600">Calculating results...</p>}
        {!loading && !simulationResults && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner text-gray-500 flex items-center justify-center h-40">
            <p>No results yet. Run a simulation to see KPIs.</p>
          </div>
        )}
        {!loading && simulationResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-blue-700">Total Profit</h3>
              <p className="text-2xl font-bold text-blue-900">₹ {simulationResults.totalProfit.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-green-700">Efficiency Score</h3>
              <p className="text-2xl font-bold text-green-900">{simulationResults.efficiencyScore.toFixed(2)}%</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-700">On-time Deliveries</h3>
              <p className="text-2xl font-bold text-yellow-900">{simulationResults.onTimeDeliveries} / {simulationResults.totalDeliveries}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-red-700">Total Fuel Cost</h3>
              <p className="text-2xl font-bold text-red-900">₹ {simulationResults.totalFuelCost.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Simulation History Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Past Simulations</h3>
        {historyLoading ? (
          <p className="text-center text-blue-600">Loading history...</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drivers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulationHistory.length > 0 ? (
                  simulationHistory.map((sim) => (
                    <tr key={sim._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sim.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sim.numberOfDrivers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sim.routeStartTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sim.maxHoursPerDay}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ {sim.totalProfit.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sim.efficiencyScore.toFixed(2)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No simulation history found. Run a simulation!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationPage;
