import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const Chat = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [privateMessageTarget, setPrivateMessageTarget] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});
  const fileInputRef = useRef(null);

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
      const sender = data.from;

      if (sender !== privateMessageTarget) {
        setUnreadMessages((prevUnreadMessages) => ({
          ...prevUnreadMessages,
          [sender]: (prevUnreadMessages[sender] || 0) + 1,
        }));
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, content: data.message, type: 'received' },
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
    if (privateMessageTarget && socket) {
      if (messageInput) {
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
            console.log('Text message sent successfully:', data);
          } else {
            console.error('Error sending text message:', data.error);
          }
        } catch (error) {
          console.error('Error sending text message:', error.message);
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: username, content: messageInput, type: 'sent' },
        ]);

        setMessageInput('');
      } else if (fileInputRef.current.files.length > 0) {
        handleFileUpload(fileInputRef.current.files[0]);
      }
    }
  };

  const handleFileUpload = async (file) => {
    console.log('File:', file);
    console.log('Username:', username);
  
    const formData = new FormData();
  
    if (file) {
      formData.append('file', file, file.name);
      formData.append('sender', username);
  
      for (const pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
  
      try {
        const response = await axios.post('http://localhost:3001/auth/upload', formData);
  
        // Extract file information
        const fileInfo = {
          filename: file.name,
          size: file.size,
          type: file.type,
        };
  
        let content = '';

// If the uploaded file is an image, include image data in the state
if (fileInfo.type.startsWith('image')) {
  const data = response.data; // Assuming the server sends the image data
  fileInfo.data = data; // Assuming the image data is directly sent from the server
  // You can choose to keep content as an empty string or remove this line if you don't want any text content
}

setMessages((prevMessages) => [
  ...prevMessages,
  { sender: username, content, type: 'sent', fileInfo },
]);
        console.log('File uploaded successfully');
        fileInputRef.current.value = ''; // Resetting the value to an empty string
      } catch (error) {
        console.error('Error uploading file:', error.message);
      }
    }
  };
  
  
  const handleUserClick = (recipient) => {
    // Clear unread messages for the selected user
    setUnreadMessages((prevUnreadMessages) => ({
      ...prevUnreadMessages,
      [recipient]: 0,
    }));

    // Mark messages as read when the user is in the chat
    if (recipient === privateMessageTarget) {
      setUnreadMessages((prevUnreadMessages) => ({
        ...prevUnreadMessages,
        [recipient]: 0,
      }));
    }

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
              className="cursor-pointer text-blue-500 hover:underline relative"
            >
              {user}
              {unreadMessages[user] > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 rounded-full h-3 w-3"></span>
              )}
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
        
        {/* Display image if the message is related to an image */}
        {msg.type === 'received' && msg.fileInfo && msg.fileInfo.type.startsWith('image') && (
          <div>
            <img src={`data:${msg.fileInfo.type};base64,${msg.fileInfo.data}`} alt="" />
          </div>
        )}
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
            <input
              ref={fileInputRef}
              type="file"
              onClick={async () => await handleFileUpload(fileInputRef.current.files[0])}
              className="mb-20 p-2 border border-gray-300 mr-2"
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
