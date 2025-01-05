import { initCropper } from './cropper.js';
// ImageBrowser 類別用於處理圖片瀏覽器的功能
export class ImageBrowser {
    // 建構子初始化圖片瀏覽器的基本屬性和設定
    constructor(cropperControls) {
        this.currentIndex = 0; // 目前顯示的圖片索引
        this.images = []; // 儲存所有圖片的陣列
        this.cropperControls = cropperControls;
        this.setupElements(); // 設定 UI 元素
        this.setupEventListeners(); // 設定事件監聽器
    }

    // 設定並建立所有必要的 UI 元素
    setupElements() {
        // 建立主容器
        this.container = document.createElement('div');
        this.container.className = 'image-browser';
        
        // 建立圖片預覽區域
        this.previewSection = document.createElement('div');
        this.previewSection.className = 'image-preview';
        
        // 建立圖片元素
        this.imageElement = document.createElement('img');
        this.previewSection.appendChild(this.imageElement);
        
        // 建立圖片資訊區域
        this.infoSection = document.createElement('div');
        this.infoSection.className = 'image-info';
        
        // 建立分頁導覽
        this.pagination = this.createPagination();
        
        // 建立開始裁切按鈕
        this.startCropButton = document.createElement('button');
        this.startCropButton.className = 'nav-button';
        this.startCropButton.textContent = 'Start Cropped Image';
        
        // 組合所有區域到主容器中
        this.container.appendChild(this.previewSection);
        this.container.appendChild(this.infoSection);
        this.container.appendChild(this.pagination);
        this.container.appendChild(this.startCropButton);
        
        // 將主容器加入到頁面中
        document.getElementById('imageBrowserContainer').appendChild(this.container);
    }

    // 建立分頁導覽元素
    createPagination() {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        // 建立上一頁按鈕
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'nav-button';
        this.prevButton.textContent = 'Previous';
        
        // 建立頁碼顯示區域
        this.pageNumbers = document.createElement('div');
        this.pageNumbers.className = 'page-numbers';
        
        // 建立分頁資訊顯示區域
        this.paginationInfo = document.createElement('div');
        this.paginationInfo.className = 'pagination-info';
        
        // 建立下一頁按鈕
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'nav-button';
        this.nextButton.textContent = 'Next';
        
        // 組合所有分頁元素
        pagination.appendChild(this.prevButton);
        pagination.appendChild(this.pageNumbers);
        pagination.appendChild(this.paginationInfo);
        pagination.appendChild(this.nextButton);
        
        return pagination;
    }

    // 設定所有按鈕的事件監聽器
    setupEventListeners() {
        this.prevButton.onclick = () => this.showPrevious(); // 上一頁按鈕點擊事件
        this.nextButton.onclick = () => this.showNext(); // 下一頁按鈕點擊事件
        this.startCropButton.onclick = () => this.startEditing(); // 開始裁切按鈕點擊事件
    }

    // 載入圖片檔案到瀏覽器中
    loadImages(files) {
        this.images = files; // 儲存圖片檔案
        this.currentIndex = 0; // 重設當前索引
        this.updateDisplay(); // 更新顯示
        this.updatePagination(); // 更新分頁
    }

    // 更新圖片顯示
    updateDisplay() {
        if (this.images.length === 0) return;
        
        const currentImageUrl = this.images[this.currentIndex];
        this.imageElement.src = currentImageUrl; // 設定圖片來源
        this.infoSection.textContent = `Image URL: ${currentImageUrl}`; // 更新檔案資訊
        this.updatePagination(); // 更新分頁狀態
    }

    // 更新分頁導覽狀態
    updatePagination() {
        // 設定上一頁/下一頁按鈕的啟用狀態
        this.prevButton.disabled = this.currentIndex === 0;
        this.nextButton.disabled = this.currentIndex === this.images.length - 1;
        // 更新分頁資訊
        this.paginationInfo.textContent = `Page ${this.currentIndex + 1} of ${this.images.length}`;
        this.updatePageNumbers(); // 更新頁碼顯示
    }

    // 更新頁碼顯示
    updatePageNumbers() {
        this.pageNumbers.innerHTML = '';
        const totalPages = this.images.length;
        
        // 建立所有頁碼按鈕
        for (let i = 0; i < totalPages; i++) {
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            if (i === this.currentIndex) pageNumber.classList.add('active'); // 標記當前頁碼
            pageNumber.textContent = i + 1;
            pageNumber.onclick = () => this.goToPage(i); // 設定頁碼點擊事件
            this.pageNumbers.appendChild(pageNumber);
        }
    }

    // 顯示上一張圖片
    showPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateDisplay();
        }
    }

    // 顯示下一張圖片
    showNext() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.updateDisplay();
        }
    }

    // 跳轉到指定頁面
    goToPage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateDisplay();
        }
    }

    // 開始編輯當前圖片
    startEditing() {
        // const currentImage = this.images[this.currentIndex];
        // // 觸發開始編輯事件
        // window.dispatchEvent(new CustomEvent('startEditing', {
        //     detail: { file: currentImage }
        // }));
        const currentImageUrl = this.images[this.currentIndex];
        const img = document.getElementById('tailoringImg');
        const container = document.querySelector('.img-container');
        
        container.style.display = 'block';
        this.cropperControls.show();
        
        img.src = currentImageUrl; // 使用伺服器提供的圖片 URL
        console.log('Current image source set:', img.src);

        if (window.currentCropper) {
            console.log('Destroying previous cropper instance...');
            window.currentCropper.destroy();
        }
        try {
            window.currentCropper = initCropper(img);
            console.log('Cropper initialized:', window.currentCropper);
        } catch (error) {
            console.error('Failed to initialize cropper:', error);
        }
    }

    // 取得當前顯示的圖片
    getCurrentImage() {
        return this.images[this.currentIndex];
    }
}