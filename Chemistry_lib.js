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
    elemSearchHeader.textContent = 'Elements Look-Up';

    var searchBox = document.createElement('input');
    searchBox.placeholder = 'Search element...';

    var resultsArea = document.createElement('div');
    resultsArea.id = 'sci-chempanel-results';

    searchBox.addEventListener('input', function() {
        var query = searchBox.value.toLowerCase();
        while(resultsArea.firstChild) { resultsArea.removeChild(resultsArea.firstChild); }

        if (!query) return;
        else if (query.length > 1) {
            var found = elements.filter(el => 
                el.name.toLowerCase().includes(query) || el.symbol.toLowerCase().includes(query));
        }
        else {
            var found = elements.filter(el => 
                el.name.toLowerCase().startsWith(query) || el.symbol.toLowerCase().startsWith(query));
        }

        if (found.length === 0 && query.length > 0) {
            resultsArea.textContent = "No matched result.";
        }

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
        } 
        else {
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
    
    var molarMassWindow = document.createElement('div');
    molarMassWindow.setAttribute('id', 'sci-chempanel-molmcalc');
    
    var molarMassHeader = document.createElement('div');
    molarMassHeader.setAttribute('id', 'sci-chempanel-subfunction-genericheader');
    molarMassHeader.textContent = 'Molar Mass Calculator(no brackets)';

    var inputBox = document.createElement('input');
    inputBox.placeholder = 'Enter the formula';

    var resultBox = document.createElement('div');
    resultBox.setAttribute('id', 'sci-chempanel-molmcalc-result');
    resultBox.textContent = "Molar Mass: --";

    inputBox.addEventListener('input', function() {
        let totalMass = calculate(parseInput(inputBox.value));

        switch (totalMass) {
            case -1:
                resultBox.textContent = "Molar Mass: --";
                break;
            case -2:
                resultBox.textContent = "Error: Please expand the content in bracket.";
                break;
            case -3:
                resultBox.textContent = "Error: Invalid character.";
                break;
            case -4:
                resultBox.textContent = "Error: Element not found.";
                break;
            default:
                // This handles any positive number (the actual mass)
                resultBox.textContent = "Molar Mass: " + totalMass.toFixed(3) + 'u';
        }
    });

    molarMassWindow.appendChild(molarMassHeader);
    molarMassWindow.appendChild(inputBox);
    molarMassWindow.appendChild(resultBox);
    document.body.appendChild(molarMassWindow);

    makeDraggable(molarMassHeader, molarMassWindow);

    return molarMassWindow;
}

function isLetter(token) {return /[a-zA-Z]/.test(token);}
function islegit(token) {return (isLetter(token) || !isNaN(token));}
function isUpper(token) {return (isLetter(token) && token === token.toUpperCase());}
function isLower(token) {return (isLetter(token) && token === token.toLowerCase());}
function isNum(token) {return (!isNaN(token));}

class elementinformula {
    constructor(name = "", count = 0) {
        this.name = name;
        this.count = count;
    }
}

function parseInput(input) {
    let elemList = [];
    let i = 0;
    while (i < input.length) {
        let token = input[i];
        if (isUpper(token)) {
            let name = token;
            i++;
            if (i < input.length && isLower(input[i])) {
                name += input[i];
                i++;
            }
            let countStr = "";
            while (i < input.length && isNum(input[i]) && !isLetter(input[i])) {
                countStr += input[i];
                i++;
            }
            let count = countStr === "" ? 1 : parseInt(countStr);
            elemList.push(new elementinformula(name, count));
        } 

        else if (token === " ") {
            i++;
        }
        
        else if(token === "(" || token === ")"){
            return ["brkt"];
        }
        else {
            return ["ilgl"]
        }
    }
    return elemList;
}

function lookup(elementName) {
    for (var j = 0; j < elements.length; j++) {
        var currentEntry = elements[j];

        // 1. Safety check: make sure the array slot isn't empty/null
        if (currentEntry && typeof currentEntry === 'object') {
            
            // 2. Exact match check
            if (currentEntry.symbol.toLowerCase() === elementName.toLowerCase()) {
                return currentEntry.molarMass;
            }
        }
    }
    return -1;
}

function calculate(elementList) {
    // 1. Check for your custom error codes
    if (!elementList || elementList.length === 0) return -1;
    if (elementList[0] === "brkt") return -2; // Code for "No brackets allowed yet"
    if (elementList[0] === "ilgl") return -3; // Code for "Illegal character"

    let totalMass = 0;
    for (let el of elementList) {
        let unitMass = lookup(el.name);
        if (unitMass < 0) return -4; // Code for "Element not in Periodic Table"
        totalMass += unitMass * el.count;
    }
    return totalMass;
}