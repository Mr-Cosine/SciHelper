(function() {

    var state = {
        greekMode: false,
        upperMode: false,
        lowerMode: false,
        mathMode: false,
        chemMode: false,
        physMode: false,
        info: false
    };

    var outputLoc = null;

    if (document.getElementById('sci-restore-btn')) {document.getElementById('sci-restore-btn').remove();}

    function initSciHelper(initx = 100, inity = 100) {    
        // Wait for body to be ready
        if (!document.body || document.getElementById('sci-mainpanel')) return;

        state.greekMode = false;
        state.chemMode = false;
        state.upperMode = false;
        state.lowerMode = false;
        state.mathMode = false;
        state.info = false;
        state.chemWindow = null;
        
        // --- UI Construction ---
        var panel = document.createElement('div');
        panel.setAttribute('id', 'sci-mainpanel');
        panel.style.left = initx + 'px';
        panel.style.top = inity + 'px';

        var headerContainer = document.createElement('div');
        headerContainer.setAttribute('id', 'sci-mainpanel-headerContainer');
        
        var header = document.createElement('div');
        header.setAttribute('id', 'sci-mainpanel-header');
        header.textContent = 'Sci-Helper';
        header.classList.add('no-select');
        
        var closeBtn = document.createElement('button')
        closeBtn.setAttribute('id', 'sci-mainpanel-closeBtn');
        closeBtn.textContent = "×";
        closeBtn.classList.add('no-select');

        closeBtn.addEventListener('click', function() {
            state.chemWindow = closeChemWindow();
            closeInfo();
            restoreBtn.style.display = 'flex';

            //Record current location for restoration
            var rect = document.getElementById('sci-mainpanel').getBoundingClientRect();
            restoreBtn.rcdx = rect.left;
            restoreBtn.rcdy = rect.top;

            panel.remove();
        });

        var btnContainer = document.createElement('div');
        btnContainer.setAttribute('id', 'sci-mainpanel-btncontainer');

        var outputBox = document.createElement('textarea');
        outputBox.setAttribute('id', 'sci-mainpanel-output');
        outputBox.setAttribute('placeholder', 'Type symbols...');
        outputLoc = outputBox;

        var infoBtn = document.createElement('div');
        infoBtn.setAttribute('id', 'sci-mainpanel-info');
        infoBtn.textContent = "🛈";
        infoBtn.classList.add('no-select');

        infoBtn.addEventListener('click', function () {
            if (state.info) {
                closeInfo();
                state.info = false;
            } 
            else {
                openInfo(outputLoc, panel);
                state.info = true;
            }
        });

        btnContainer.appendChild(createToggle('Suprscript', 'Xⁿ', 'upper', '#e57373', state));
        btnContainer.appendChild(createToggle('Subscript', 'Xₙ', 'lower', '#ffb74d', state));
        btnContainer.appendChild(createToggle('Greek', 'αbγ', 'greek', '#81c784', state)); 
        btnContainer.appendChild(createToggle('Math', '+-×÷', 'math', '#64b5f6', state)); 
        btnContainer.appendChild(createSubMenuToggle('Chemistry', 'H₂O', 'chem', '#83c1bb', state, outputLoc, panel)); 
        btnContainer.appendChild(createSubMenuToggle('Physics', 'F=ma', 'phys', '#ba68c8', state, outputLoc, panel));

        headerContainer.append(header, closeBtn);
        panel.append(headerContainer, btnContainer, infoBtn, outputBox, createCopyBtn(outputBox));        
        document.body.appendChild(panel);

        makeDraggable(header, panel);
    }

            // --- Keydown Logic ---
    document.addEventListener("keydown", function(e) {
        // Detect focus conflict
        if (document.activeElement.tagName === 'INPUT' && 
            document.activeElement.id !== 'sci-mainpanel-output') {
            return;
        }

        if (e.ctrlKey && e.altKey) {
            if (e.code === "KeyD") { insertIntoWindow(outputLoc, window.degree); e.preventDefault(); return; }
            if (e.code === "KeyE") { insertIntoWindow(outputLoc, window.equilibium); e.preventDefault(); return; }
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
                symbol = window.math[key];
            }
                    
            if (symbol) { e.preventDefault(); insertIntoWindow(outputLoc, symbol); }
        }
    }, true);

    var restoreBtn = document.createElement('div');
    restoreBtn.id = 'sci-restore-btn';
    restoreBtn.textContent = '⌬';
    restoreBtn.classList.add('no-select');
    this.rcdx = 100; this.rcdy = 100;

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
})();