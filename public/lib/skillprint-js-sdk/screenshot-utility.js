export class ScreenshotUtility {
    constructor(logger) {
        this.logger = logger;
    }

    async captureScreenshot(canvas, options = {}) {
        try {
            const {
                format = 'image/jpeg',
                quality = 0.8,
                maxWidth = null,
                maxHeight = null
            } = options;

            if (!canvas) {
                throw new Error('No canvas provided for screenshot');
            }

            // Create a new canvas for the screenshot to avoid affecting the game
            const screenshotCanvas = document.createElement('canvas');
            const ctx = screenshotCanvas.getContext('2d');

            let targetWidth = canvas.width;
            let targetHeight = canvas.height;

            // Apply scaling if max dimensions are specified
            if (maxWidth && targetWidth > maxWidth) {
                const scale = maxWidth / targetWidth;
                targetWidth = maxWidth;
                targetHeight = Math.floor(targetHeight * scale);
            }

            if (maxHeight && targetHeight > maxHeight) {
                const scale = maxHeight / targetHeight;
                targetHeight = maxHeight;
                targetWidth = Math.floor(targetWidth * scale);
            }

            screenshotCanvas.width = targetWidth;
            screenshotCanvas.height = targetHeight;

            // Draw the game canvas to the screenshot canvas
            ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

            // Convert to blob
            return new Promise((resolve) => {
                screenshotCanvas.toBlob((blob) => {
                    if (blob) {
                        this.logger?.('Screenshot captured successfully', LogLevel.INFO);
                        resolve(blob);
                    } else {
                        this.logger?.('Failed to create screenshot blob', LogLevel.ERROR);
                        resolve(null);
                    }
                }, format, quality);
            });

        } catch (error) {
            this.logger?.(`Error capturing screenshot: ${error.message}`, LogLevel.ERROR);
            return null;
        }
    }

    // Alternative method for WebGL contexts that don't preserve drawing buffer
    async captureScreenshotWebGL(gl, canvas, options = {}) {
        try {
            const { format = 'image/jpeg', quality = 0.8 } = options;

            // Read pixels from WebGL context
            const pixels = new Uint8Array(canvas.width * canvas.height * 4);
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // Create a new canvas to flip the image (WebGL reads bottom-to-top)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');

            // Create ImageData and flip vertically
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const srcIndex = (y * canvas.width + x) * 4;
                    const dstIndex = ((canvas.height - 1 - y) * canvas.width + x) * 4;
                    imageData.data[dstIndex] = pixels[srcIndex];     // R
                    imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
                    imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
                    imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
                }
            }

            ctx.putImageData(imageData, 0, 0);

            return new Promise((resolve) => {
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        this.logger?.('WebGL screenshot captured successfully', LogLevel.INFO);
                        resolve(blob);
                    } else {
                        this.logger?.('Failed to create WebGL screenshot blob', LogLevel.ERROR);
                        resolve(null);
                    }
                }, format, quality);
            });

        } catch (error) {
            this.logger?.(`Error capturing WebGL screenshot: ${error.message}`, LogLevel.ERROR);
            return null;
        }
    }
}