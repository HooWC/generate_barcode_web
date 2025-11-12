document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const barcodeContainer = document.getElementById('barcodeContainer');
    const downloadPNG = document.getElementById('downloadPNG');
    const printBtn = document.getElementById('printBtn');
    
    let barcodeData = []; // Store barcode data
    
    // Check if JsBarcode is loaded
    if (typeof JsBarcode === 'undefined') {
        console.error('JsBarcode library not loaded!');
        alert('条形码库未加载，请刷新页面重试！');
    }
    
    // Generate barcodes
    generateBtn.addEventListener('click', function() {
        barcodeData = [];
        
        // Collect all barcode inputs
        for (let i = 1; i <= 3; i++) {
            const chassisNo = document.getElementById(`chassisNo${i}`).value.trim();
            const engineNo = document.getElementById(`engineNo${i}`).value.trim();
            
            if (chassisNo && engineNo) {
                barcodeData.push({
                    chassisNo: chassisNo,
                    engineNo: engineNo,
                    index: i
                });
            }
        }
        
        if (barcodeData.length === 0) {
            alert('请至少输入一组完整的Chassis No和Engine No！');
            return;
        }
        
        // Clear previous barcodes
        barcodeContainer.innerHTML = '';
        
        // Generate barcodes
        try {
            barcodeData.forEach((data, idx) => {
                
                const barcodeItem = document.createElement('div');
                barcodeItem.className = 'barcode-item';
                
                // Create canvas instead of SVG for better compatibility
                const barcodeCanvas = document.createElement('canvas');
                barcodeCanvas.className = 'barcode-svg';
                barcodeCanvas.id = `barcode${data.index}`;
                
                const infoDisplay = document.createElement('div');
                infoDisplay.className = 'info-display';
                infoDisplay.id = `previewText${data.index}`;
                
                // First append elements to DOM
                barcodeItem.appendChild(barcodeCanvas);
                barcodeItem.appendChild(infoDisplay);
                barcodeContainer.appendChild(barcodeItem);
                
                // Generate barcode with chassis number
                try {
                    JsBarcode(barcodeCanvas, data.chassisNo, {
                        format: "CODE128",
                        lineColor: "#000",
                        width: 2,
                        height: 80,
                        displayValue: false,
                        margin: 5
                    });
                    
                    infoDisplay.innerHTML = `
                        <div style="font-size: 1.4rem; font-weight: bold;">${data.chassisNo}</div>
                        <div style="margin-top: 3px; font-size: 1.4rem; font-weight: bold;">${data.engineNo}</div>
                    `;
                } catch (err) {
                    console.error('Error generating barcode for', data.chassisNo, err);
                    alert('生成条形码时出错: ' + err.message);
                    barcodeItem.innerHTML = `<p style="color: red;">错误: ${err.message}</p>`;
                }
            });
            
            // Enable download buttons
            downloadPNG.disabled = false;
            printBtn.disabled = false;
        } catch (error) {
            alert('生成条形码时出错，请检查输入。');
            console.error('Generation error:', error);
        }
    });
    
    // Download PNG image
    downloadPNG.addEventListener('click', function() {
        if (barcodeData.length === 0) {
            alert('请先生成条形码！');
            return;
        }
        
        // Create one large canvas for A4 size with all barcodes
        const outputCanvas = document.createElement('canvas');
        const ctx = outputCanvas.getContext('2d');
        outputCanvas.width = 1240; // A4 width at 150 DPI
        outputCanvas.height = 1754; // A4 height at 150 DPI
        
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        
        const centerX = outputCanvas.width / 2;
        const barcodeWidth = outputCanvas.width * 0.85;
        const barcodeHeight = 320;
        
        // Calculate spacing for multiple barcodes
        const totalHeight = outputCanvas.height - 100; // Leave smaller margin
        const spacingPerBarcode = totalHeight / barcodeData.length;
        
        // Draw each barcode
        barcodeData.forEach((data, idx) => {
            const barcodeCanvas = document.getElementById(`barcode${data.index}`);
            if (!barcodeCanvas) {
                console.error('Barcode canvas not found for index', data.index);
                return;
            }
            
            const barcodeX = (outputCanvas.width - barcodeWidth) / 2;
            const barcodeY = 50 + (idx * spacingPerBarcode);
            
            // Draw barcode (larger)
            ctx.drawImage(barcodeCanvas, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
            
            // Add chassis number below barcode (very close)
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.chassisNo, centerX, barcodeY + barcodeHeight + 20);
            
            // Add engine number below chassis number (very close)
            ctx.font = 'bold 42px Arial';
            ctx.fillText(data.engineNo, centerX, barcodeY + barcodeHeight + 55);
        });
        
        // Create download link
        const pngFile = outputCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `hsa_barcodes_${barcodeData.length}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    });
    
    // Print barcode
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Allow Enter key to generate barcode from any input
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`chassisNo${i}`).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateBtn.click();
            }
        });
        
        document.getElementById(`engineNo${i}`).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateBtn.click();
            }
        });
    }
});