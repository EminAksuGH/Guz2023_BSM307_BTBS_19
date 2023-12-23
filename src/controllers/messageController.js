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
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  saveMessage,
  clearChatHistory,
};
