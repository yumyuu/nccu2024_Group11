// 引入所需的 Node.js 內建模組
import fs from 'fs'; // 引入 fs 模組
import path from 'path'; // 引入 path 模組

// 創建上傳目錄的函數
// 如果目錄不存在，則遞迴創建目錄結構
export function createUploadDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 驗證資料夾路徑的函數
// 檢查路徑是否存在且有效
export function validateFolderPath(folderPath) {
    if (!folderPath) {
        throw new Error('Folder path is required');
    }
    if (!fs.existsSync(folderPath)) {
        throw new Error('Folder does not exist');
    }
}

// 從指定資料夾獲取所有圖片檔案的函數
// 支援的圖片格式：jpg、jpeg、png、gif
export function getImagesFromFolder(folderPath) {
    return fs.readdirSync(folderPath) // 讀取資料夾中的所有檔案
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))  // 使用正則表達式過濾圖片檔案
        .map(file => path.join(folderPath, file));  // 將檔名轉換為完整路徑
}