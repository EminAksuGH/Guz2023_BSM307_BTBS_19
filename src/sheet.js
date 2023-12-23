import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Jwt from '../middlewares/jwtVerify';
import Chat from './Chat';
import Login from './views/login';
import Register from './views/register';
import Logout from './views/logout';
import AdminCRUD from './admin/adminCrud';

const App = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(accessToken !== null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const newAccessToken = await Jwt.refreshAccessToken();
        setAccessToken(newAccessToken);
      } catch (error) {
        console.error('Error refreshing access token:', error);
        logoutUser();
      }
    };

    const checkTokenExpiration = () => {
      if (accessToken) {
        const decodedToken = decodeToken(accessToken);
        if (decodedToken && decodedToken.exp) {
          const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
          if (isTokenExpired) {
            fetchAccessToken();
          }
        }
      }
    };

    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 60 * 1000);

    return () => clearInterval(intervalId);

  }, [accessToken]);

  const decodeToken = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    // Replace this function with your actual login logic
    setAccessToken('your_new_access_token');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Replace this function with your actual logout logic
    logoutUser();
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            {!isAuthenticated && (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
            {!isAuthenticated && (
              <li>
                <Link to="/register">Register</Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link to="/chat">Chat</Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link to="/logout">Logout</Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            )}
          </ul>
        </nav>

        <hr />
        <Routes>
          <Route
            path="/login"
            element={<Login authenticate={handleLogin} />}
          />
          <Route
            path="/register"
            element={<Register authenticate={handleLogin} />}
          />
          <Route
            path="/logout"
            element={<Logout onLogout={handleLogout} />}
          />
          <Route
            path="/admin"
            element={<AdminCRUD />}
          />
          <Route
            path="/"
            element={<Chat />}
          />
          <Route
            path="*"
            element={<Chat />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

