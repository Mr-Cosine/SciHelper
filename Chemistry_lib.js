// --- Helper Functions ---
function isLetter(token) {return /[a-zA-Z]/.test(token);}
function islegit(token) {return (isLetter(token) || !isNaN(token));}
function isUpper(token) {return (isLetter(token) && token === token.toUpperCase());}
function isLower(token) {return (isLetter(token) && token === token.toLowerCase());}
function isNum(token) {return (!isNaN(token));}
function round(num, digit) {
    if (isNum(num) && isNum(digit)){
        return Math.round(num * (10**digit)) / (10**digit);
    }
}

function hasMultipleCapitals(query) {
    let count = 0;
    for (let i = 0; i < query.length; i++) {
        if (isUpper(query[i])) {
            count++;
        }
        if (count > 1) return true; // Exit early once we hit 2
    }
    return false;
}

class elementinformula {
    constructor(name = "", count = 0) {
        this.name = name;
        this.count = count;
    }
}

function parseInput(input){
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

        else if (token === "(") {
            let sublist = [];
            let j = i + 1;
            while (j < input.length) {
                if (input[j] === ")") {
                    sublist = parseInput(input.substring(i + 1, j));
                    if (sublist[0] === "ilgl") {
                        return ["ilgl"]
                    }

                    j++;
                    let multiplierStr = "";
                    while (j < input.length && isNum(input[j])) {
                        multiplierStr += input[j];
                        j++;
                    }
                    let multiplier = multiplierStr === "" ? 1 : parseInt(multiplierStr);

                    for (let e of sublist){
                        e.count *= Number(multiplier);
                    }
                    break;
                }
                else{
                    j++;
                }
            }
            i = j;
            if (sublist.length === 0) {
                return ["ilgl"]
            }
            else {
                elemList = elemList.concat(sublist);
            }
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
    if (!elementList || elementList.length === 0) return [-1, ""];
    if (elementList[0] === "ilgl") return [-2, ""]; // Code for "Illegal character"

    let totalMass = 0;
    var elemNotFound = "";
    for (let el of elementList) {
        let unitMass = lookup(el.name);
        if (unitMass < 0) {
            totalMass = -3;
            elemNotFound = elemNotFound + el.name + ", ";
        }
        if (totalMass >= 0) totalMass += unitMass * el.count;
    }
    return [totalMass, elemNotFound.slice(0,-2)];
}

//============================================================================
// --- UI builders ---

// --- Main Chemistry submenu ---
function openChemWindow(outputLoc, parentWin) {
    if (document.getElementById('sci-chempanel')) return;
    
    var chemWindow = document.createElement('div');
    chemWindow.setAttribute('id', 'sci-chempanel');
    
    var chemHeader = document.createElement('div');
    chemHeader.setAttribute('id', 'sci-chempanel-header');
    chemHeader.textContent = 'Chemistry Toolbox';
    chemHeader.classList.add('no-select');

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-chempanel-btncontainer');

    var btncolor = '#e6e69a';
    fnButtonContainer.appendChild(elemSearchBtn('Element Look-Up', '🔎', btncolor, outputLoc));
    fnButtonContainer.appendChild(molarMassBtn('Molar Mass Calculator', '🧮', btncolor, outputLoc));

    chemWindow.appendChild(chemHeader);
    chemWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(chemWindow);

    return chemWindow;
}

// --- Element Loop Ups ---
function elemSearchBtn(name, symbol, color, outputLoc) {
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
            openElemSearchWindow(outputLoc);
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

function closeChemWindow() {
    document.getElementById('sci-chempanel-elesearch')?.remove();
    document.getElementById('sci-chempanel-molmcalc')?.remove();
    document.getElementById('sci-chempanel')?.remove();

    return null;
}

function openElemSearchWindow(outputLoc) {
    if (document.getElementById('sci-chempanel-elesearch')) return;
    
    var elemSearchWindow = document.createElement('div');
    elemSearchWindow.setAttribute('id', 'sci-chempanel-elesearch');
    
    var elemSearchHeader = document.createElement('div');
    elemSearchHeader.setAttribute('id', 'sci-chempanel-subfunction-genericheader');
    elemSearchHeader.textContent = 'Elements Look-Up  ';

    var searchBox = document.createElement('input');
    searchBox.placeholder = 'Search element...';

    var resultsArea = document.createElement('div');
    resultsArea.id = 'sci-chempanel-results';

    var legend = document.createElement('div');
    legend.setAttribute('class', 'sci-chempanel-elem-row');
    var symbol_legend = document.createElement("div");
    symbol_legend.classList.add('sci-chempanel-elem-row-symbol');
    symbol_legend.textContent = "Symbol: ";
    var name_legend = document.createElement("div");
    name_legend.classList.add('sci-chempanel-elem-row-text');
    name_legend.textContent = "Name: ";
    var mass_legend = document.createElement("div");
    mass_legend.classList.add('sci-chempanel-elem-row-text');
    mass_legend.textContent = "Molar Mass: ";

    legend.append(symbol_legend, name_legend, mass_legend);
    resultsArea.appendChild(legend);

    searchBox.addEventListener('input', function() {
        var query = searchBox.value.toLowerCase();
        while(resultsArea.firstChild) { resultsArea.removeChild(resultsArea.firstChild); }

        var legend = document.createElement('div');
        legend.setAttribute('class', 'sci-chempanel-elem-row');

        var symbol_legend = document.createElement("div");
        symbol_legend.classList.add('sci-chempanel-elem-row-symbol');
        symbol_legend.textContent = "Symbol: ";

        var name_legend = document.createElement("div");
        name_legend.classList.add('sci-chempanel-elem-row-text');
        name_legend.textContent = "Name: ";

        var mass_legend = document.createElement("div");
        mass_legend.classList.add('sci-chempanel-elem-row-text');
        mass_legend.textContent = "Molar Mass: ";

        legend.append(symbol_legend, name_legend, mass_legend);
        resultsArea.appendChild(legend);

        if (!query) return;

        var searchPool = elements.concat(polyions); 

        var found = [];

        if (!isNaN(query) && query !== "") {// Atomic Number Search (Elements only)
            found = elements.filter(elem => elem.atomicNumber == query);
        } 
        else {
            // Text Search (Name or Symbol)
            found = searchPool.filter(item => {
                var name = item.name.toLowerCase();
                var symbol = item.symbol.toLowerCase();
                // Remove superscripts/subscripts for "easy" typing (e.g., SO4 matching SO₄²⁻)
                var polySymbol = item.symbol.replace(/[⁺⁻¹²³⁴⁵⁶⁷⁸⁹⁰₀₁₂₃₄₅₆₇₈₉]/g, function(char) {
                    const map = {
                        '⁺': '+', '⁻': '-', 
                        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
                        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
                    };
                    return map[char] || char;}
                    ).toLowerCase();

                if (query.length === 1) {
                    // Single letter: Match startsWith for speed/accuracy
                    return name.startsWith(query) || symbol.startsWith(query);
                } 
                else {
                    // Multiple letters: Match anywhere in string
                    return name.includes(query) || symbol.includes(query) || polySymbol.includes(query);
                 }
            });
        }

        if (found.length === 0 && query.length > 0) {
            var row = document.createElement('div');
            row.setAttribute('class', 'sci-chempanel-elem-row');
            row.textContent = "No matched result.";
            resultsArea.appendChild(row);
        }
        else {
            for (let elem of found) {
                var row = document.createElement('div');
                row.setAttribute('class', 'sci-chempanel-elem-row');
                const symbolToPaste = elem.symbol;
                const nameToPaste = elem.name;
                const massToPaste = round(elem.molarMass, 3) + 'u';

                var symbol = document.createElement("div");
                symbol.classList.add('sci-chempanel-elem-row-symbol');
                symbol.textContent = symbolToPaste;
                symbol.onclick = () => {insertIntoWindow(outputLoc, symbolToPaste);}
                var name = document.createElement("div");
                name.classList.add('sci-chempanel-elem-row-text');
                name.textContent = nameToPaste;
                name.onclick = () => {insertIntoWindow(outputLoc, nameToPaste);}
                var mass = document.createElement("div");
                mass.classList.add('sci-chempanel-elem-row-text');
                mass.textContent = massToPaste;
                mass.onclick = () => {insertIntoWindow(outputLoc, massToPaste.slice(0,-1));}

                row.append(symbol, name, mass);
                resultsArea.appendChild(row);
            }
        }
    });

    elemSearchWindow.append(elemSearchHeader, searchBox, resultsArea);
    document.body.appendChild(elemSearchWindow);
    makeDraggable(elemSearchHeader, elemSearchWindow);
    searchBox.focus();

    return elemSearchWindow;
}

// --- Molar Mass Calculation ---

function molarMassBtn(name, symbol, color, outputLoc) {
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
            openMolarMassWindow(outputLoc);
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

function openMolarMassWindow(outputLoc) {
    if (document.getElementById('sci-chempanel-molmcalc')) return;
    
    var molarMassWindow = document.createElement('div');
    molarMassWindow.setAttribute('id', 'sci-chempanel-molmcalc');
    
    var molarMassHeader = document.createElement('div');
    molarMassHeader.setAttribute('id', 'sci-chempanel-subfunction-genericheader');
    molarMassHeader.textContent = 'Molar Mass Calculator';

    var inputBox = document.createElement('input');
    inputBox.placeholder = 'Enter the formula';

    var resultBox = document.createElement('div')
    resultBox.id = 'sci-chempanel-results';

    var result = document.createElement('div');
    result.setAttribute('id', 'sci-chempanel-molmcalc-result');

    var legend = document.createElement('div');
    legend.setAttribute('class', 'sci-chempanel-molm-row');
    var symbol_legend = document.createElement("div");
    symbol_legend.classList.add('sci-chempanel-molm-row-symbol');
    symbol_legend.textContent = "Element: ";
    var count_legend = document.createElement("div");
    count_legend.classList.add('sci-chempanel-molm-row-text');
    count_legend.textContent = "Count: ";
    var mass_legend = document.createElement("div");
    mass_legend.classList.add('sci-chempanel-molm-row-text');
    mass_legend.textContent = "Mass: ";
    var masspercent_legend = document.createElement("div");
    masspercent_legend.classList.add('sci-chempanel-molm-row-text');
    masspercent_legend.textContent = "%Mass: ";

    legend.append(symbol_legend, count_legend, mass_legend, masspercent_legend);
    resultBox.appendChild(legend);

    inputBox.addEventListener('input', function() {
        let elemLst = parseInput(inputBox.value);
        let [totalMass,elem404] = calculate(elemLst);

        while(resultBox.firstChild) { resultBox.removeChild(resultBox.firstChild); }

            var legend = document.createElement('div');
            legend.setAttribute('class', 'sci-chempanel-molm-row');
            var symbol_legend = document.createElement("div");
            symbol_legend.classList.add('sci-chempanel-molm-row-symbol');
            symbol_legend.textContent = "Element: ";
            var count_legend = document.createElement("div");
            count_legend.classList.add('sci-chempanel-molm-row-text');
            count_legend.textContent = "Count: ";
            var mass_legend = document.createElement("div");
            mass_legend.classList.add('sci-chempanel-molm-row-text');
            mass_legend.textContent = "Mass: ";
            var masspercent_legend = document.createElement("div");
            masspercent_legend.classList.add('sci-chempanel-molm-row-text');
            masspercent_legend.textContent = "%Mass: ";

            legend.append(symbol_legend, count_legend, mass_legend, masspercent_legend);

        switch (totalMass) {
            case -1:
                result.textContent = "Molar Mass: --";
                break;
            case -2:
                result.textContent = "Error: Contains invalid characters/structures.";
                break;
            case -3:
                result.textContent = "Error: Contains unrecognized elements: " + elem404;
                break;
            default:
                resultBox.appendChild(legend);

                for (let elem of elemLst) {
                    var row = document.createElement('div');
                    row.setAttribute('class', 'sci-chempanel-molm-row');

                    // 1. CAPTURE the values right now so the click knows exactly what to paste
                    const nameToPaste = elem.name;
                    const countToPaste = elem.count.toString();
                    const massToPaste = round((lookup(elem.name) * elem.count), 3).toString();
                    const percentToPaste = round((lookup(elem.name) * elem.count / totalMass * 100), 3) + "%";

                    var symbol = document.createElement("div");
                    symbol.classList.add('sci-chempanel-molm-row-symbol');
                    symbol.textContent = nameToPaste;
                    // 2. Use the CAPTURED constant here
                    symbol.onclick = () => { insertIntoWindow(outputLoc, nameToPaste); }
                                        
                    var count = document.createElement("div");
                    count.classList.add('sci-chempanel-molm-row-text');
                    count.textContent = countToPaste;
                    count.onclick = () => { insertIntoWindow(outputLoc, countToPaste); }

                    var mass = document.createElement("div");
                    mass.classList.add('sci-chempanel-molm-row-text');
                    mass.textContent = massToPaste;
                    mass.onclick = () => { insertIntoWindow(outputLoc, massToPaste); }

                    var masspercent = document.createElement("div");
                    masspercent.classList.add('sci-chempanel-molm-row-text');
                    masspercent.textContent = percentToPaste;
                    masspercent.onclick = () => { insertIntoWindow(outputLoc, percentToPaste); }

                    row.append(symbol, count, mass, masspercent);
                    resultBox.appendChild(row);
                }
                const finalResultStr = round(totalMass, 3) + " g/mol";
                result.textContent = "Molar Mass = " + finalResultStr;
                result.onclick = () => insertIntoWindow(outputLoc, finalResultStr);

                break;
        }
    });

    molarMassWindow.append(molarMassHeader, inputBox, resultBox, result);
    document.body.appendChild(molarMassWindow);
    makeDraggable(molarMassHeader, molarMassWindow);

    return molarMassWindow;
}

