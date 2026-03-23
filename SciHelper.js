(function() {
    // Wait for body to be ready
    if (!document.body || document.getElementById('sci-mainpanel')) return;

    var greekMode = false, mathMode = false, upperMode = false, lowerMode = false, chemMode = false;
    var chemWindow = null;

    // --- UI Construction ---
    var panel = document.createElement('div');
    panel.setAttribute('id', 'sci-mainpanel');
    
    var header = document.createElement('div');
    header.setAttribute('id', 'sci-mainpanel-header');
    header.appendChild(document.createTextNode('SciHelper'));

    var btnContainer = document.createElement('div');
    btnContainer.setAttribute('id', 'sci-mainpanel-btncontainer');

    var outputBox = document.createElement('input');
    outputBox.setAttribute('type', 'text');
    outputBox.setAttribute('id', 'sci-mainpanel-output');
    outputBox.setAttribute('placeholder', 'Type symbols...');

    function createToggle(label, symbol, id, color) {
        var btn = document.createElement('button');
        btn.setAttribute('class', 'sci-mainpanel-btn');
        btn.style.backgroundColor = '#f9f9f9';

        var labelSpan = document.createElement('span');
        labelSpan.appendChild(document.createTextNode(label));
        
        var symbolSpan = document.createElement('span');
        symbolSpan.setAttribute('class', 'sci-mainpanel-btnsymbol');
        symbolSpan.style.color = color;
        symbolSpan.appendChild(document.createTextNode(symbol));

        btn.appendChild(labelSpan);
        btn.appendChild(symbolSpan);
        
        btn.addEventListener('click', function() {
            upperMode = (id === 'upper') ? !upperMode : false;
            lowerMode = (id === 'lower') ? !lowerMode : false;
            greekMode = (id === 'greek') ? !greekMode : false;
            mathMode  = (id === 'math')  ? !mathMode  : false;
            chemMode  = (id === 'chem')  ? !chemMode  : false;

            var allBtns = btnContainer.getElementsByTagName('button');
            for (var i = 0; i < allBtns.length; i++) {
                allBtns[i].style.backgroundColor = '#f9f9f9';
                allBtns[i].style.color = 'black';
            }

            if (upperMode || lowerMode || greekMode || mathMode || chemMode) {
                btn.style.backgroundColor = color;
                btn.style.color = 'white';
            }

            if (chemMode) {
                openChemWindow();
            } else if (chemWindow) {
                chemWindow.remove();
                chemWindow = null;
            }
            outputBox.focus();
        });
        return btn;
    }
// Append buttons with lower-saturation (pastel) colors
    btnContainer.appendChild(createToggle('Suprscript', 'xⁿ', 'upper', '#e57373'));
    btnContainer.appendChild(createToggle('Subscript', 'xₙ', 'lower', '#ffb74d'));
    btnContainer.appendChild(createToggle('Greek', 'αbγ', 'greek', '#81c784')); 
    btnContainer.appendChild(createToggle('Math', '+-×÷', 'math', '#64b5f6')); 
    btnContainer.appendChild(createToggle('Chem', 'H₂O', 'chem', '#83c1bb')); 

    var copyBtn = document.createElement('button');
    copyBtn.setAttribute('id', 'sci-mainpanel-copybtn');
    copyBtn.appendChild(document.createTextNode('COPY'));

    copyBtn.addEventListener('click', function() {
        if (!outputBox.value) return;
        navigator.clipboard.writeText(outputBox.value).then(() => {
            var originalText = copyBtn.firstChild.nodeValue;
            copyBtn.firstChild.nodeValue = 'Copied!';
            setTimeout(() => { copyBtn.firstChild.nodeValue = originalText; }, 1000);
        });
    });

    panel.appendChild(header);
    panel.appendChild(btnContainer);
    panel.appendChild(outputBox);
    panel.appendChild(copyBtn);
    document.body.appendChild(panel);

    // --- Secondary Chemistry Window ---
    function openChemWindow() {
        if (document.getElementById('sci-chempanel')) return;
        
        chemWindow = document.createElement('div');
        chemWindow.setAttribute('id', 'sci-chempanel');
        
        var chemHeader = document.createElement('div');
        chemHeader.setAttribute('id', 'sci-chempanel-header');
        chemHeader.appendChild(document.createTextNode('Chemistry Toolbox'));
        
        chemWindow.appendChild(chemHeader);
        document.body.appendChild(chemWindow);
        makeDraggable(chemHeader, chemWindow);
    }

    // --- Drag Logic ---
    function makeDraggable(handle, target) {
        handle.addEventListener('mousedown', function(e) {
            var rect = target.getBoundingClientRect();
            var shiftX = e.clientX - rect.left;
            var shiftY = e.clientY - rect.top;
            function move(e) {
                target.style.left = e.clientX - shiftX + 'px';
                target.style.top = e.clientY - shiftY + 'px';
                target.style.right = 'auto';
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', move);
            }, { once: true });
        });
    }

    makeDraggable(header, panel);

    // --- Keydown Logic ---
    function insertIntoWindow(text) {
        if (!text) return;
        var start = outputBox.selectionStart || outputBox.value.length;
        var end = outputBox.selectionEnd || outputBox.value.length;
        outputBox.value = outputBox.value.slice(0, start) + text + outputBox.value.slice(end);
        outputBox.selectionStart = outputBox.selectionEnd = start + text.length;
        outputBox.focus();
    }

    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.altKey) {
            if (e.code === "KeyD") { insertIntoWindow(window.degree); e.preventDefault(); return; }
            if (e.code === "KeyE") { insertIntoWindow(window.equilibium); e.preventDefault(); return; }
        }
        
        if ((e.ctrlKey || e.altKey || e.shiftKey) === false) {
            var symbol = null;
            var key = e.key;
            if (upperMode && window.superscripts) symbol = window.superscripts[key] || (e.code.startsWith("Digit") ? window.superscripts[e.code.replace("Digit", "")] : null);
            else if (lowerMode && window.subscripts) symbol = window.subscripts[key] || (e.code.startsWith("Digit") ? window.subscripts[e.code.replace("Digit", "")] : null);
            else if (greekMode && window.greek) symbol = window.greek[key.toLowerCase()];
            else if (mathMode && window.math) symbol = window.math[key.toLowerCase()];
                
            if (symbol) {
                e.preventDefault();
                insertIntoWindow(symbol);
            }
        }
    }, true);
})();