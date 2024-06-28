document.getElementById('imageInput').addEventListener('change', handleImageUpload);

let asciiArt = []; // Store ASCII art data

function handleImageUpload(event) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const asciiCanvas = document.getElementById('asciiCanvas');
    const asciiCtx = asciiCanvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            asciiCanvas.width = img.width;
            asciiCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            drawGrid(ctx, img.width, img.height);
            convertToAscii(ctx, asciiCtx, img.width, img.height);
        }
        img.src = event.target.result;
    }

    reader.readAsDataURL(file);
}

function drawGrid(ctx, width, height, gridSize = 5) { // Reduce grid size for more detail
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function convertToAscii(ctx, asciiCtx, width, height, gridSize = 5) { // Reduce grid size for more detail
    const characters = " .,:;i1tfLCG08@"; // Expanded character set for more detail
    const tolerance = 240; // Define tolerance for white color detection
    asciiArt = []; // Reset ASCII art data

    for (let y = 0; y < height; y += gridSize) {
        let line = "";
        for (let x = 0; x < width; x += gridSize) {
            const imageData = ctx.getImageData(x, y, gridSize, gridSize);
            const averageColor = getAverageColor(imageData.data);
            if (averageColor < tolerance) { // Only draw characters if the block is not white
                const character = getCharacterFromGrayScale(averageColor, characters);
                asciiCtx.fillStyle = 'black';
                asciiCtx.font = `${gridSize}px monospace`;
                asciiCtx.fillText(character, x, y + gridSize);
                line += character;
            } else {
                line += " "; // Add space for white background
            }
        }
        asciiArt.push(line); // Store each line of ASCII art
    }
}

function getAverageColor(data) {
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    r = Math.floor(r / (data.length / 4));
    g = Math.floor(g / (data.length / 4));
    b = Math.floor(b / (data.length / 4));
    return (r + g + b) / 3;  // Return average gray scale value
}

function getCharacterFromGrayScale(gray, characters) {
    const index = Math.floor(gray / 255 * (characters.length - 1));
    return characters[index];
}

function removeBackground() {
    const asciiCanvas = document.getElementById('asciiCanvas');
    const asciiCtx = asciiCanvas.getContext('2d');
    const gridSize = 5; // Ensure this matches the grid size used in convertToAscii

    asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height); // Clear the canvas

    // Redraw ASCII art without background characters
    for (let y = 0; y < asciiArt.length; y++) {
        for (let x = 0; x < asciiArt[y].length; x++) {
            const character = asciiArt[y][x];
            if (character !== " ") { // Only redraw non-space characters
                asciiCtx.fillStyle = 'black';
                asciiCtx.font = `${gridSize}px monospace`;
                asciiCtx.fillText(character, x * gridSize, y * gridSize + gridSize);
            }
        }
    }
}
