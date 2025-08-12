import React, { useState, useEffect } from 'react';
import { getDrivers, addDriver, updateDriver, deleteDriver } from '../../services/driverService';

// Reusable form component for Add/Edit
const DriverForm = ({ driver, onSave, onCancel, setError }) => {
  const [name, setName] = useState(driver ? driver.name : '');
  const [currentShiftHours, setCurrentShiftHours] = useState(driver ? driver.currentShiftHours : '');
  const [past7DayWorkHours, setPast7DayWorkHours] = useState(driver ? driver.past7DayWorkHours : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { name, currentShiftHours: Number(currentShiftHours), past7DayWorkHours: Number(past7DayWorkHours) };
      await onSave(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{driver ? 'Edit Driver' : 'Add New Driver'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentShiftHours">Current Shift Hours</label>
          <input
            type="number"
            id="currentShiftHours"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={currentShiftHours}
            onChange={(e) => setCurrentShiftHours(e.target.value)}
            min="0"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="past7DayWorkHours">Past 7 Day Work Hours</label>
          <input
            type="number"
            id="past7DayWorkHours"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={past7DayWorkHours}
            onChange={(e) => setPast7DayWorkHours(e.target.value)}
            min="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Driver'}
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


function DriverListPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // Null for add, object for edit

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers.');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddClick = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const handleEditClick = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(id);
        fetchDrivers(); // Refresh list after deletion
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete driver.');
        console.error('Error deleting driver:', err);
      }
    }
  };

  const handleSaveDriver = async (driverData) => {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver._id, driverData);
      } else {
        await addDriver(driverData);
      }
      setShowForm(false);
      setEditingDriver(null);
      fetchDrivers(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver.');
      console.error('Error saving driver:', err);
      throw err; // Re-throw to be caught by form's try/catch
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading drivers...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Driver Management</h2>
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={handleAddClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-md"
      >
        Add New Driver
      </button>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onSave={handleSaveDriver}
          onCancel={() => setShowForm(false)}
          setError={setError}
        />
      )}

      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Shift Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Past 7 Day Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <tr key={driver._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.currentShiftHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.past7DayWorkHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-2 transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(driver._id)}
                      className="text-red-600 hover:text-red-900 transition duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DriverListPage;
