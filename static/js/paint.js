document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const pencilTool = document.getElementById('pencilTool');
    const eraserTool = document.getElementById('eraserTool');
    const clearCanvas = document.getElementById('clearCanvas');

    let isDrawing = false;
    let currentTool = 'pencil';

    // Set canvas size
    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
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
        } else if (currentTool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Tool selection
    pencilTool.addEventListener('click', () => {
        currentTool = 'pencil';
        pencilTool.classList.add('active');
        eraserTool.classList.remove('active');
    });

    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        eraserTool.classList.add('active');
        pencilTool.classList.remove('active');
    });

    // Clear canvas
    clearCanvas.addEventListener('click', () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
});
