import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">Login</h2>
      <div className="w-80 p-4 bg-white rounded shadow">
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
            <span className="text-red-500 text-sm">{validationMessages.password}</span>
          </label>
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginValidation;
