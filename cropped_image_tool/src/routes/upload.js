import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createUploadDirectory } from '../utils/fileSystem.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, '../../public/uploads');
createUploadDirectory(uploadDirectory);

// Get the next available number for image naming
function getNextImageNumber() {
    const files = fs.readdirSync(uploadDirectory);
    const numbers = files
        .filter(file => file.match(/^cropped_image_\d+\./))
        .map(file => parseInt(file.match(/^cropped_image_(\d+)\./)[1]));
    
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDirectory),
    filename: (req, file, cb) => {
        const nextNumber = getNextImageNumber();
        const extension = path.extname(file.originalname);
        const filename = `cropped_image_${nextNumber}${extension}`;
        cb(null, filename);
    },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        message: 'File uploaded successfully!',
        file: req.file,
    });
});

// Delete image endpoint
router.delete('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDirectory, filename);
    
    if (fs.existsSync(filepath)) {
        try {
            fs.unlinkSync(filepath);
            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete file' });
        }
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Reorder images endpoint
router.post('/reorder', express.json(), (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Invalid order format' });
    }
    
    // Here you could save the order to a database if needed
    res.json({ message: 'Order updated successfully' });
});

export { router };