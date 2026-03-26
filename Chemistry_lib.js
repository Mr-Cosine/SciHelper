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

function closeChemWindow() {
    document.getElementById('sci-chempanel-elesearch')?.remove();
    document.getElementById('sci-chempanel-molmcalc')?.remove();
    document.getElementById('sci-chempanel')?.remove();

    return null;
}

function openElemSearchWindow() {
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
    name_legend.classList.add('sci-chempanel-elem-row-name');
    name_legend.textContent = "Name: ";
    var mass_legend = document.createElement("div");
    mass_legend.classList.add('sci-chempanel-elem-row-name');
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
        name_legend.classList.add('sci-chempanel-elem-row-name');
        name_legend.textContent = "Name: ";

        var mass_legend = document.createElement("div");
        mass_legend.classList.add('sci-chempanel-elem-row-name');
        mass_legend.textContent = "Molar Mass: ";

        legend.append(symbol_legend, name_legend, mass_legend);
        resultsArea.appendChild(legend);

        if (!query) return;
        else if (isNum(query)) {
            var found = elements.filter(elem => elem.atomicNumber == query);
        }
        else if (query.length > 1) {
            var found = elements.filter(elem => 
                elem.name.toLowerCase().includes(query) || elem.symbol.toLowerCase().includes(query));
        }
        else {
            var found = elements.filter(elem => 
                elem.name.toLowerCase().startsWith(query) || elem.symbol.toLowerCase().startsWith(query));
        }

        if (found.length === 0 && query.length > 0) {
            var row = document.createElement('div');
            row.setAttribute('class', 'sci-chempanel-elem-row');
            row.textContent = "No matched result.";
            resultsArea.appendChild(row);
        }
        else {
            found.forEach(elem => {
                
                var row = document.createElement('div');
                row.setAttribute('class', 'sci-chempanel-elem-row');
                var symbol = document.createElement("div");
                symbol.classList.add('sci-chempanel-elem-row-symbol');
                symbol.textContent = elem.atomicNumber + '\t' + elem.symbol;
                var name = document.createElement("div");
                name.classList.add('sci-chempanel-elem-row-name');
                name.textContent = elem.name;
                var mass = document.createElement("div");
                mass.classList.add('sci-chempanel-elem-row-name');
                mass.textContent = elem.molarMass.toFixed(3) + 'u';

                row.append(symbol, name, mass);
                resultsArea.appendChild(row);
            });
        }
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
    molarMassHeader.textContent = 'Molar Mass Calculator (No Brackets)';

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
    count_legend.classList.add('sci-chempanel-molm-row-name');
    count_legend.textContent = "Count: ";
    var mass_legend = document.createElement("div");
    mass_legend.classList.add('sci-chempanel-molm-row-name');
    mass_legend.textContent = "Mass: ";
    var masspercent_legend = document.createElement("div");
    masspercent_legend.classList.add('sci-chempanel-molm-row-name');
    masspercent_legend.textContent = "%Mass: "

    legend.append(symbol_legend, count_legend, mass_legend, masspercent_legend);
    resultBox.appendChild(legend);

    inputBox.addEventListener('input', function() {
        let elemLst = parseInput(inputBox.value);
        let totalMass = calculate(elemLst);

        switch (totalMass) {
            case -1:
                result.textContent = "Molar Mass: --";
                break;
            case -2:
                result.textContent = "Error: Please expand the content in bracket.";
                break;
            case -3:
                result.textContent = "Error: Invalid character.";
                break;
            case -4:
                result.textContent = "Error: Element not found.";
                break;
            default:
                while(resultBox.firstChild) { resultBox.removeChild(resultBox.firstChild); }

                var legend = document.createElement('div');
                legend.setAttribute('class', 'sci-chempanel-molm-row');
                var symbol_legend = document.createElement("div");
                symbol_legend.classList.add('sci-chempanel-molm-row-symbol');
                symbol_legend.textContent = "Element: ";
                var count_legend = document.createElement("div");
                count_legend.classList.add('sci-chempanel-molm-row-name');
                count_legend.textContent = "Count: ";
                var mass_legend = document.createElement("div");
                mass_legend.classList.add('sci-chempanel-molm-row-name');
                mass_legend.textContent = "Mass: ";
                var masspercent_legend = document.createElement("div");
                masspercent_legend.classList.add('sci-chempanel-molm-row-name');
                masspercent_legend.textContent = "%Mass: "

                legend.append(symbol_legend, count_legend, mass_legend, masspercent_legend);

                resultBox.appendChild(legend);

                for (elem of elemLst) {
                    var row = document.createElement('div');
                    row.setAttribute('class', 'sci-chempanel-molm-row');
            
                    var symbol = document.createElement("div");
                    symbol.classList.add('sci-chempanel-molm-row-symbol');
                    symbol.textContent = elem.name;
                        
                    var count = document.createElement("div");
                    count.classList.add('sci-chempanel-molm-row-name');
                    count.textContent = elem.count 

                    var mass = document.createElement("div");
                    mass.classList.add('sci-chempanel-molm-row-name');
                    mass.textContent = (lookup(elem.name)*elem.count).toFixed(3);

                    var masspercent = document.createElement("div");
                    masspercent.classList.add('sci-chempanel-molm-row-name');
                    masspercent.textContent = (lookup(elem.name)*elem.count/totalMass*100).toFixed(3) + "%";

                    row.append(symbol, count, mass, masspercent);
                    resultBox.appendChild(row);
                }

                result.textContent = "Molar Mass = " + totalMass.toFixed(3) + " g/mol";
        }
    });

    molarMassWindow.appendChild(molarMassHeader);
    molarMassWindow.appendChild(inputBox);
    molarMassWindow.appendChild(resultBox);
    molarMassWindow.appendChild(result);
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