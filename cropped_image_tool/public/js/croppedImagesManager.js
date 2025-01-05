// Manage the cropped images display
export class CroppedImagesManager {
    constructor() {
        this.croppedImages = [];
        this.container = document.createElement('div');
        this.container.className = 'cropped-images-section';
        this.container.innerHTML = `
            <h2>Cropped Images</h2>
            <div class="cropped-images-grid"></div>
        `;
        
        document.body.appendChild(this.container);
        this.grid = this.container.querySelector('.cropped-images-grid');
    }

    addImage(imageData) {
        const { file } = imageData;
        const timestamp = new Date().toLocaleString();
        
        const card = document.createElement('div');
        card.className = 'cropped-image-card';
        
        card.innerHTML = `
            <img src="/uploads/${file.filename}" alt="Cropped image">
            <div class="cropped-image-info">
                <div>Name: ${file.filename}</div>
                <div>Size: ${Math.round(file.size / 1024)}KB</div>
                <div>Created: ${timestamp}</div>
            </div>
        `;
        
        this.grid.insertBefore(card, this.grid.firstChild);
        this.croppedImages.push({ ...imageData, timestamp });
    }
}