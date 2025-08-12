import API from './api';

const getDrivers = async () => {
  try {
    const response = await API.get('/drivers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getDriverById = async (id) => {
  try {
    const response = await API.get(`/drivers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addDriver = async (driverData) => {
  try {
    const response = await API.post('/drivers', driverData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateDriver = async (id, driverData) => {
  try {
    const response = await API.put(`/drivers/${id}`, driverData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteDriver = async (id) => {
  try {
    const response = await API.delete(`/drivers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getDrivers, getDriverById, addDriver, updateDriver, deleteDriver };
