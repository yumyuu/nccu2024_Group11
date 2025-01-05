// 導入所需的模組
import { ImageBrowser } from './ImageBrowser.js';
import { CroppedImagesPanel } from './CroppedImagesPanel.js';
import { CropperControls } from './components/CropperControls.js';
import { initCropper } from './cropper.js';
import { sortFilesByPage } from './utils/imageSort.js';
// 初始化主要元件
const cropperControls = new CropperControls(); // 先初始化 cropperControls
document.querySelector('.img-container').appendChild(cropperControls.container);

const imageBrowser = new ImageBrowser(cropperControls);
const croppedImagesPanel = new CroppedImagesPanel();
let currentCropper = null;

// 將裁切控制元件加入容器中
document.querySelector('.img-container').appendChild(cropperControls.container);

/*
// 處理資料夾選擇事件
document.getElementById('folderInput').addEventListener('change', (event) => {
    // 過濾出圖片檔案
    const files = Array.from(event.target.files)
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.name));
    
    if (files.length === 0) {
        alert("No valid images found in the selected folder.");
        return;
    }
    
    // 依照頁碼排序檔案並載入圖片瀏覽器
    const sortedFiles = sortFilesByPage(files);
    imageBrowser.loadImages(sortedFiles);
});
*/
// 新增的部分
async function loadImagesFromServer() {
    try {
        const response = await fetch('/api/images'); // 從伺服器獲取圖片清單
        if (!response.ok) throw new Error('Failed to fetch images from server');

        const imageUrls = await response.json(); // 獲取圖片 URL 陣列
        // print the imageUrls
        console.log(imageUrls);

        // 檢查是否有圖片，沒有則結束後續程式
        if (imageUrls.length === 0) {
            alert('No images found on the server');
            return; 
        }
        // 依照頁碼排序檔案並載入圖片瀏覽器
        const sortedImageUrls = imageUrls.sort((a, b) => {
            const pageA = parseInt(a.match(/page_(\d+)\.jpg/)[1]);
            const pageB = parseInt(b.match(/page_(\d+)\.jpg/)[1]);
            return pageA - pageB;
        });
        console.log(sortedImageUrls);
        // 載入圖片到 ImageBrowser
        imageBrowser.loadImages(sortedImageUrls); 
    } catch (error) {
        console.error('Error loading images from server:', error);
        alert('Failed to load images from server');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadImagesFromServer(); // 頁面載入後從伺服器讀取圖片
});
//
// 處理開始編輯事件
window.addEventListener('startEditing', (event) => {
    const file = event.detail.file;
    const img = document.getElementById('tailoringImg');
    const container = document.querySelector('.img-container');
    
    // 顯示裁切介面
    container.style.display = 'block';
    cropperControls.show();
    
    // 讀取並顯示選擇的圖片
    console.log('Initializing cropper...');
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        window.currentCropper = initCropper(img);
    };
    console.log('Cropper initialized:', window.currentCropper);
    reader.readAsDataURL(file);
});

// 處理取消裁切事件
window.addEventListener('cancelCropping', () => {
    if (window.currentCropper) {
        window.currentCropper.destroy();
        window.currentCropper = null;
    }
    document.querySelector('.img-container').style.display = 'none';
    cropperControls.hide();
});

// 處理儲存變更事件
window.addEventListener('saveChanges', async () => {
    console.log('saveChanges triggered');
    if (!window.currentCropper) {
        alert("No image is being edited!");
        return;
    }

    try {
        // 取得裁切後的畫布
        const canvas = window.currentCropper.getCroppedCanvas({
            width: 800,
            height: 800,
            imageSmoothingQuality: 'high'
        });
        console.log('Generated Canvas:', canvas);
        if (!canvas) {
            throw new Error('Failed to crop image');
        }

        // 將畫布轉換為 blob 格式
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });
        console.log('Generated Blob:', blob);
        // 準備上傳資料
        const formData = new FormData();
        formData.append('image', blob, 'cropped_image.jpg');

        // 上傳裁切後的圖片
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        // 處理上傳成功後的操作
        const result = await response.json();
        console.log('Upload Result:', result);

        croppedImagesPanel.addImage(result);
        alert("Image cropped and saved successfully!");
        document.querySelector('.img-container').style.display = 'none';
        cropperControls.hide();
        window.currentCropper.destroy();
        window.currentCropper = null;
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to save image: " + error.message);
    }
    const result = await response.json();
});

window.addEventListener('startEditing', () => console.log('startEditing triggered'));
window.addEventListener('cancelCropping', () => console.log('cancelCropping triggered'));
window.addEventListener('saveChanges', () => console.log('saveChanges triggered'));
