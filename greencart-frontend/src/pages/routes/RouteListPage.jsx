import React, { useState, useEffect } from 'react';
import { getRoutes, addRoute, updateRoute, deleteRoute } from '../../services/routeService';

// Reusable form component for Add/Edit
const RouteForm = ({ route, onSave, onCancel, setError }) => {
  const [routeId, setRouteId] = useState(route ? route.routeId : '');
  const [distanceInKm, setDistanceInKm] = useState(route ? route.distanceInKm : '');
  const [trafficLevel, setTrafficLevel] = useState(route ? route.trafficLevel : 'Low');
  const [baseTime, setBaseTime] = useState(route ? route.baseTime : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        routeId,
        distanceInKm: Number(distanceInKm),
        trafficLevel,
        baseTime: Number(baseTime),
      };
      await onSave(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{route ? 'Edit Route' : 'Add New Route'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeId">Route ID</label>
          <input
            type="text"
            id="routeId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            required
            disabled={!!route} // Disable editing routeId for existing routes
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="distanceInKm">Distance (km)</label>
          <input
            type="number"
            id="distanceInKm"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={distanceInKm}
            onChange={(e) => setDistanceInKm(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trafficLevel">Traffic Level</label>
          <select
            id="trafficLevel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={trafficLevel}
            onChange={(e) => setTrafficLevel(e.target.value)}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="baseTime">Base Time (min)</label>
          <input
            type="number"
            id="baseTime"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={baseTime}
            onChange={(e) => setBaseTime(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Route'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

function RouteListPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null); // Null for add, object for edit

  const fetchRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch routes.');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAddClick = () => {
    setEditingRoute(null);
    setShowForm(true);
  };

  const handleEditClick = (route) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(id);
        fetchRoutes(); // Refresh list after deletion
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete route.');
        console.error('Error deleting route:', err);
      }
    }
  };

  const handleSaveRoute = async (routeData) => {
    try {
      if (editingRoute) {
        await updateRoute(editingRoute._id, routeData);
      } else {
        await addRoute(routeData);
      }
      setShowForm(false);
      setEditingRoute(null);
      fetchRoutes(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route.');
      console.error('Error saving route:', err);
      throw err;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading routes...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Route Management</h2>
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={handleAddClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-md"
      >
        Add New Route
      </button>

      {showForm && (
        <RouteForm
          route={editingRoute}
          onSave={handleSaveRoute}
          onCancel={() => setShowForm(false)}
          setError={setError}
        />
      )}

      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance (km)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Time (min)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.length > 0 ? (
              routes.map((route) => (
                <tr key={route._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.routeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.distanceInKm}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.trafficLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.baseTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(route)}
                      className="text-blue-600 hover:text-blue-900 mr-2 transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(route._id)}
                      className="text-red-600 hover:text-red-900 transition duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No routes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RouteListPage;
