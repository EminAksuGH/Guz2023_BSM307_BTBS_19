const { resolve, extname } = require('path');
const fs = require('fs').promises;

const getFile = async (req, res) => {
  const { recipient, fileName } = req.params;
  const filePath = resolve(__dirname, '../uploads', recipient, fileName);

  try {
    console.log('File Path:', filePath);

    // Check if the file exists
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

    if (!fileExists) {
      console.error('File not found');
      return res.status(404).json({ error: 'File Not Found' });
    }

    // Read the file
    const data = await fs.readFile(filePath);

    // Set content type based on file extension
    const fileExtension = extname(filePath).slice(1);
    const contentType = `image/${fileExtension}`;

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  getFile,
};
