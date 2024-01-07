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
  const messagesContainerRef = useRef();
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [userFilter, setUserFilter] = useState('');

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
    if (!isScrolledUp && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    
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
              fileName: msg.fileName,
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
  }, [username, privateMessageTarget, isScrolledUp]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      setIsScrolledUp(container.scrollTop < container.scrollHeight - container.clientHeight);
    }
     };


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
    // Clear unread messages for the selected user
    setUnreadMessages((prevUnreadMessages) => (
      { ...prevUnreadMessages, [recipient]: 0 }
    ));

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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const filteredUsers = connectedUsers.filter((user) =>
    user.toLowerCase().includes(userFilter.toLowerCase())
  );


  return (
    <div className="flex h-auto w-full fixed">
      <div className="w-1/6 bg-gray-200 pt-4">
         <h1 className="text-xl font-bold mb-4 text-center">Connected Users</h1>
        <input
          type="text"
          placeholder="Filter users..."
          value={userFilter}
          onChange={handleUserFilterChange}
          className="mb-4 p-2 ml-4 border border-gray-300"
        />
        <ul className="list-disc pl-8">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="cursor-pointer text-blue-500 hover:underline relative"
            >
              {user}
              {unreadMessages[user] > 0 && (
                <span className="absolute top-0 right-2 bg-red-500 rounded-full h-3 w-3"></span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full bg-white p-4 flex flex-col h-screen">

        <div className="flex-grow mb-4 overflow-y-auto" ref={messagesContainerRef} onScroll={handleScroll}>

        {privateMessageTarget && (
          <ul className="list-disc pl-6">
            {messages.map((msg, index) => (
              <li key={index} className={`mb-2 ${msg.type === 'sent' ? 'text-green-600' : 'text-blue-600'}`}>
                <strong>{msg.sender}: </strong> {msg.content}              
              </li>
            ))}
          </ul>
        )}
          <div ref={messagesEndRef}></div>
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
      </div>
    </div>
  );
};

export default Chat;