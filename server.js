const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const sequelize = require('./database');
require('dotenv').config();
const app = express();
const admin = require('./src/admin/admin');
const verifyJWT = require('./middlewares/jwtVerify');

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3001;
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = {};

io.on('connection', (socket) => {
  socket.on('userConnected', (username) => {
    socket.join(username);
    socket.username = username;
    connectedUsers[socket.id] = username;
    io.emit('connectedUsers', Object.values(connectedUsers));
  });

  socket.on('privateMessage', (data) => {
    io.to(data.recipient).emit('privateMessage', {
      from: socket.username,
      message: data.message,
    });
    console.log(data);
  });

  socket.on('disconnect', () => {
    delete connectedUsers[socket.id];
    io.emit('connectedUsers', Object.values(connectedUsers));
  });
});


app.get('/getusername', verifyJWT, (req, res) => {
  res.json({ username: req.username });
});

app.use('/admin', admin);
app.use('/auth', require('./routes/authRoutes'));

sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
