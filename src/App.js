import './App.css';
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RegSuccess from './components/regsucc';
import HRDashboard from './pages/HrDashboard';
import EmpDashboard from './pages/EmpDashboard';
import { useEffect } from 'react';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  const auth = localStorage.getItem("isAuthenticated") === "true";
  setIsAuthenticated(auth);
  setCheckingAuth(false); // finished checking
}, []);

if (checkingAuth) {
  return <div>Loading...</div>; // or a spinner
}

  

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route path="/register" element={<Register />} />
      <Route path="/regsucc" element={<RegSuccess />} />
      <Route
        path="/hr-dashboard"
        element={isAuthenticated ? <HRDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}
      />
      <Route
      path="/emp-dashboard"
      element={isAuthenticated ? <EmpDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}
      />

    </Routes>
  );
};

export default App;
