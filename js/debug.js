// Debug script for iPhone mockup image loading
document.addEventListener('DOMContentLoaded', function() {
    const phoneImage = document.querySelector('.iphone-screen img');
    
    if (phoneImage) {
        console.log('Image element found:', phoneImage);
        console.log('Image source:', phoneImage.src);
        
        phoneImage.onload = function() {
            console.log('Image loaded successfully');
            console.log('Image dimensions:', {
                naturalWidth: phoneImage.naturalWidth,
                naturalHeight: phoneImage.naturalHeight,
                width: phoneImage.width,
                height: phoneImage.height
            });
        };
        
        phoneImage.onerror = function() {
            console.error('Failed to load image:', phoneImage.src);
        };
        
        // Force check if already loaded
        if (phoneImage.complete) {
            phoneImage.onload();
        }
    } else {
        console.error('Could not find phone image element');
    }
});
