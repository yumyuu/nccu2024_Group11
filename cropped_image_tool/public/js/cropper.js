const imgNewWidth = 800;
let cropper = null;
const croppedImages = [];

export function initCropper(imageElement) {
    
    if (!imageElement) {
        console.error('Image element is not defined for cropper initialization.');
        return null;
    }

    if (cropper) {
        cropper.destroy();
    }
    
    cropper = new Cropper(imageElement, {
        aspectRatio: NaN,
        autoCropArea: 0.5,
        dragMode: 'crop',
        cropBoxResizable: true,
        movable: true,
        zoomable: true,
        rotatable: false,
    });
    console.log('Cropper initialized with element in cropper.js: ', imageElement);
    return cropper;
}
// export function initCropper(imageElement) {
//     if (!imageElement) {
//         console.error('Image element is not defined for cropper initialization.');
//         return null;
//     }

//     if (cropper) {
//         cropper.destroy();
//     }

//     cropper = new Cropper(imageElement, {
//         aspectRatio: 1, // 可根據需求調整裁切比例
//         viewMode: 1,    // 限制裁切框不能超出圖片邊界
//         autoCropArea: 0.8, // 初始裁切區域
//         scalable: true,
//         zoomable: true,
//         movable: true,
//         cropBoxResizable: true
//     });
//     console.log('Cropper initialized with element:', imageElement);
//     return cropper;
// }


export function compressImage(canvas, targetSize = 150) {
    return new Promise((resolve) => {
        let compressRatio = 100;
        let maxAttempts = 50;
        let attempts = 0;
        
        const compress = () => {
            compressRatio -= 2;
            const compressed = canvas.toDataURL("image/jpeg", compressRatio / 100);
            
            if (Math.round(0.75 * compressed.length / 1000) <= targetSize || attempts >= maxAttempts) {
                resolve(compressed);
            } else {
                attempts++;
                compress();
            }
        };
        
        compress();
    });
}