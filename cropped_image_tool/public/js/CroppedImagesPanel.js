export class CroppedImagesPanel {
    constructor() {
        this.images = [];
        this.setupPanel();
        this.setupEventListeners();
    }

    setupPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'cropped-images-panel';
        this.panel.innerHTML = `
            <h3>Cropped Images</h3>
            <div class="cropped-images-list"></div>
        `;
        
        document.body.appendChild(this.panel);
        this.imagesList = this.panel.querySelector('.cropped-images-list');
    }

    setupEventListeners() {
        this.imagesList.addEventListener('click', (e) => {
            const target = e.target;
            const imageItem = target.closest('.cropped-image-item');
            
            if (!imageItem) return;

            if (target.classList.contains('edit-btn')) {
                this.editImage(imageItem.dataset.filename);
            } else if (target.classList.contains('delete-btn')) {
                this.deleteImage(imageItem.dataset.filename);
            }
        });

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        this.imagesList.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.cropped-image-item');
            if (item) {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', item.dataset.filename);
            }
        });

        this.imagesList.addEventListener('dragend', (e) => {
            const item = e.target.closest('.cropped-image-item');
            if (item) {
                item.classList.remove('dragging');
                this.updateImagesOrder();
            }
        });

        this.imagesList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = this.imagesList.querySelector('.dragging');
            if (!draggingItem) return;

            const siblings = [...this.imagesList.querySelectorAll('.cropped-image-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                return e.clientY <= box.top + box.height / 2;
            });

            if (nextSibling) {
                this.imagesList.insertBefore(draggingItem, nextSibling);
            } else {
                this.imagesList.appendChild(draggingItem);
            }
        });
    }

    addImage(imageData) {
        const { file } = imageData;
        const imageItem = document.createElement('div');
        imageItem.className = 'cropped-image-item';
        imageItem.draggable = true;
        imageItem.dataset.filename = file.filename;
        
        imageItem.innerHTML = `
            <span class="drag-handle">⋮⋮</span>
            <img src="/uploads/${file.filename}" alt="Cropped image">
            <div class="cropped-image-info">
                <div>${file.filename}</div>
                <div>${Math.round(file.size / 1024)}KB</div>
                <div class="cropped-image-actions">
                    <button class="edit-btn nav-button">Edit</button>
                    <button class="delete-btn nav-button">Delete</button>
                </div>
            </div>
        `;
        
        this.imagesList.insertBefore(imageItem, this.imagesList.firstChild);
        this.images.unshift({ ...imageData, timestamp: new Date() });
    }

    async editImage(filename) {
        try {
            const response = await fetch(`/uploads/${filename}`);
            if (!response.ok) throw new Error('Failed to load image');
            
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });
            
            window.dispatchEvent(new CustomEvent('startEditing', {
                detail: { file }
            }));
        } catch (error) {
            console.error('Error loading image for editing:', error);
            alert('Failed to load image for editing');
        }
    }

    deleteImage(filename) {
        if (confirm('Are you sure you want to delete this image?')) {
            fetch(`/api/upload/${filename}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        const item = this.imagesList.querySelector(`[data-filename="${filename}"]`);
                        if (item) {
                            item.remove();
                            this.images = this.images.filter(img => img.file.filename !== filename);
                        }
                    } else {
                        throw new Error('Failed to delete image');
                    }
                })
                .catch(error => {
                    console.error('Error deleting image:', error);
                    alert('Failed to delete image');
                });
        }
    }

    updateImagesOrder() {
        const newOrder = [...this.imagesList.querySelectorAll('.cropped-image-item')]
            .map(item => item.dataset.filename);
        
        fetch('/api/upload/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
        }).catch(error => {
            console.error('Error updating image order:', error);
        });
    }
}