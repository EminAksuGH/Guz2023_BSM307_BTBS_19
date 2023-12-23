import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const withAuth = WrappedComponent => {
 return props => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
      if (localStorage.getItem('accessToken')) {
        setIsAuthenticated(true);
      }
    }, []);

    if (isAuthenticated) {
      return <Navigate to="/chat" />;
    }

    return <WrappedComponent {...props} />;
 };
};

export default withAuth;