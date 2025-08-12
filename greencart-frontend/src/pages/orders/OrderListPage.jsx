import React, { useState, useEffect } from 'react';
import { getOrders, addOrder, updateOrder, deleteOrder } from '../../services/orderService';
import { getRoutes } from '../../services/routeService'; // To get list of routes for dropdown

// Reusable form component for Add/Edit
const OrderForm = ({ order, onSave, onCancel, setError, allRoutes }) => {
  const [orderId, setOrderId] = useState(order ? order.orderId : '');
  const [valueRs, setValueRs] = useState(order ? order.valueRs : '');
  const [selectedRouteId, setSelectedRouteId] = useState(order && order.assignedRoute ? order.assignedRoute.routeId : '');
  const [actualDeliveryDurationMinutes, setActualDeliveryDurationMinutes] = useState(order ? order.actualDeliveryDurationMinutes : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If editing, ensure the correct routeId is set based on the populated route object
    if (order && order.assignedRoute && order.assignedRoute.routeId) {
      setSelectedRouteId(order.assignedRoute.routeId);
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        orderId,
        valueRs: Number(valueRs),
        routeId: selectedRouteId, // Send backend the string routeId
        actualDeliveryDurationMinutes: Number(actualDeliveryDurationMinutes),
      };
      await onSave(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{order ? 'Edit Order' : 'Add New Order'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderId">Order ID</label>
          <input
            type="text"
            id="orderId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            disabled={!!order} // Disable editing orderId for existing orders
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valueRs">Value (Rs)</label>
          <input
            type="number"
            id="valueRs"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={valueRs}
            onChange={(e) => setValueRs(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeId">Assigned Route</label>
          <select
            id="routeId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            required
          >
            <option value="">Select a Route</option>
            {allRoutes.map(route => (
              <option key={route._id} value={route.routeId}>{route.routeId} (Dist: {route.distanceInKm}km, Traffic: {route.trafficLevel})</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="actualDeliveryDurationMinutes">Delivery Duration (minutes)</label>
          <input
            type="number"
            id="actualDeliveryDurationMinutes"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={actualDeliveryDurationMinutes}
            onChange={(e) => setActualDeliveryDurationMinutes(e.target.value)}
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
            {loading ? 'Saving...' : 'Save Order'}
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

function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]); // State to hold routes for the dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutesForDropdown = async () => {
    try {
      const routes = await getRoutes(); // Use routeService to fetch routes
      setAllRoutes(routes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load routes for dropdown.');
      console.error('Error fetching routes for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRoutesForDropdown();
  }, []);

  const handleAddClick = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        fetchOrders();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete order.');
        console.error('Error deleting order:', err);
      }
    }
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id, orderData);
      } else {
        await addOrder(orderData);
      }
      setShowForm(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order.');
      console.error('Error saving order:', err);
      throw err;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h2>
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={handleAddClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-md"
      >
        Add New Order
      </button>

      {showForm && (
        <OrderForm
          order={editingOrder}
          onSave={handleSaveOrder}
          onCancel={() => setShowForm(false)}
          setError={setError}
          allRoutes={allRoutes} // Pass available routes to the form
        />
      )}

      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (Rs)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Duration (min)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ {order.valueRs.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.assignedRoute ? order.assignedRoute.routeId : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.actualDeliveryDurationMinutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="text-blue-600 hover:text-blue-900 mr-2 transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(order._id)}
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
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderListPage;
