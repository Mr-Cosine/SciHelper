(function() {
    if (document.getElementById('sci-helper-panel')) return;

    var greekMode = false;
    var mathMode  = false;
    var upperMode = false;
    var lowerMode = false;

    // --- 1. UI Creation ---
    var panel = document.createElement('div');
    panel.id = 'sci-helper-panel';
    var header = document.createElement('div');
    header.id = 'sci-header';
    header.textContent = 'SciHelper';
    var outputBox = document.createElement('input');
    outputBox.type = 'text';
    outputBox.id = 'sci-output';
    outputBox.placeholder = 'Type symbols...';
    panel.appendChild(header);
    panel.appendChild(outputBox);
    document.body.appendChild(panel);

    var style = document.createElement('style');
    style.textContent = `
        #sci-helper-panel { position: fixed; top: 100px; right: 20px; width: 220px; background: white; border: 2px solid #1a73e8; border-radius: 4px; z-index: 2147483647; padding: 10px; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
        #sci-header { font-weight: bold; cursor: move; margin-bottom: 5px; color: #1a73e8; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        #sci-output { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    function insertIntoWindow(text) {
        const start = outputBox.selectionStart || outputBox.value.length;
        const end = outputBox.selectionEnd || outputBox.value.length;
        
        outputBox.value = outputBox.value.slice(0, start) + text + outputBox.value.slice(end);
        outputBox.selectionStart = outputBox.selectionEnd = start + text.length;
        outputBox.focus();
    }

    // --- 2. Input Logic ---
    document.addEventListener("keydown", (e) => {
        // 1. DIRECT SHORTCUTS (Highest Priority)
        // Only trigger these if NO modes are being held down
        if (e.altKey && e.shiftKey && !upperMode && !lowerMode && !greekMode && !mathMode) {
            if (e.code === "KeyD" || e.code === "KeyG") { 
                insertIntoWindow(degree); 
                e.preventDefault(); e.stopImmediatePropagation(); return; 
            }
            if (e.code === "KeyE") { 
                insertIntoWindow(equilibium); 
                e.preventDefault(); e.stopImmediatePropagation(); return; 
            }
        }

        // 2. MODE ACTIVATION (Toggles)
        if (e.altKey && e.shiftKey) {
            if (e.key === "ArrowUp") { upperMode = true; e.preventDefault(); return; }
            if (e.key === "ArrowDown") { lowerMode = true; e.preventDefault(); return; }
            if (e.code === "KeyZ") { greekMode = true; e.preventDefault(); return; }
            if (e.code === "KeyM") { mathMode = true; e.preventDefault(); return; }
        }

        // 3. SYMBOL INSERTION
        let symbol = null;
        const key = e.key; // Use raw key to catch numbers correctly

        if (upperMode) {
            symbol = superscripts[key] || superscripts[key.toLowerCase()];
        } else if (lowerMode) {
            symbol = subscripts[key] || subscripts[key.toLowerCase()];
        } else if (greekMode) {
            symbol = greek[key] || greek[key.toLowerCase()];
        } else if (mathMode) {
            symbol = math[key] || math[key.toLowerCase()];
        }

        if (symbol) {
            e.preventDefault();
            e.stopImmediatePropagation();
            insertIntoWindow(symbol);
        }
    }, true);

    // --- 3. Keyup Release ---
    document.addEventListener("keyup", function(e) {
        if (e.code === "KeyZ") greekMode = false;
        if (e.code === "KeyM") mathMode = false;
        if (e.key === "ArrowUp") upperMode = false;
        if (e.key === "ArrowDown") lowerMode = false;
    });

    // --- 4. Draggable ---
    header.onmousedown = function(e) {
        var shiftX = e.clientX - panel.getBoundingClientRect().left;
        var shiftY = e.clientY - panel.getBoundingClientRect().top;
        document.onmousemove = function(e) {
            panel.style.left = e.clientX - shiftX + 'px';
            panel.style.top = e.clientY - shiftY + 'px';
        };
        document.onmouseup = function() { document.onmousemove = null; };
    };
})();