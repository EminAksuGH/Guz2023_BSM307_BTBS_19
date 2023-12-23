import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCRUD = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', mail: '', password: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  
  useEffect(() => {
    if (showAllUsers) {
      fetchData();
    } else {
      setUsers([]);
    }
  }, [showAllUsers]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/admin');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUserId) {
        const updatedData = { ...formData };
        if (formData.password) {
          updatedData.password = formData.password;
        }
        await axios.put(`http://localhost:3001/admin/${editingUserId}`, updatedData);
      } else {
        await axios.post('http://localhost:3001/admin', formData);
      }

      setFormData({ username: '', mail: '', password: '' });
      setEditingUserId(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (user) => {
    setFormData(user);
    setEditingUserId(user.id);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/admin/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleUsers = () => {
    setShowAllUsers((prevShowAllUsers) => !prevShowAllUsers);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  const filterUsers = (users) => {
      
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchInput) ||
        user.mail.toLowerCase().includes(searchInput)
    );
  };

  const handleFilter = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold">User List</h2>
      <ul className="list-none h-96 overflow-auto">
        {filterUsers(users).map((user) => (
          <li key={user.id} className="flex items-center mb-4">
            {user.username} - {user.mail}
            <button
              className="edit ml-2 px-4 py-2 border-0 rounded cursor-pointer bg-green-400 text-white"
              onClick={() => handleEdit(user)}
            >
              Edit
            </button>
            <button
              className="delete ml-2 px-4 py-2 border-0 rounded cursor-pointer bg-red-400 text-white"
              onClick={() => handleDelete(user.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mt-8">
        <label className="flex flex-col w-1/4">
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded outline-none"
          />
        </label>
        <label className="flex flex-col w-1/4">
          Mail:
          <input
            type="text"
            name="mail"
            value={formData.mail}
            onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded outline-none"
          />
        </label>
        <label className="flex flex-col w-1/4">
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-96 px-4 py-2 border-0 rounded bg-blue-400 text-white cursor-pointer"
        >
          {editingUserId ? 'Update User' : 'Add User'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={handleToggleUsers}
          className="w-40 px-4 py-2 border-0 rounded bg-gray-400 text-white cursor-pointer ml-4"
        >
          {showAllUsers ? 'Hide Users' : 'Show All Users'}
        </button>
        <button
          onClick={handleFilter}
          className="ml-2 px-4 py-2 border-0 rounded cursor-pointer bg-purple-400 text-white"
        >
          Filter
        </button>
      </div>

      <div>
        <input className="px-4 py-2 border border-gray-300 rounded outline-none"
          type="text"
          placeholder="Search by username or mail..."
          onChange={handleSearchChange}
        />
        {filterUsers(users).map((user) => (
          <div key={user.id}>
            {}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCRUD;