import API from './api'; // Import the configured Axios instance

// Function to handle user login
const login = async (username, password) => {
  try {
    const response = await API.post('/auth/login', { username, password });
    // If login is successful, store the token in local storage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data)); // Store user data if needed
    }
    return response.data; // Return user data and token
  } catch (error) {
    throw error; // Propagate error for UI to handle
  }
};

// Function to handle user registration
const register = async (username, password, role = 'manager') => {
  try {
    const response = await API.post('/auth/register', { username, password, role });
    // For registration, you might also want to store the token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to handle user logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export { login, register, logout };
