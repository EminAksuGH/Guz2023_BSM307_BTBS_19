const bcrypt = require('bcrypt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
//const crypto = require('crypto');
const { isEmail } = require("validator");

const validateLoginRequest = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  req.User = { username, password };
  next();
};

const checkUserCredentials = async (req, res, next) => {
  const { username, password } = req.User;
  const isEmailorUsername = isEmail(username) ? true : false;

  const user = isEmailorUsername
    ? await User.findOne({ where: { mail: username } })
    : await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  next();
};

//const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

const generateAccessToken = ( username ) => {
  return jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const loginUser = async (req, res) => {
  try {
    const username = req.User.username;
    //const refreshToken = generateRefreshToken();
    const accessToken = generateAccessToken(username);
  

    res.json({
      success: true, message: 'User signed in successfully', accessToken, //refreshToken
    });
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  validateLoginRequest,
  checkUserCredentials,
  loginUser,
};
