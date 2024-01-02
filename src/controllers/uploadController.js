const multer = require('multer');
const { resolve } = require('path');
const Message = require('../../models/Message');

const storage = multer.diskStorage({
    destination: resolve(__dirname, '../uploads'),
    filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

const saveFile = async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file uploaded.');
            return res.status(400).send('No file uploaded.');
        }

        const { originalname } = req.file;

        const newFile = await Message.create({
            fileName: originalname,
        });

        console.log('File details saved to the database:', newFile);

        return res.send('File uploaded!');
    } catch (error) {
        console.error('Error saving file details to the database:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = upload.single('file');
module.exports.saveFile = saveFile;