import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginValidation = () => {
  const [inputs, setInputs] = useState({ username: '', password: '' });
  const [validationMessages, setValidationMessages] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
    setValidationMessages({ ...validationMessages, [name]: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { username, password } = inputs;

    let newValidationMessages = {};

    if (!username || !password) {
      newValidationMessages = {
        username: !username ? 'Please fill out this field' : '',
        password: !password ? 'Please fill out this field' : '',
      };
      setValidationMessages(newValidationMessages);
      return;
    }

    setValidationMessages({ username: '', password: '' });

    try {
      const response = await axios.post('http://localhost:3001/auth/login', inputs, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = response.data;

      if (data.success) {
        console.log('Login successful');
        localStorage.setItem('accessToken', data.accessToken);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;

        console.log(response.data);
        navigate("/chat");
      } else {
        setValidationMessages({ ...validationMessages, username: '', password: 'Invalid username or password' });
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      // Handle Axios errors here
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with error status:', error.response.status);
        setValidationMessages({ ...validationMessages, username: '', password: 'Invalid username or password' });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from the server');
        setValidationMessages({ ...validationMessages, username: '', password: 'No response received from the server' });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up the request:', error.message);
        setValidationMessages({ ...validationMessages, username: '', password: 'Error setting up the request' });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-linear-gradient(#dde1e4 ,#2b0f1c)">
      <div className="w-100 p-10 bg-white bg-opacity-50 rounded shadow">
        <h2 className="text-5xl font-bold text-black-800 mb-4 text-center">LOGIN</h2>
        <p style={{ textAlignVertical: "center", textAlign: "center", }}>Welcome to ChitChat!</p>
        <br></br>
        <form onSubmit={handleLogin}>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Username or mail:
            <input
              type="text"
              name="username"
              value={inputs.username}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300"
            />
            <span className="text-red-500 text-sm">{validationMessages.username}</span>
          </label>
          <label className="block text-gray-700 text-sm font-medium mb-2 mt-4">
            Password:
            <input
              type="password"
              name="password"
              value={inputs.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300"
            />
            <br></br>
            <br></br>
            <span className="text-red-500 text-sm">{validationMessages.password}</span>
          </label>
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50">Login</button>
        </form>

        {/* Move Link outside the form tag */}
        <p style={{ textAlignVertical: "center", textAlign: "center", }}>Don't have an account? <Link to="/register"><b>REGISTER</b></Link> </p>
      </div>
    </div>
  );
};

export default LoginValidation;
