// --- Put on textbox ---
function insertIntoWindow(target, text) {
    if (!text || !target) return;
    var start = target.selectionStart || target.value.length;
    var end = target.selectionEnd || target.value.length;
    target.value = target.value.slice(0, start) + text + target.value.slice(end);
    target.selectionStart = target.selectionEnd = start + text.length;
    target.focus;
}


// --- Drag logic ---
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
        document.addEventListener('mouseup', () => 
        document.removeEventListener('mousemove', move), { once: true }
        );
    });
}

// --- Mode toggle buttons ---
function createToggle(label, symbol, id, color, state, callbacks) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-mainpanel-btn');
    btn.style.backgroundColor = '#f9f9f9';
    btn.id = id;
    btn.color = color;

    var labelSpan = document.createElement('span');
    labelSpan.appendChild(document.createTextNode(label));
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-mainpanel-btnsymbol');
    symbolSpan.style.color = color;
    symbolSpan.appendChild(document.createTextNode(symbol));

    btn.appendChild(labelSpan);
    btn.appendChild(symbolSpan);

    btn.addEventListener('click', function() {
        if (id === 'chem') {
            state.chemMode = !state.chemMode;
        } 
        else {
            state.upperMode = (id === 'upper') ? !state.upperMode : false;
            state.lowerMode = (id === 'lower') ? !state.lowerMode : false;
            state.greekMode = (id === 'greek') ? !state.greekMode : false;
            state.mathMode  = (id === 'math')  ? !state.mathMode  : false;
        }

        if (callbacks && typeof callbacks.onUpdate === 'function') {
            callbacks.onUpdate(id);
        }
    });

    return btn;
}

function createCopyBtn(target) {
    var copyBtn = document.createElement('button');
    copyBtn.setAttribute('id', 'sci-mainpanel-copybtn');
    copyBtn.textContent = 'COPY'; // Cleaner than appendChild(createTextNode)

    copyBtn.addEventListener('click', function() {
        if (!target) return;

        var textToCopy = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') 
                         ? target.value 
                         : target.textContent;

        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            var originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            
            setTimeout(() => { 
                copyBtn.textContent = originalText; 
            }, 1000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    });

    return copyBtn;
}

function openInfo(parentpanel) {
    if (document.getElementById('sci-info-menu')) return;

    // 1. Get the reference to the info button to dock against
    var infoBtn = document.getElementById('sci-mainpanel-info');
    var rect = infoBtn.getBoundingClientRect();

    // 2. Create Slim Menu Window
    var menuWin = document.createElement('div');
    menuWin.id = 'sci-info-menu';
    menuWin.style.cssText = `
        position: fixed; 
        width: 120px; 
        background: #fff; 
        border: 1px solid #000;
        z-index: 2147483647; 
        box-shadow: 2px 2px 0px #ccc;
        left: ${rect.right + 2}px; 
        top: ${rect.top}px;
    `;

    // 3. Header
    var header = document.createElement('div');
    header.textContent = 'MAPPING';
    header.style.cssText = 'background:#000; color:#fff; padding:3px 6px; font-size:10px; font-weight:bold; cursor:default;';
    
    var btnList = document.createElement('div');
    btnList.style.display = 'flex';
    btnList.style.flexDirection = 'column';

    function createMenuBtn(label, data) {
        var btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = 'padding:6px; background:#fff; border:none; border-bottom:1px solid #eee; cursor:pointer; text-align:left; font-size:10px;';
        
        btn.onclick = () => {
            // Re-calculate rect in case the main panel moved while menu was open
            var freshRect = infoBtn.getBoundingClientRect();
            renderContentWindow(label, data, freshRect.right + 2, freshRect.top, parentpanel); 
            menuWin.remove();
        };
        
        btn.onmouseover = () => btn.style.background = '#f0f0f0';
        btn.onmouseout = () => btn.style.background = '#fff';
        
        return btn;
    }

    // Populate using your global objects
    btnList.appendChild(createMenuBtn('MATH', Object.entries(window.math || {})));
    btnList.appendChild(createMenuBtn('GREEK', Object.entries(window.greek || {})));
    btnList.appendChild(createMenuBtn('SUP/SUB', Object.entries(window.superscripts || {}).concat(Object.entries(window.subscripts || {}))));
    btnList.appendChild(createMenuBtn('SPECIAL', [['Deg', window.degree || '°'], ['Eq', window.equilibrium || '⇌']]));

    menuWin.append(header, btnList);
    document.body.appendChild(menuWin);
}

function renderContentWindow(title, mapping, x, y, parentpanel) {
    if (document.getElementById('sci-content-page')) {
        document.getElementById('sci-content-page').remove();
    }

    var contentWin = document.createElement('div');
    contentWin.id = 'sci-content-page';
    contentWin.style.cssText = `
        position: fixed; 
        width: 120px; 
        background: #fff; 
        border: 1px solid #000;
        z-index: 2147483646; 
        left: ${x}px; 
        top: ${y}px;
        display: flex; 
        flex-direction: column;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    `;

    // Header with Close Button
    var header = document.createElement('div');
    header.style.cssText = 'background:#000; color:#fff; padding:4px 6px; display:flex; justify-content:space-between; align-items:center; cursor:move;';
    
    var titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.style.fontSize = '9px';
    titleSpan.style.fontWeight = 'bold';

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'background:none; color:#fff; border:none; cursor:pointer; font-weight:bold; padding:0 2px;';
    closeBtn.onclick = () => {contentWin.remove(); openInfo(parentpanel);};

    header.append(titleSpan, closeBtn);

    // Scrollable Display Area
    var displayArea = document.createElement('div');
    displayArea.style.cssText = 'height:300px; overflow-y:auto; font-family: monospace; background:#fff; padding-left: 10px; padding-right: 20px';

    mapping.forEach(([key, val]) => {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex; padding:5px; border-bottom:1px solid #f0f0f0; cursor:pointer; align-items:center;';
        row.innerHTML = `<div style="flex:1; color:#888; font-size:14px;">${key}    →</div>
                         <div style="flex:1; text-align:right; font-weight:bold; font-size:14px; color:#000;">${val}</div>`;
        
        row.onclick = () => {
            // Using your existing outputLoc reference
            if (typeof insertIntoWindow === 'function' && outputLoc) {
                insertIntoWindow(outputLoc, val);
            }
        };

        row.onmouseover = () => row.style.background = '#f9f9f9';
        row.onmouseout = () => row.style.background = '#fff';
        
        displayArea.appendChild(row);
    });

    contentWin.append(header, displayArea);
    
    // CRITICAL: Append to body first
    document.body.appendChild(contentWin);

    // Now initialize draggable on the header
    if (typeof makeDraggable === 'function') {
        makeDraggable(header, contentWin);
    }
}

function closeInfo() {
    while(document.getElementById('sci-content-page')) {
        document.getElementById('sci-content-page').remove();
    }
    while(document.getElementById('sci-info-menu')){
        document.getElementById('sci-info-menu').remove();
    }
}