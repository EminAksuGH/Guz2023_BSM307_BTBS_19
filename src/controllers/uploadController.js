const File = require('../models/File');

exports.saveFileDetails = async (req, res) => {
  if (!req.file) {
    console.log('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  const { originalname, path } = req.file;

  try {
    // Save file details to the database
    const newFile = await File.create({
      fileName: originalname,
      filePath: path,
    });

    console.log('File details saved to the database:', newFile);
    res.send('File uploaded!');
  } catch (error) {
    console.error('Error saving file details to the database:', error);
    return res.status(500).send('Internal Server Error');
  }
};
