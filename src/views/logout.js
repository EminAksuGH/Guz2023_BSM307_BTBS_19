// LogOut.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  const isAuthenticated = localStorage.getItem("accessToken");

  const handleLogout = () => {

    localStorage.removeItem("accessToken");
    
    onLogout();

    console.log('User logged out successfully!');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
