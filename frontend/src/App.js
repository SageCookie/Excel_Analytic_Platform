import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserProvider } from './context/UserContext';

// PrivateRoute component
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div>
            <nav className="flex justify-center space-x-4 mb-6">
              {/* <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-green-500 hover:underline">
                Register
              </Link>
              <Link to="/upload" className="text-purple-500 hover:underline">
                Upload
              </Link> */}
            </nav>
            <AppRoutes />
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
