const Message = require('../../models/Message');

const saveMessage = async (req, res) => {
  const { sender, recipient, content } = req.body;
  try {
    await Message.create({ sender, recipient, content });
    res.json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  saveMessage,
};
