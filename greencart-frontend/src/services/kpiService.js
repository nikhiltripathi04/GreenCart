import API from './api'; // Import the configured Axios instance

// Function to run a new simulation
const runSimulation = async (simulationInputs) => {
  try {
    const response = await API.post('/simulation', simulationInputs);
    return response.data; // Returns calculated KPIs and simulationId
  } catch (error) {
    throw error;
  }
};

// Function to get past simulation history
const getSimulationHistory = async () => {
  try {
    const response = await API.get('/simulation/history');
    return response.data; // Returns an array of past simulation results
  } catch (error) {
    throw error;
  }
};

export { runSimulation, getSimulationHistory };
