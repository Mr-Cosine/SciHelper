(function() {
    // Wait for body to be ready
    if (!document.body || document.getElementById('sci-mainpanel')) return;

    var state = {
            greekMode: false,
            chemMode: false,
            upperMode: false,
            lowerMode: false,
            mathMode: false,
            chemWindow: null
        };

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

    // Buttons
    var btnCallbacks = {
        onUpdate: function(clickedId) {
            // Update Colors
            var allBtns = document.querySelectorAll('.sci-mainpanel-btn');
            allBtns.forEach(b => {
                const active = state[b.id + 'Mode']; 
                b.style.backgroundColor = active ? b.color : '#f9f9f9';
                b.style.color = active ? 'white' : 'black';
            });

            // Handle Chem Window
            if (clickedId === 'chem') {
                if (state.chemMode) {
                    state.chemWindow = openChemWindow();
                } else if (state.chemWindow) {
                    state.chemWindow.remove();
                    state.chemWindow = null;
                }
            }
            outputBox.focus();
        }
    };

    btnContainer.appendChild(createToggle('Suprscript', 'xⁿ', 'upper', '#e57373', state, btnCallbacks));
    btnContainer.appendChild(createToggle('Subscript', 'xₙ', 'lower', '#ffb74d', state, btnCallbacks));
    btnContainer.appendChild(createToggle('Greek', 'αbγ', 'greek', '#81c784', state, btnCallbacks)); 
    btnContainer.appendChild(createToggle('Math', '+-×÷', 'math', '#64b5f6', state, btnCallbacks)); 
    btnContainer.appendChild(createToggle('Chem', 'H₂O', 'chem', '#83c1bb', state, btnCallbacks)); 

    panel.appendChild(header);
    panel.appendChild(btnContainer);
    panel.appendChild(outputBox);
    panel.appendChild(createCopyBtn(outputBox));
    document.body.appendChild(panel);

    makeDraggable(header, panel);

    // --- Keydown Logic ---
    document.addEventListener("keydown", function(e) {
        // Detect focus conflict
        if (document.activeElement.tagName === 'INPUT' && 
            document.activeElement.id !== 'sci-mainpanel-output') {
            return;
        }

        if (e.ctrlKey && e.altKey) {
            if (e.code === "KeyD") { insertIntoWindow(outputBox, window.degree); e.preventDefault(); return; }
            if (e.code === "KeyE") { insertIntoWindow(outputBox, window.equilibium); e.preventDefault(); return; }
        }
        
        if ((e.ctrlKey || e.altKey) === false) {
            var symbol = null;
            var key = e.key;

            if (state.upperMode && window.superscripts) {
                symbol = window.superscripts[key] || (e.code.startsWith("Digit") ? window.superscripts[e.code.replace("Digit", "")] : null);
            } else if (state.lowerMode && window.subscripts) {
                symbol = window.subscripts[key] || (e.code.startsWith("Digit") ? window.subscripts[e.code.replace("Digit", "")] : null);
            } else if (state.greekMode && window.greek) {
                symbol = window.greek[key.toLowerCase()];
            } else if (state.mathMode && window.math) {
                symbol = window.math[key.toLowerCase()];
            }
                
            if (symbol) { e.preventDefault(); insertIntoWindow(outputBox, symbol); }
        }
    }, true);
}
)();

