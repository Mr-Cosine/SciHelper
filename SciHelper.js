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
        btn.id = id;

        var labelSpan = document.createElement('span');
        labelSpan.appendChild(document.createTextNode(label));
        
        var symbolSpan = document.createElement('span');
        symbolSpan.setAttribute('class', 'sci-mainpanel-btnsymbol');
        symbolSpan.style.color = color;
        symbolSpan.appendChild(document.createTextNode(symbol));

        btn.appendChild(labelSpan);
        btn.appendChild(symbolSpan);
        
        btn.addEventListener('click', function() {
            //Update modes
            if (id !== 'chem') {
                upperMode = (id === 'upper') ? !upperMode : false;
                lowerMode = (id === 'lower') ? !lowerMode : false;
                greekMode = (id === 'greek') ? !greekMode : false;
                mathMode  = (id === 'math')  ? !mathMode  : false;
            } else {
                chemMode = !chemMode;
            }

            // Update button looking
            var allBtns = btnContainer.getElementsByTagName('button');
            for (const thisBtn of allBtns) {
                thisBtn.style.backgroundColor = '#f9f9f9';
                thisBtn.style.color = 'black';
            }

            function highlight(targetId, targetColor) {
                var targetBtn = document.getElementById(targetId);
                if (targetBtn) {
                    targetBtn.style.backgroundColor = targetColor;
                    targetBtn.style.color = 'white';
                }
            }

            if (upperMode) highlight('upper', '#e57373');
            if (lowerMode) highlight('lower', '#ffb74d');
            if (greekMode) highlight('greek', '#81c784');
            if (mathMode)  highlight('math',  '#64b5f6');
            if (chemMode)  highlight('chem',  '#83c1bb');

            //Open chemistry panel for chem button
            if (chemMode) {
                openChemWindow();
            } 
            else if (chemWindow) {
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
        
        // Create the Window
        chemWindow = document.createElement('div');
        chemWindow.setAttribute('id', 'sci-chempanel');
        
        // Create the Header
        var chemHeader = document.createElement('div');
        chemHeader.setAttribute('id', 'sci-chempanel-header');
        chemHeader.appendChild(document.createTextNode('Chemistry Toolbox'));

        // Create the Content Container
        var chemContent = document.createElement('div');
        chemContent.setAttribute('id', 'sci-chempanel-content');

        // Search Input
        var searchBox = document.createElement('input');
        searchBox.setAttribute('placeholder', 'Search element...');
        searchBox.style.width = "100%";
        searchBox.style.marginBottom = "10px";

        // Search Results
        var resultsArea = document.createElement('div');
        resultsArea.setAttribute('id', 'sci-chempanel-results');

        // --- Search Logic ---
        searchBox.addEventListener('input', function() {
            var query = searchBox.value.toLowerCase();
            while(resultsArea.firstChild) { resultsArea.removeChild(resultsArea.firstChild); }

            if (!query) return;

            var found = elements.filter(el => 
                el.name.toLowerCase().includes(query) || 
                el.symbol.toLowerCase().includes(query)
            );

            found.forEach(element => {
                var row = document.createElement('div');
                row.setAttribute('class', 'sci-chempanel-elem-row');
                
                row.onclick = function() {
                    insertIntoWindow(element.symbol);
                };

                var symbol = document.createElement("div");
                symbol.classList.add('sci-chempanel-elem-row-symbol');
                symbol.textContent = element.atomicNumber + '\t' + element.symbol;
                
                var info = document.createElement("div");
                info.classList.add('sci-chempanel-elem-row-name');
                info.textContent = element.name + '\t(' + element.molarMass + ' u)';

                row.appendChild(symbol);
                row.appendChild(info);
                resultsArea.appendChild(row);
            });
        });

        // --- Assembly ---
        chemContent.appendChild(searchBox);
        chemContent.appendChild(resultsArea);
        chemWindow.appendChild(chemHeader);
        chemWindow.appendChild(chemContent);
        document.body.appendChild(chemWindow);

        // Make it draggable using the header
        makeDraggable(chemHeader, chemWindow);
        
        // Auto-focus the search box when it opens
        searchBox.focus();
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
        
        if ((e.ctrlKey || e.altKey) === false) {
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