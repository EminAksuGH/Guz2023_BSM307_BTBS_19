const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

const loginController = require('../src/controllers/loginController.js');
const registerController = require('../src/controllers/registerController.js');
const messageController = require('../src/controllers/messageController.js');
const Message = require('../models/Message.js');
const File = require('../models/File.js');


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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { originalname, path } = req.file;

    const newFile = await File.create({
      fileName: originalname,
      filePath: path,
    });

    console.log('File details saved to the database:', newFile);

    return res.send('File uploaded!');
  } catch (error) {
    console.error('Error saving file details to the database:', error);
    return res.status(500).send('Internal Server Error');
  }
});


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
