import API from './api';

const getRoutes = async () => {
  try {
    const response = await API.get('/routes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getRouteById = async (id) => {
  try {
    const response = await API.get(`/routes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addRoute = async (routeData) => {
  try {
    const response = await API.post('/routes', routeData);
    return response.data;
  } catch (error)
    { throw error; }
};

const updateRoute = async (id, routeData) => {
  try {
    const response = await API.put(`/routes/${id}`, routeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteRoute = async (id) => {
  try {
    const response = await API.delete(`/routes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getRoutes, getRouteById, addRoute, updateRoute, deleteRoute };
