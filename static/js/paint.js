console.log('Paint.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const pencilTool = document.getElementById('pencilTool');
    const eraserTool = document.getElementById('eraserTool');
    const rectangleTool = document.getElementById('rectangleTool');
    const circleTool = document.getElementById('circleTool');
    const textTool = document.getElementById('textTool');
    const fillBucketTool = document.getElementById('fillBucketTool');
    const clearCanvas = document.getElementById('clearCanvas');

    console.log('All tools initialized:', {pencilTool, eraserTool, rectangleTool, circleTool, textTool, fillBucketTool});

    let isDrawing = false;
    let currentTool = 'pencil';
    let startX, startY;

    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        draw(e);
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            if (['rectangle', 'circle'].includes(currentTool)) {
                const rect = canvas.getBoundingClientRect();
                const endX = event.clientX - rect.left;
                const endY = event.clientY - rect.top;
                drawShape(startX, startY, endX, endY);
            }
        }
        ctx.beginPath();
    }

    function draw(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';

        if (currentTool === 'pencil') {
            ctx.strokeStyle = colorPicker.value;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (currentTool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (['rectangle', 'circle'].includes(currentTool)) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
            drawShape(startX, startY, x, y);
        }
    }

    function drawShape(startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.strokeStyle = colorPicker.value;
        if (currentTool === 'rectangle') {
            ctx.rect(startX, startY, endX - startX, endY - startY);
        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        }
        ctx.stroke();
    }

    function addText(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `${brushSize.value}px Arial`;
            ctx.fillStyle = colorPicker.value;
            ctx.fillText(text, x, y);
        }
    }

    function fillBucket(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, x, y);
        const fillColor = hexToRgb(colorPicker.value);

        floodFill(imageData, x, y, targetColor, fillColor);
        ctx.putImageData(imageData, 0, 0);
    }

    function getPixelColor(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 255
        } : null;
    }

    function floodFill(imageData, x, y, targetColor, fillColor) {
        const pixelStack = [[x, y]];
        const width = imageData.width;
        const height = imageData.height;
        const pixelPos = (y * width + x) * 4;
        const startR = targetColor.r;
        const startG = targetColor.g;
        const startB = targetColor.b;

        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) {
            return;
        }

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const x = newPos[0];
            let y = newPos[1];
            let pixelPos = (y * width + x) * 4;

            while (y-- >= 0 && matchStartColor(pixelPos)) {
                pixelPos -= width * 4;
            }
            pixelPos += width * 4;
            ++y;

            let reachLeft = false;
            let reachRight = false;

            while (y++ < height - 1 && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);

                if (x > 0) {
                    if (matchStartColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < width - 1) {
                    if (matchStartColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelPos += width * 4;
            }
        }

        function matchStartColor(pixelPos) {
            return (
                imageData.data[pixelPos] === startR &&
                imageData.data[pixelPos + 1] === startG &&
                imageData.data[pixelPos + 2] === startB
            );
        }

        function colorPixel(pixelPos) {
            imageData.data[pixelPos] = fillColor.r;
            imageData.data[pixelPos + 1] = fillColor.g;
            imageData.data[pixelPos + 2] = fillColor.b;
            imageData.data[pixelPos + 3] = fillColor.a;
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);

    pencilTool.addEventListener('click', () => setTool('pencil'));
    eraserTool.addEventListener('click', () => setTool('eraser'));
    rectangleTool.addEventListener('click', () => setTool('rectangle'));
    circleTool.addEventListener('click', () => setTool('circle'));
    textTool.addEventListener('click', () => setTool('text'));
    fillBucketTool.addEventListener('click', () => setTool('fillBucket'));

    function setTool(tool) {
        currentTool = tool;
        [pencilTool, eraserTool, rectangleTool, circleTool, textTool, fillBucketTool].forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tool}Tool`).classList.add('active');

        if (tool === 'text') {
            canvas.addEventListener('click', addText);
        } else {
            canvas.removeEventListener('click', addText);
        }

        if (tool === 'fillBucket') {
            canvas.addEventListener('click', fillBucket);
        } else {
            canvas.removeEventListener('click', fillBucket);
        }
    }

    clearCanvas.addEventListener('click', () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
});