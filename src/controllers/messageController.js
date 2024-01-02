const Message = require('../../models/Message');
const multer = require('multer');
const { resolve } = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.params);
    const { recipient } = req.params;
     //PROBLEM
    const destinationPath = resolve(__dirname, `../uploads/${recipient}`);

    try {
      // Create recipient folder if it doesn't exist
      fs.promises.mkdir(destinationPath, { recursive: true });
    } catch (error) {
      console.error('Error creating recipient folder:', error);
    }

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

const saveMessage = async (req, res) => {
  try {
    if (!req.file) {
      // Handling text messages
      const { sender, recipient, content } = req.body;
      await Message.create({ sender, recipient, content });

    }
    else {
      // Handling file messages
      const { sender, recipient, content } = req.body;
      const { originalname } = req.file;

      await Message.create({ sender, recipient, content, fileName: originalname });
      res.json({ success: true, message: 'File message saved successfully' });
    }
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const clearChatHistory = async (req, res) => {
  const { username, recipient } = req.params;

  try {
    // Logic to clear chat history for the specific conversation in the database
    await Message.deleteMany({
      $or: [
        { sender: username, recipient: recipient },
        { sender: recipient, recipient: username },
      ],
    });

    res.json({ success: true, message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Error clearing chat history in the database' });
  }
};

// Export multer middleware
const uploadMiddleware = upload.single('file');

// Export the functions
module.exports = {
  uploadMiddleware,
  saveMessage,
  clearChatHistory,
};