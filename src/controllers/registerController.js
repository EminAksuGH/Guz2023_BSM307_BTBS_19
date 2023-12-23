const bcrypt = require('bcrypt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
//const crypto = require('crypto');


const validateRegisterRequest = (req, res, next) => {
    const { username, mail, password } = req.body;
  
    if (!username || !mail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    req.User = { username, mail, password };
    next();
  };
  
  const checkIfUserExists = async (req, res, next) => {
    const { username, mail } = req.User;
  
    const existingUser = await User.findOne({ where: { username } });
  
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken!' });
    }
  
    const existingMail = await User.findOne({ where: { mail } });
  
    if (existingMail) {
      return res.status(400).json({ error: 'Mail is already taken!' });
    }
  
    next();
  };
  //const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');
  
  const createUser = async (req, res) => {
    const { username, mail, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      //const refreshToken = generateRefreshToken();
      await User.create({ username, mail, password: hashedPassword });
      const accessToken = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      
      res.json({ success: true, message: 'User signed up successfully', accessToken });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  module.exports = {
    validateRegisterRequest,
    checkIfUserExists,
    createUser,
};