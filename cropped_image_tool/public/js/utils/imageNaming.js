// Keep track of the current image number
let currentImageNumber = 0;

export function getNextImageName() {
    currentImageNumber++;
    return `cropped_image_${currentImageNumber}`;
}

export function resetImageCounter() {
    currentImageNumber = 0;
}