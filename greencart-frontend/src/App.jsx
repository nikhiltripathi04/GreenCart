import { useState, useEffect } from 'react';
// Import your page components
import DashboardPage from './pages/dashboard/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import DriverListPage from './pages/drivers/DriverListPage';
import RouteListPage from './pages/routes/RouteListPage';
import OrderListPage from './pages/orders/OrderListPage';
import SimulationPage from './pages/simulation/SimulationPage';
import { logout } from './services/authService'; // Import logout service

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logout(); // Call the logout service
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'drivers':
        return <DriverListPage />;
      case 'routes':
        return <RouteListPage />;
      case 'orders':
        return <OrderListPage />;
      case 'simulation':
        return <SimulationPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Navigation Bar (visible only when authenticated) */}
      {isAuthenticated && (
        <nav className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center text-white">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
              GreenCart Logistics
            </h1>
            <div className="space-x-4">
              <button onClick={() => setCurrentPage('dashboard')} className="hover:text-blue-200 transition-colors">Dashboard</button>
              <button onClick={() => setCurrentPage('simulation')} className="hover:text-blue-200 transition-colors">Simulation</button>
              <div className="relative inline-block text-left">
                <button
                  id="menu-button"
                  aria-expanded="true"
                  aria-haspopup="true"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                  onClick={() => {
                    const menu = document.getElementById('management-menu');
                    menu.classList.toggle('hidden');
                  }}
                >
                  Manage
                  {/* Heroicon name: solid/chevron-down */}
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 s0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <div
                  id="management-menu"
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabIndex="-1"
                >
                  <div className="py-1" role="none">
                    <button onClick={() => { setCurrentPage('drivers'); document.getElementById('management-menu').classList.add('hidden'); }} className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100" role="menuitem" tabIndex="-1" id="menu-item-0">Drivers</button>
                    <button onClick={() => { setCurrentPage('routes'); document.getElementById('management-menu').classList.add('hidden'); }} className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100" role="menuitem" tabIndex="-1" id="menu-item-1">Routes</button>
                    <button onClick={() => { setCurrentPage('orders'); document.getElementById('management-menu').classList.add('hidden'); }} className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100" role="menuitem" tabIndex="-1" id="menu-item-2">Orders</button>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors">Logout</button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto p-6 flex-grow">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
