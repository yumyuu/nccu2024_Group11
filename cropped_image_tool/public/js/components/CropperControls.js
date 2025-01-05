// CropperControls 類別用於處理圖片裁切工具的控制按鈕介面
export class CropperControls {
    // 建構子初始化控制按鈕容器和事件監聽器
    constructor() {
        this.container = this.createControlsContainer();
        this.setupEventListeners();
    }

    // 創建包含確認和取消按鈕的控制容器
    createControlsContainer() {
        const container = document.createElement('div');
        container.className = 'cropper-controls';
        
        container.innerHTML = `
            <button class="nav-button confirm-btn">Confirm Cropped and Save</button>
            <button class="nav-button cancel-btn">Cancel</button>
        `;
        
        return container;
    }

    // 設置按鈕的事件監聽器
    // 確認按鈕觸發 saveChanges 事件
    // 取消按鈕觸發 cancelCropping 事件
    setupEventListeners() {
        const confirmBtn = this.container.querySelector('.confirm-btn');
        const cancelBtn = this.container.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('saveChanges'));
        });

        cancelBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('cancelCropping'));
        });
    }

    // 顯示控制按鈕容器
    show() {
        this.container.style.display = 'flex';
    }

    // 隱藏控制按鈕容器
    hide() {
        this.container.style.display = 'none';
    }
}