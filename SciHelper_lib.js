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