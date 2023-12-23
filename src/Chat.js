import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';


const Chat = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [privateMessageTarget, setPrivateMessageTarget] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');


  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
  
    const socket = socketIOClient('http://localhost:3001');
    setSocket(socket);
  
    fetch('http://localhost:3001/getusername', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        const username = data.username;
        setUsername(username);
        socket.emit('userConnected', username);
      })
      .catch(error => {
        console.error('Error fetching username:', error);
      });
  
    socket.emit('userConnected', username);
  
    socket.on('connectedUsers', (users) => {
      const filteredUsers = users.filter((user) => user !== username);
      setConnectedUsers(filteredUsers);
    });
  
    socket.on('privateMessage', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: data.from, content: data.message, type: 'received' },
      ]);
    });
  
    return () => {
      socket.disconnect();
    };
  }, [username, privateMessageTarget]);

  useEffect(() => {
    const fetchMessageHistory = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3001/auth/message/history/${username}/${privateMessageTarget}`
    );

    const data = response.data;
    if (data.success) {
      const updatedMessages = data.messages.map((msg) => {
        return {
          sender: msg.sender,
          content: msg.content,
          type: msg.sender === username ? 'sent' : 'received',
        };
      });
      setMessages(updatedMessages);
    } else {
      console.error('Error fetching message history:', data.error);
    }
  } catch (error) {
    console.error('Error fetching message history:', error.message);
  }
};

    if (privateMessageTarget) {
      fetchMessageHistory();
    }
  }, [username, privateMessageTarget]);

  const handleSendMessage = async () => {
    if (privateMessageTarget && messageInput && socket) {
      socket.emit('privateMessage', {
        recipient: privateMessageTarget,
        message: messageInput,
      });
  
      try {
        const response = await axios.post('http://localhost:3001/auth/message', {
          sender: username,
          recipient: privateMessageTarget,
          content: messageInput,
        });
  
        const data = response.data;
  
        if (data.success) {
          console.log('Message sent successfully:', data);
        } else {
          console.error('Error sending message:', data.error);
        }
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: username, content: messageInput, type: 'sent' },
      ]);
  
      setMessageInput('');
    }
  };

  const handleUserClick = (recipient) => {
    setPrivateMessageTarget(recipient);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-auto">
      <div className="w-1/5 bg-gray-200 p-4">
        <h1 className="text-xl font-bold mb-4">Connected Users</h1>
        <ul className="list-disc pl-4">
          {connectedUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="cursor-pointer text-blue-500 hover:underline"
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-4/5 bg-white p-4 flex flex-col h-screen">
        <div className="flex-grow mb-4 overflow-y-auto">
          {privateMessageTarget && (
            <ul className="list-disc pl-6">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`mb-2 ${msg.type === 'sent' ? 'text-green-600' : 'text-blue-600'}`}
                >
                  <strong>{msg.sender}:</strong> {msg.content}
                </li>
              ))}
            </ul>
          )}
        </div>

        {privateMessageTarget && (
          <div className="flex mt-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow mb-20 p-2 border border-gray-300 mr-2"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 h-10 rounded"
            >
              Send
            </button>
          </div>
        )}

        {privateMessageTarget && (
          <div>
            <button
              onClick={handleClearHistory}
              className="bg-red-500 text-white p-2 rounded mt-2"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
