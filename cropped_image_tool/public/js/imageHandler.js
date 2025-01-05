import { initCropper, compressImage } from './cropper.js';

export function handleFileSelect(event, onImageLoad) {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.name));
    
    if (imageFiles.length === 0) {
        alert("No valid images found in the selected folder.");
        return;
    }
    
    loadImages(imageFiles, onImageLoad);
}

function loadImages(files, onImageLoad) {
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => onImageLoad(e.target.result);
        reader.readAsDataURL(file);
    });
}

export async function saveCroppedImage(croppedCanvas, mimeType = 'image/jpeg') {
    // try {
    //     let imageData;
    //     if (mimeType === 'image/png') {
    //         imageData = croppedCanvas.toDataURL('image/png');
    //     } else {
    //         imageData = await compressImage(croppedCanvas);
    //     }
        
    //     const response = await fetch(imageData);
    //     const blob = await response.blob();
        
    //     const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    //     const formData = new FormData();
    //     formData.append("image", blob, `cropped_image_${Date.now()}.${extension}`);
        
    //     const uploadResponse = await fetch('/api/upload', {
    //         method: 'POST',
    //         body: formData,
    //     });
        
    //     if (!uploadResponse.ok) {
    //         throw new Error('Upload failed');
    //     }
        
    //     const data = await uploadResponse.json();
    //     return data;
    // } catch (error) {
    //     console.error("Error saving image:", error);
    //     throw error;
    // }
        try {
            const blob = await new Promise(resolve => croppedCanvas.toBlob(resolve, mimeType, 0.9));
            
            const formData = new FormData();
            formData.append("image", blob, `cropped_image_${Date.now()}.${mimeType.split('/')[1]}`);
    
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }
    
            const data = await uploadResponse.json();
            return data;
        } catch (error) {
            console.error("Error saving image:", error);
            throw error;
        }
    }
