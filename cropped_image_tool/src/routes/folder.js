import express from 'express';
import { validateFolderPath, getImagesFromFolder } from '../utils/fileSystem.js';

const router = express.Router(); // 創建一個新的 Express 路由器

router.post('/select', (req, res) => { // 處理選擇資料夾的路由
    const { folderPath } = req.body; // 從請求主體中提取 folderPath

    try {
        validateFolderPath(folderPath);
        const images = getImagesFromFolder(folderPath);
        res.json({ images });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export { router };