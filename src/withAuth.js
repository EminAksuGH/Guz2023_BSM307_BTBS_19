/*
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
*/

import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

const withAuth = WrappedComponent => {
  return class extends Component {
    state = {
      authenticated: false,
    };

    componentDidMount() {
      // Check if user is authenticated

            const accessToken = localStorage.getItem('accesToken')
            const axios = require('axios');

      const apiUrl = 'http://localhost:3001/auth/login';  // Replace with your API endpoint
      let data=null;
      // Example GET request with Authorization header
      axios.post(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json', // Adjust the content type as needed
        },
      })
        .then(response => {
          data=response.data
          console.log('Response:', response.data);
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
        
        if (data.success) {
          console.log('User signed up successfully!');
          if (data.success) {
            console.log('Sign-up successful');
            localStorage.setItem('accessToken', data.accessToken);
            console.log(data);
            this.setState({ authenticated: true });
          }
        } else {
          console.error('Register failed:', data.error);
        }
      
    }
    render() {
      const { authenticated } = this.state;

      if (!authenticated) {
        return <Navigate to="./views/login" />;
      }

      return <WrappedComponent {...this.props} />;
    }

    };
      
      
// acces tokeni alıp serverda verify token endpointine istek atıcaz sonrasında oradan dönen değer başarılı değilse refresh token devreye girecek. 
}
export default withAuth;
