import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


const RegisterValidation = () => {
  const [userInfo, setUserInfo] = useState({ username: '', mail: '', password: '', confirmPassword: '' });
  const [validationMessages, setValidationMessages] = useState({
    username: '',
    mail: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    setValidationMessages({ ...validationMessages, [name]: '' });
  };

  const handleRegister = async () => {
    const { username, mail, password, confirmPassword } = userInfo;
    const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9]{2,16}$/;
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,32}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let newValidationMessages = {};

    if (!username || !password || !mail || !confirmPassword) {
      newValidationMessages = {
        username: 'Please fill out all fields',
        mail: '',
        password: '',
        confirmPassword: '',
      };
    } else {
      newValidationMessages = {
        username: !USER_REGEX.test(username) ? 'Username must be between 3 and 16 characters.' : '',
        mail: !EMAIL_REGEX.test(mail) ? 'Invalid email format. Please use a valid email address (example: user@mail.com)' : '',
        password: !PWD_REGEX.test(password) ? 'Password must be between 8 and 32 characters, and contain at least one digit, one lowercase letter, one uppercase letter, and one special character (!#$%&?).' : '',
        confirmPassword: password !== confirmPassword ? 'Passwords do not match!' : '',
      };
    }

    setValidationMessages(newValidationMessages);

    if (Object.values(newValidationMessages).some((message) => message !== '')) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/auth/register', { username, mail, password }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = response.data;

      if (response.data.success) {
        console.log('User signed up successfully!');
        if (data.success) {
          console.log('Sign-up successful');
          localStorage.setItem('accessToken', data.accessToken);
          console.log(response.data);
          navigate('/chat');
        }
      } else {
        console.error('Register failed:', response.data.error);
      }
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <section>
      <div className="flex flex-col items-center justify-center h-screen  bg-linear-gradient(#dde1e4 ,#2b0f1c)">
      <div className="w-100 p-10 bg-white bg-opacity-50 rounded shadow  ">
      <h2 className="text-5xl font-bold text-black-800 mb-4 text-center ">REGISTER</h2>
        <p style={{textAlignVertical: "center",textAlign: "center",}}>Welcome to ChitChat!</p>
      <br></br>
      
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Username:
            <input  type="text" name="username" value={userInfo.username} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300" />
            <span className="text-red-500 text-sm">{validationMessages.username}</span>
          </label>
          <label className="block text-gray-700 text-sm font-medium mb-2 mt-4">
            Mail:
            <input type="email" name="mail" value={userInfo.mail} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300" />
            <span className="text-red-500 text-sm">{validationMessages.mail}</span>
          </label>
          <label className="block text-gray-700 text-sm font-medium mb-2 mt-4">
            Password:
            <input type="password" name="password" value={userInfo.password} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300" />
            <span className="text-red-500 text-sm">{validationMessages.password}</span>
          </label>
          <label className="block text-gray-700 text-sm font-medium mb-2 mt-4">
            Confirm Password:
            <input type="password" name="confirmPassword" value={userInfo.confirmPassword} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300" />
            <span className="text-red-500 text-sm">{validationMessages.confirmPassword}</span>
          </label>
          <br></br>
          <p style={{textAlignVertical: "center",textAlign: "center",}}>Do you have an account? <Link to="/login"><b>LOGIN</b></Link> </p>
          <button onClick={handleRegister} className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50">Register</button>
        </div>
      </div>
    </section>
  );
};

export default RegisterValidation;
