import { superscripts, subscripts, greeks, maths, degree, equilibium } from './resources.js';
import { state, outputLoc, initSciHelper, closeSciHelper, insertIntoWindow, makeDraggable, refreshBtnDisp, createToggle, createSubMenuToggle, createCopyBtn, openInfo, closeInfo } from './SciHelper_lib.js';

initSciHelper();


// --- Keydown Logic ---
document.addEventListener("keydown", function(e) {
    // Detect focus conflict
    if (document.activeElement.tagName === 'INPUT' && 
        document.activeElement.id !== 'sci-panel-output') {
        return;
    }

    if (e.ctrlKey && e.altKey) {
        if (e.code === "KeyD") { insertIntoWindow(outputLoc, degree); e.preventDefault(); return; }
        if (e.code === "KeyE") { insertIntoWindow(outputLoc, equilibium); e.preventDefault(); return; }
    }

    if ((e.ctrlKey || e.altKey) === false) {
        var symbol = null;
        var key = e.key;

        if (state.superscript) {
            symbol = superscripts[key] || (e.code.startsWith("Digit") ? superscripts[e.code.replace("Digit", "")] : null);
        } else if (state.subscript) {
            symbol = subscripts[key] || (e.code.startsWith("Digit") ? subscripts[e.code.replace("Digit", "")] : null);
        } else if (state.greek) {
            symbol = greeks[key.toLowerCase()];
        } else if (state.math) {
            symbol = maths[key];
        }
                
        if (symbol) { e.preventDefault(); insertIntoWindow(outputLoc, symbol); }
    }
}, true);
    
if (document.getElementById('sci-restore')) {document.getElementById('sci-restore').remove();}
var restoreBtn = document.createElement('div');
restoreBtn.id = 'sci-restore';
restoreBtn.textContent = '⌬';
restoreBtn.classList.add('no-select');
restoreBtn.rcdx = 100; restoreBtn.rcdy = 100;

let startTime;
restoreBtn.addEventListener('mousedown', function() {
    startTime = Date.now(); // Record the exact start time
});

restoreBtn.addEventListener('mouseup', function() {
    let duration = Date.now() - startTime;

       if (duration < 150) { 
        initSciHelper(this.rcdx, this.rcdy);
        this.style.display = 'none';
    } 
});

makeDraggable(restoreBtn, restoreBtn);

document.body.appendChild(restoreBtn);