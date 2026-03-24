// --- Main Chemistry submenu ---
function openChemWindow(parentWin) {
    if (document.getElementById('sci-chempanel')) return;
    
    var chemWindow = document.createElement('div');
    chemWindow.setAttribute('id', 'sci-chempanel');
    
    var chemHeader = document.createElement('div');
    chemHeader.setAttribute('id', 'sci-chempanel-header');
    chemHeader.textContent = 'Chemistry Toolbox';

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-chempanel-btncontainer');

    var btncolor = '#e6e69a';
    fnButtonContainer.appendChild(elemSearchBtn('Element Look-Up', '🔎', btncolor));
    fnButtonContainer.appendChild(molarMassBtn('Molar Mass Calculator', '🧮', btncolor));

    chemWindow.appendChild(chemHeader);
    chemWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(chemWindow);

    return chemWindow;
}

// --- Element Loop Ups ---
function elemSearchBtn(name, symbol, color) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-chempanel-btn');
    btn.style.backgroundColor = '#f9f9f9'; // Default state

    // Use 'name' from arguments
    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-chempanel-btnsymbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        var existingWindow = document.getElementById('sci-chempanel-elesearch');
        
        if (!existingWindow) {
            // OPEN logic
            openElemSearchWindow();
            btn.style.backgroundColor = color;
            btn.style.color = 'white';
        } else {
            // CLOSE logic
            existingWindow.remove();
            btn.style.backgroundColor = '#f9f9f9';
            btn.style.color = 'black';
        }
    });

    return btn;
}

function openElemSearchWindow() {
    if (document.getElementById('sci-chempanel-elesearch')) return;
    
    var elemSearchWindow = document.createElement('div');
    elemSearchWindow.setAttribute('id', 'sci-chempanel-elesearch');
    
    var elemSearchHeader = document.createElement('div');
    elemSearchHeader.setAttribute('id', 'sci-chempanel-subfunction-genericheader');
    elemSearchHeader.textContent = 'Elements Loop-Up';

    var searchBox = document.createElement('input');
    searchBox.placeholder = 'Search element...';

    var resultsArea = document.createElement('div');
    resultsArea.id = 'sci-chempanel-results';

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

    elemSearchWindow.append(elemSearchHeader, searchBox, resultsArea);
    document.body.appendChild(elemSearchWindow);
    makeDraggable(elemSearchHeader, elemSearchWindow);
    searchBox.focus();

    return elemSearchWindow;
}

// --- Molar Mass Calculation ---

function molarMassBtn(name, symbol, color) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-chempanel-btn');
    btn.style.backgroundColor = '#f9f9f9'; // Default state

    // Use 'name' from arguments
    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-chempanel-btnsymbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        var existingWindow = document.getElementById('sci-chempanel-molmcalc');
        
        if (!existingWindow) {
            // OPEN logic
            openMolarMassWindow();
            btn.style.backgroundColor = color;
            btn.style.color = 'white';
        } else {
            // CLOSE logic
            existingWindow.remove();
            btn.style.backgroundColor = '#f9f9f9';
            btn.style.color = 'black';
        }
    });

    return btn;
}

function openMolarMassWindow() {
    if (document.getElementById('sci-chempanel-molmcalc')) return;
    
    var elemSearchWindow = document.createElement('div');
    elemSearchWindow.setAttribute('id', 'sci-chempanel-molmcalc');
    
    var elemSearchHeader = document.createElement('div');
    elemSearchHeader.setAttribute('id', 'sci-chempanel-subfunction-genericheader');
    elemSearchHeader.textContent = 'Molar Mass Calculator';

    var inputBox = document.createElement('input');
    inputBox.placeholder = 'Enter the formula';
}