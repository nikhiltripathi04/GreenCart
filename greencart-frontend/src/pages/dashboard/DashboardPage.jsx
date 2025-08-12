import React, { useState, useEffect } from 'react';
import { getSimulationHistory } from '../../services/kpiService'; // Import KPI service
import { Line, Pie } from 'react-chartjs-2'; // For charts
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function DashboardPage() {
  const [kpis, setKpis] = useState({
    totalProfit: 0,
    efficiencyScore: 0,
    onTimeDeliveries: 0,
    totalDeliveries: 0,
    totalFuelCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulationHistory, setSimulationHistory] = useState([]);


  useEffect(() => {
    const fetchKpisAndHistory = async () => {
      try {
        const history = await getSimulationHistory();
        setSimulationHistory(history);

        if (history.length > 0) {
          // Display KPIs from the most recent simulation
          const latestKpis = history[0];
          setKpis({
            totalProfit: latestKpis.totalProfit,
            efficiencyScore: latestKpis.efficiencyScore,
            onTimeDeliveries: latestKpis.onTimeDeliveries,
            totalDeliveries: latestKpis.totalDeliveries,
            totalFuelCost: latestKpis.totalFuelCost,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch KPIs and history.');
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKpisAndHistory();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading KPIs...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto my-10 max-w-lg" role="alert">{error}</div>;
  }

  // Prepare data for charts
  // On-time vs Late Deliveries Chart
  const onTimeLateData = {
    labels: ['On-time', 'Late'],
    datasets: [
      {
        data: [kpis.onTimeDeliveries, kpis.totalDeliveries - kpis.onTimeDeliveries],
        backgroundColor: ['#4CAF50', '#F44336'], // Green for on-time, Red for late
        hoverBackgroundColor: ['#66BB6A', '#E57373'],
      },
    ],
  };

  // Fuel Cost Breakdown Chart (Example: could be broken down by route or traffic level)
  // For simplicity, we'll just show total fuel cost vs. other costs or a general breakdown.
  // A better chart here would require more detailed fuel cost breakdown from backend.
  // For now, let's just make a dummy chart or use it to show the total fuel cost in a visual way.
  // Let's assume a basic pie for 'Direct Fuel Cost' vs 'Surcharge Cost' if backend provided it.
  // Since it doesn't, let's use a dummy representation or focus on other charts.
  // A simple bar chart showing fuel costs over last few simulations could be better here.

  const fuelCostData = {
    labels: simulationHistory.slice(0, 5).map(s => new Date(s.timestamp).toLocaleDateString()), // Last 5 simulations
    datasets: [
      {
        label: 'Total Fuel Cost (₹)',
        data: simulationHistory.slice(0, 5).map(s => s.totalFuelCost),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700">Total Profit</h3>
          <p className="text-2xl font-bold text-blue-900">₹ {kpis.totalProfit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-green-700">Efficiency Score</h3>
          <p className="text-2xl font-bold text-green-900">{kpis.efficiencyScore.toFixed(2)}%</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-yellow-700">On-time Deliveries</h3>
          <p className="text-2xl font-bold text-yellow-900">{kpis.onTimeDeliveries} / {kpis.totalDeliveries}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-red-700">Total Fuel Cost</h3>
          <p className="text-2xl font-bold text-red-900">₹ {kpis.totalFuelCost.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">On-time vs Late Deliveries</h3>
          <div className="relative w-full max-w-xs h-64">
            <Pie data={onTimeLateData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Fuel Cost Trends (Last 5 Simulations)</h3>
          <div className="relative w-full h-64">
            <Line data={fuelCostData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Optional: Display Simulation History Summary */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Simulations</h3>
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
              {simulationHistory.slice(0, 5).map((sim) => ( // Show top 5 recent simulations
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
              ))}
              {simulationHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No simulation history found. Run a simulation!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
