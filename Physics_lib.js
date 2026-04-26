import { physFormulas } from './resources.js';
import { insertIntoWindow, makeDraggable, refreshBtnDisp } from './SciHelper_lib.js';
import { solveEq, infixToPostfix, evaluate } from './Chemistry_lib.js';

// --- Helper Functions ---
function vectorAdd(v1, v2, mode) {
    if (v1.length !== v2.length) return "Error";
    if (mode === 'polar') {
        if(v1.length !== 2 || v2.length !== 2) return "Error";
        else return [   
                        Math.sqrt((v1[0]*Math.cos(v1[1]) + v2[0]*Math.cos(v2[1]))**2 + (v1[0]*Math.sin(v1[1]) + v2[0]*Math.sin(v2[1]))**2), 
                        Math.atan2(v1[0]*Math.sin(v1[1]) + v2[0]*Math.sin(v2[1]), v1[0]*Math.cos(v1[1]) + v2[0]*Math.cos(v2[1]))
                    ];
    }
    else {
        let r = [];
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            r.push((v1[i] || 0) + (v2[i] || 0));
        }
        return r;
    }
}

function vectorSubtract(v1, v2, mode) {
    if (v1.length !== v2.length) return "Error";
    if (mode === 'polar') {
        if(v1.length !== 2 || v2.length !== 2) return "Error";
        else return [   
                        Math.sqrt((v1[0]*Math.cos(v1[1]) - v2[0]*Math.cos(v2[1]))**2 + (v1[0]*Math.sin(v1[1]) - v2[0]*Math.sin(v2[1]))**2), 
                        Math.atan2(v1[0]*Math.sin(v1[1]) - v2[0]*Math.sin(v2[1]), v1[0]*Math.cos(v1[1]) - v2[0]*Math.cos(v2[1]))
                    ];
    }
    else {
        let r = [];
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            r.push((v1[i] || 0) - (v2[i] || 0));
        }
        return r;
    }
}

function vectorDot(v1, v2, mode) {
    if (v1.length !== v2.length) return "Error";
    if (mode === 'polar') {
        if(v1.length !== 2 || v2.length !== 2) return "Error";
        else return v1[0]*v2[0]*Math.cos(v1[1] - v2[1]);
    }
    else {
        let r = 0;
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            r += (v1[i] || 0) * (v2[i] || 0);
        }
        return r;
    }
}

function vectorCross(v1, v2, mode) {
    if (v1.length > 3 || v2.length > 3 || v1.length !== v2.length) return "Error";
    if (mode === 'polar') {
        if(v1.length !== 2 || v2.length !== 2) return "Error";
        else return [0, 0, v1[0]*v2[0]*Math.sin(v2[1] - v1[1])];
    }
    else {
        if (v1.length !== v2.length) return "Error";
        else if(v1.length === 2 && v2.length === 2) return [0, 0, v1[0] * v2[1] - v1[1] * v2[0]];
        else return [
                        v1[1] * v2[2] - v1[2] * v2[1],
                        v1[2] * v2[0] - v1[0] * v2[2],
                        v1[0] * v2[1] - v1[1] * v2[0]
                    ];
    }
}

//============================================================================
// --- UI builders ---

// --- Main Physics Window ---
export function openPhysWindow(outputLoc, parentWin) {
    if (document.getElementById('sci-phys')) return;

    let state_phys = {
        formula: false,
        vectorCalc: false
    }
    
    var physWindow = document.createElement('div');
    physWindow.setAttribute('id', 'sci-phys');
    
    var physHeader = document.createElement('div');
    physHeader.setAttribute('id', 'sci-phys-header');
    physHeader.textContent = 'Physics Toolbox';
    physHeader.classList.add('no-select');

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-phys-btncontainer');

    var btncolor = '#ba68c8';
    fnButtonContainer.appendChild(createFnBtn_phys('Formula Sheet', '📝', btncolor, "formula", state_phys, outputLoc));
    fnButtonContainer.appendChild(createFnBtn_phys('Vector Calculations', '↗️', btncolor, "vectorCalc", state_phys, outputLoc));

    physWindow.appendChild(physHeader);
    physWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(physWindow);

    return true;
}

export function closePhysWindow() {
    let toolWindow = document.getElementsByClassName('sci-phys-tool');
    while (toolWindow.length > 0) {toolWindow[0].remove();}
    document.getElementById('sci-phys')?.remove();

    return false;
}

function createFnBtn_phys(name, symbol, color, id, state_phys, outputLoc) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-phys-btn');
    btn.style.backgroundColor = '#f9f9f9'; // Default state
    btn.id = id;
    btn.color = color;

    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-phys-btn-symbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        if (id === 'formula') {
            var existingWindow = document.getElementById('sci-phys-frml');
            if (!existingWindow) {openFormulaWindow(outputLoc); state_phys.formulas = true;}
            else {existingWindow.remove(); state_phys.formulas = false;}
        }
        if (id === 'vectorCalc') {
            var existingWindow = document.getElementById('sci-phys-vect');
            if (!existingWindow) {openVectorCalcWindow(outputLoc); state_phys.vectorCalc = true;}
            else {existingWindow.remove(); state_phys.vectorCalc = false;}
        }
        refreshBtnDisp(btn.className, state_phys);
    });

    return btn;
}

/* --- Formula Sheet --- */

function openFormulaWindow(outputLoc) {
    if (document.getElementById('sci-phys-frml')) return;

    var formulaWindow = document.createElement('div');
    formulaWindow.setAttribute('id', 'sci-phys-frml');
    formulaWindow.setAttribute('class', 'sci-phys-tool');

    var formulaHeader = document.createElement('div');
    formulaHeader.setAttribute('class', 'sci-phys-tool-header');
    formulaHeader.textContent = 'Formula Sheet';
    formulaHeader.classList.add('no-select');
    formulaWindow.appendChild(formulaHeader);

    var formulaContainer = document.createElement('div');
    formulaContainer.setAttribute('id', 'sci-phys-frml-content');
    
    let prevcategory = "";
    physFormulas.forEach((entry, i) => {
        if (entry.category !== prevcategory) {
            var categoryHeader = document.createElement('div');
            categoryHeader.setAttribute('class', 'sci-phys-frml-category');
            categoryHeader.textContent = entry.category + ":";
            formulaContainer.appendChild(categoryHeader);
            prevcategory = entry.category;
        }

        var row = document.createElement('div');
        row.setAttribute('class', 'sci-phys-frml-row');
        katex.render(entry.latex, row, { throwOnError: false, displayMode: false });
        row.rowID = i;
        row.addEventListener('click', () => {
            openCalculatorWindow(formulaWindow, entry, outputLoc);
        });
        formulaContainer.appendChild(row);
    });

    formulaWindow.appendChild(formulaContainer);
    document.body.appendChild(formulaWindow);
    makeDraggable(formulaHeader, formulaWindow);

    return formulaWindow;
}

function openCalculatorWindow (parentWindow, formula, outputLoc) {
    while(document.getElementById('sci-phys-frml-calc')) {document.getElementById('sci-phys-frml-calc').remove();}
    var calcWindow = document.createElement('div');
    calcWindow.setAttribute('id', 'sci-phys-frml-calc');

    var calcHeader = document.createElement('div');
    calcHeader.setAttribute('class', 'sci-phys-tool-header');
    calcHeader.textContent = formula.name;

    calcWindow.appendChild(calcHeader);

    formula.variables.forEach(variable => {
        var input = document.createElement('input');
        input.symbol = variable.symbol;
        input.placeholder = variable.symbol + (variable.unit ? " (" + variable.unit + ")" : "");
        if (variable.constant) {input.value = variable.constant;}
        input.setAttribute('class', 'sci-phys-frml-calc-input');
        input.addEventListener('input', () => {
            input.style.backgroundColor = 'white';
        });
        calcWindow.appendChild(input);
    });
    
    var solveBtn = document.createElement('button');
    solveBtn.textContent = 'Solve';
    solveBtn.setAttribute('class', 'sci-phys-frml-calc-solve');
    solveBtn.addEventListener('click', () => {
        if (document.querySelector('.sci-phys-frml-calc-alert')) document.querySelector('.sci-phys-frml-calc-alert').remove();
        let inputs = document.querySelectorAll('.sci-phys-frml-calc-input');

        let varValues = {};
        let emptyValues = {};

        inputs.forEach(input => {
            if (input.value === "") {
                emptyValues[input.symbol] = null;
                varValues[input.symbol] = null;
            }
            else {
                varValues[input.symbol] = parseFloat(input.value);
            }
        });

        if (Object.keys(emptyValues).length > 0 && Object.keys(emptyValues).length < 2) {
            let result = solveEq(varValues, formula.solve).toFixed(3);
            let targetVar = Array.from(inputs).find(input => input.symbol === Object.keys(emptyValues)[0]);
            targetVar.value = result;
            targetVar.style.backgroundColor = '#f3e8f7';
        }
        else {
            var alert = document.createElement('div');
            alert.setAttribute('class', 'sci-phys-frml-calc-alert');
            alert.textContent = "Please fill in exactly one variable to solve for.";
            calcWindow.appendChild(alert);
        }
    });
    calcWindow.appendChild(solveBtn);
    parentWindow.appendChild(calcWindow);
}

/* --- Vector Calculation --- */

function openVectorCalcWindow(outputLoc) {
    if (document.getElementById('sci-phys-vect')) return;
    var vectorWindow = document.createElement('div');
    vectorWindow.setAttribute('id', 'sci-phys-vect');

    var vectorHeader = document.createElement('div');
    vectorHeader.setAttribute('class', 'sci-phys-tool-header');
    vectorHeader.textContent = 'Vector Calculator';
    vectorHeader.classList.add('no-select');

    var mode = document.createElement('select');
    mode.append(new Option('Cartesian', 'cartesian'));
    mode.append(new Option('Polar(2D)', 'polar'));
    mode.setAttribute('class', 'sci-phys-vect-select');
    
    var vector1 = document.createElement('input');
    vector1.placeholder = "Vector 1: (x1, x2, x3 ...)";
    vector1.setAttribute('class', 'sci-phys-vect-input');

    var vector2 = document.createElement('input');
    vector2.placeholder = "Vector 2: (y1, y2, y3 ...)";
    vector2.setAttribute('class', 'sci-phys-vect-input');

    var results = document.createElement('div');
    results.setAttribute('class', 'sci-phys-tool-result');
    results.textContent = "R = (r1, r2, r3...)";

    var operationBox = document.createElement('div');
    operationBox.setAttribute('class', 'sci-phys-vect-opcontainer');

    var add = document.createElement('div');
    add.textContent = 'A + B';
    operationBox.appendChild(add);
    add.addEventListener('click', () => {
        if (vector1.value === "" || vector2.value === "") {
            results.textContent = "Please enter both vectors.";
            return;
        }
        let v1 = vector1.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let v2 = vector2.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let R = vectorAdd(v1, v2, mode.value);
        if (Array.isArray(R)) results.textContent = "R = (" + R.join(', ') + ")";
        else results.textContent = "Error";
    });

    var subtract = document.createElement('div');
    subtract.textContent = 'A - B';
    operationBox.appendChild(subtract);
    subtract.addEventListener('click', () => {
        if (vector1.value === "" || vector2.value === "") {
            results.textContent = "Please enter both vectors.";
            return;
        }
        let v1 = vector1.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let v2 = vector2.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let R = vectorSubtract(v1, v2, mode.value);
        if (Array.isArray(R)) results.textContent = "R = (" + R.join(', ') + ")";
        else results.textContent = "Error";
    });

    var dotProduct = document.createElement('div');
    dotProduct.textContent = 'A ⋅ B';
    operationBox.appendChild(dotProduct);
    dotProduct.addEventListener('click', () => {
        if (vector1.value === "" || vector2.value === "") {
            results.textContent = "Please enter both vectors.";
            return;
        }
        let v1 = vector1.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let v2 = vector2.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let R = vectorDot(v1, v2, mode.value);
        if (typeof(R) === 'number') results.textContent = "R = " + R;
        else results.textContent = "Error";
    });

    var crossProduct = document.createElement('div');
    crossProduct.textContent = 'A × B';
    operationBox.appendChild(crossProduct);
    crossProduct.addEventListener('click', () => {
        if (vector1.value === "" || vector2.value === "") {
            results.textContent = "Please enter both vectors.";
            return;
        }
        let v1 = vector1.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let v2 = vector2.value.replaceAll('(', '').replaceAll(')', '').split(',').map(Number);
        let R = vectorCross(v1, v2, mode.value);
        if (Array.isArray(R)) results.textContent = "R = (" + R.join(', ') + ")";
        else results.textContent = "Error";
    });

    operationBox.append(add, subtract, dotProduct, crossProduct);

    vectorWindow.append(vectorHeader, mode, vector1, vector2, operationBox, results); 

    document.body.appendChild(vectorWindow);
    makeDraggable(vectorHeader, vectorWindow);
}

