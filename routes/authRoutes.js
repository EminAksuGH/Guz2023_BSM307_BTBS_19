const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const loginController = require('../src/controllers/loginController.js');
const registerController = require('../src/controllers/registerController.js');
const messageController = require('../src/controllers/messageController.js');
const getFileController = require('../src/controllers/getFileController');
const Message = require('../models/Message.js');


router.post(
  '/register',
  registerController.validateRegisterRequest,
  registerController.checkIfUserExists,
  registerController.createUser
);

router.post(
  '/login',
  loginController.validateLoginRequest,
  loginController.checkUserCredentials,
  loginController.loginUser
);

router.post(
  '/message',
  messageController.saveMessage,
);

router.post('/saveFile', messageController.uploadMiddleware, messageController.saveMessage);

router.get(`/getFile/:recipient/:fileName`,
  getFileController.getFile
);


router.get('/message/history/:sender/:recipient', async (req, res) => {
  const { sender, recipient } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: sender, recipient: recipient },
          { sender: recipient, recipient: sender },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
