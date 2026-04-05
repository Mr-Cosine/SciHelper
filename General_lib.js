// --- Helper Functions ---
function f(x, polynomials) {let y = 0; for (let term of polynomials) { y += term.coeff * Math.pow(x, term.exp);} return y;};
function getBound(polynomials) {
    let an = Math.abs(polynomials[0].coeff);

    let maxOther = 0;
    for (let i = 1; i < polynomials.length; i++) {
        let val = Math.abs(polynomials[i].coeff);
        if (val > maxOther) maxOther = val;
    }
    return 1 + (maxOther / an);
}

function ddx(polynomials) {
    let derivedPoly = polynomials.map(term => ({
        coeff: term.coeff,
        exp: term.exp
    }));

    for (let term of derivedPoly) {
        let multiplier = term.exp;
        term.exp -= 1;
        term.coeff *= multiplier;
    }
    return derivedPoly.filter(term => term.exp !== -1 && term.coeff !== 0);
}

function solve(polynomials) {
    const epsi = 0.000001;
    let result = [];

    polynomials = polynomials.filter(term => term.coeff !== 0);

    polynomials.sort((a, b) => b.exp - a.exp);
    const range = getBound(polynomials);

    derivative = ddx(polynomials);

    let x = -range; 
    let rangeCheck = [];
    while (x <= range) {
        let stepCoeff = Math.abs(f(x, derivative));
        let stepSize = 0.05/((stepCoeff < 0.5)? 0.5 : stepCoeff);
        let y1 = f(x, polynomials);
        let y2 = f(x + stepSize, polynomials);
        
        if (y1 * y2 <= 0) {
            rangeCheck.push({ lower: x, upper: x + stepSize });
        }
        x += stepSize;
    }

        for (let range of rangeCheck) {
            result.push(getRoot(range.lower, range.upper, epsi, polynomials));
        }

        return result;
}

function getRoot(lo, hi, epsi, polynomials) {
    let mid = (hi + lo)/2;
    if (Math.abs(f(mid, polynomials)) <= epsi || Math.abs(hi - lo) <= epsi) {
        return mid;
    }

    if (f(mid, polynomials) * f(lo, polynomials) > 0) {return getRoot(mid, hi, epsi, polynomials);}
    else {return getRoot(lo, mid, epsi, polynomials);}
}

//============================================================================
// --- UI builders ---

// --- Main General submenu ---
function openGenWindow(outputLoc, parentWin) {
    if (document.getElementById('sci-genpanel')) return;

    state_gen = {
        polySolver: false
    }
    
    var genWindow = document.createElement('div');
    genWindow.setAttribute('id', 'sci-genpanel');
    
    var genHeader = document.createElement('div');
    genHeader.setAttribute('id', 'sci-genpanel-header');
    genHeader.textContent = 'General Toolbox';
    genHeader.classList.add('no-select');

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-genpanel-btncontainer');

    var btncolor = '#cfe084';
    fnButtonContainer.appendChild(createFnBtn_gen('Polynomial solver', '🧮', btncolor, 'polySolver', state_gen, outputLoc));

    genWindow.appendChild(genHeader);
    genWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(genWindow);

    return true;
}

function closeGenWindow() {
    let toolWindow = document.getElementsByClassName('sci-genpanel-tool');
    while (toolWindow.length > 0) {toolWindow[0].remove();}
    document.getElementById('sci-genpanel')?.remove();

    return false;
}

function createFnBtn_gen(name, symbol, color, id, state_gen, outputLoc) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-genpanel-btn');
    btn.style.backgroundColor = '#f9f9f9'; // Default state
    btn.id = id;
    btn.color = color;

    // Use 'name' from arguments
    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-genpanel-btnsymbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        if (id === 'polySolver') {
            var existingWindow = document.getElementById('sci-genpanel-poly');
            if (!existingWindow) {openPolyWindow(outputLoc); state_gen.polySolver = true;}
            else {existingWindow.remove(); state_gen.polySolver = false;}
        }
        refreshBtnDisp(btn.className, state_gen);
    });

    return btn;
}

function openPolyWindow(outputLoc) {
    if (document.getElementById('sci-genpanel-poly')) return;

    var polyWindow = document.createElement('div');
    polyWindow.setAttribute('id', 'sci-genpanel-poly');
    polyWindow.setAttribute('class', 'sci-genpanel-tool');

    var header = document.createElement('div');
    header.setAttribute('class', 'sci-genpanel-subfunction-genericheader');
    header.textContent = 'Polynomial solver';
    header.classList.add('no-select');  

    var inputContainer = document.createElement('div');
    inputContainer.setAttribute('class', 'sci-genpanel-poly-input-container');
    var rowID = 1;
    var row1 = createPolyInput('a' + rowID, 2); rowID++;
    var row2 = createPolyInput('a' + rowID, 1); rowID++;
    inputContainer.append(row1, row2);

    var addRowBtn = document.createElement('button');
    addRowBtn.setAttribute('class', 'sci-genpanel-poly-addrow-btn');
    addRowBtn.textContent = '+';
    addRowBtn.addEventListener('click', function() {
        rowID = document.getElementsByClassName(row1.className).length + 1;
        inputContainer.append(createPolyInput('a' + rowID));
    });

    var solveBtn = document.createElement('button');
    solveBtn.setAttribute('class', 'sci-genpanel-poly-solve-btn');
    solveBtn.textContent = 'Solve polynomials';

    var result = document.createElement('div');
    result.setAttribute('class', 'sci-genpanel-subfunction-genericresult');
    result.textContent = '𝑥 =';

    solveBtn.addEventListener('click', function() {
        result.textContent = '';
        let rows = document.getElementsByClassName(row1.className);
        let polynomials = [{coeff: parseFloat(-1 * row1.constant.value), exp: 0}];
        for (let row of rows) {
            let coefficient = row.coefficient.value;
            let exponent = row.exponent.value;
            polynomials.push({ coeff: parseFloat(coefficient), exp: parseInt(exponent) });
        }

        let roots = solve(polynomials);

        result.textContent = '𝑥 =';
        for (let root of roots) {result.textContent += root + ', '}

    });

    polyWindow.append(header, inputContainer, addRowBtn, solveBtn, result);
    makeDraggable(header, polyWindow);

    document.body.appendChild(polyWindow);

    return;
}

function createPolyInput(rowID, defaultExponent = 'n') {
    var row = document.createElement('div');
    row.setAttribute('class', 'sci-genpanel-poly-input-row');
    row.rowID = 'a' + rowID;

    var inputSection = document.createElement('div');
    inputSection.setAttribute('class', 'sci-genpanel-poly-input-inputsection');

    var constant = document.createElement('input');
    constant.setAttribute('type', 'text');
    constant.setAttribute('placeholder', 'c');
    constant.setAttribute('class', 'sci-genpanel-poly-input-inputsection-constant');
    
    var equalSign = document.createElement('span');
    equalSign.textContent = ' = ';
    equalSign.setAttribute('class', 'sci-genpanel-poly-input-inputsection-equalsign');

    var coefficient = document.createElement('input');
    coefficient.setAttribute('type', 'text');
    coefficient.setAttribute('placeholder', rowID);
    coefficient.setAttribute('class', 'sci-genpanel-poly-input-inputsection-coefficient');

    var variable = document.createElement('span');
    variable.textContent = '𝑥';
    variable.setAttribute('class', 'sci-genpanel-poly-input-inputsection-variable');

    var exponent = document.createElement('input');
    exponent.setAttribute('type', 'text');
    exponent.setAttribute('placeholder', 'n');
    exponent.setAttribute('class', 'sci-genpanel-poly-input-inputsection-exponent');
    exponent.value = defaultExponent;


    var removeBtn = document.createElement('button');
    removeBtn.setAttribute('class', 'sci-genpanel-poly-input-remove');
    removeBtn.textContent = '⊝';
    removeBtn.buttonID = 'a' + rowID;

    removeBtn.addEventListener('click', () => {
        let rowLst = document.getElementsByClassName(row.className);
        for (let existingRow of rowLst) {if (existingRow.rowID === removeBtn.buttonID) existingRow.remove();}
    })

    if (Number(rowID.slice(1)) >= 2) {
        constant.style.visibility = 'hidden'; constant.disabled = true;
        equalSign.textContent = '+';
    }
    else {
        removeBtn.style.visibility = 'hidden'; removeBtn.disabled = true;
    }

    row.constant = constant;
    row.coefficient = coefficient;
    row.exponent = exponent;
    
    inputSection.append(constant, equalSign, coefficient, variable, exponent);
    row.append(inputSection, removeBtn);

    return row;
}
