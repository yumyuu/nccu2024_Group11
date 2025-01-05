export class PreviewPagination {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.previewContainer = document.getElementById('result');
        this.previewImage = document.getElementById('fullImage');
        
        this.setupNavigation();
    }

    setupNavigation() {
        const navigation = document.createElement('div');
        navigation.className = 'preview-navigation';
        
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'nav-button';
        this.prevButton.textContent = 'Previous';
        this.prevButton.onclick = () => this.showPrevious();
        
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'nav-button';
        this.nextButton.textContent = 'Next';
        this.nextButton.onclick = () => this.showNext();
        
        navigation.appendChild(this.prevButton);
        navigation.appendChild(this.nextButton);
        
        this.previewContainer.appendChild(navigation);
        this.updateButtons();
    }

    addImage(imageUrl) {
        if (!this.images.includes(imageUrl)) {
            this.images.push(imageUrl);
            this.currentIndex = this.images.length - 1;
            this.showImage();
        }
    }

    showImage() {
        if (this.images.length > 0) {
            this.previewImage.src = this.images[this.currentIndex];
            this.updateButtons();
        }
    }

    showNext() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.showImage();
        }
    }

    showPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showImage();
        }
    }

    updateButtons() {
        this.prevButton.disabled = this.currentIndex <= 0;
        this.nextButton.disabled = this.currentIndex >= this.images.length - 1;
    }
}