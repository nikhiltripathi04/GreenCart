import API from './api';

const getOrders = async () => {
  try {
    const response = await API.get('/orders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getOrderById = async (id) => {
  try {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addOrder = async (orderData) => {
  try {
    const response = await API.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateOrder = async (id, orderData) => {
  try {
    const response = await API.put(`/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteOrder = async (id) => {
  try {
    const response = await API.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getOrders, getOrderById, addOrder, updateOrder, deleteOrder };
