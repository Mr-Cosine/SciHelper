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

function solve(rawPolynomials, mandatoryNum = false) {
    const epsi = 0.000001;
    let result = [];
    let polynomials = [];
    let exactRoot = false;

    if (rawPolynomials.length === 0) return {'roots': ['blnk'], 'exactRoot': false};
    for (let term of rawPolynomials) {
        if (term.coeff === null || term.exp === null || term.coeff === "" || term.exp === "") return {'roots': ['blnk'], 'exactRoot': false};

        let c = parseFloat(term.coeff);
        let e = parseInt(term.exp);

        if (isNaN(c) || isNaN(e)) return {'roots': ['ilgl'], 'exactRoot': false};
        if (e > 40) return {'roots': ['big'], 'exactRoot': false};
        if (c !== 0) polynomials.push({ coeff: c, exp: e });
    }

    polynomials.sort((a, b) => b.exp - a.exp);

    if (polynomials[0].exp === 1 && !mandatoryNum) {result = getExactRoot(polynomials); exactRoot = true;}
    else if (polynomials[0].exp === 2 && !mandatoryNum) {result = getExactRoot(polynomials); exactRoot = true;}
    else {
        const range = getBound(polynomials);
        let derivative = ddx(polynomials);

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
        exactRoot = false;
    }

    return {'roots': result, 'exactRoot': exactRoot};
}

function getExactRoot(polynomials) {
    polynomials.sort((a, b) => b.exp - a.exp);
    if (polynomials[0].exp <= 0 || polynomials[0].exp > 2) return 'err';

    let a = 0, b = 0, c = 0;

    for (let term of polynomials) {
        if (term.exp === 2) a += term.coeff;
        else if (term.exp === 1) b += term.coeff;
        else if (term.exp === 0) c += term.coeff;
    }

    if (a === 0) {
        if (b === 0) return [];
        else if (c === 0) return [0];
        else {let result = '-' + Math.abs(c).toString() + '/' + Math.abs(b).toString(); return (c*b < 0)? '-' + result: result;}
    }
    else {
        let sqrtContent = b**2 - 4 * a * c;
        if (sqrtContent < 0) return [];
        else if (sqrtContent === 0) return [0];

        else {
            let result = ' √ ' + sqrtContent + ((b<0)? ' - ' + Math.abs(b): ' + ' + Math.abs(b)).toString() + ' ) / ' + Math.abs(2*a).toString();

            function trimZero (expr) {
                return expr
                    .replace(/\s*[+-]\s*0\s*/g, '')
                    .replace(/^0\s*[+-]\s*/, '')
                    .replace(/[+-]\s*$/, '')
                    .replace(/\s*([+-])\s*/, '$1')
                    .trim();
            }

            result = trimZero(result);

            let result1 = result;
            let result2 = result;
            if (2*a < 0) {result1 = ' ( - ' + result1; result2 = " ( " + result2;}
            else {result1 = ' ( ' + result1; result2 = ' ( - ' + result2;}
            return [result1.replace(/\s/g, ''), result2.replace(/\s/g, '')];
        }
    }
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
    if (document.getElementById('sci-gen')) return;

    let state_gen = {
        polySolver: false,
        plotter: false
    }
    
    var genWindow = document.createElement('div');
    genWindow.setAttribute('id', 'sci-gen');
    
    var genHeader = document.createElement('div');
    genHeader.setAttribute('id', 'sci-gen-header');
    genHeader.textContent = 'General Toolbox';
    genHeader.classList.add('no-select');

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-gen-btncontainer');

    var btncolor = '#cfe084';
    fnButtonContainer.appendChild(createFnBtn_gen('Polynomial solver', '🧮', btncolor, 'polySolver', outputLoc, state_gen));
    fnButtonContainer.appendChild(createFnBtn_gen('Function/data plotter', '📈', btncolor, 'plotter', outputLoc, state_gen))

    genWindow.appendChild(genHeader);
    genWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(genWindow);

    return true;
}

function closeGenWindow() {
    let toolWindow = document.getElementsByClassName('sci-gen-tool');
    while (toolWindow.length > 0) {toolWindow[0].remove();}
    document.getElementById('sci-gen')?.remove();

    return false;
}

function createFnBtn_gen(name, symbol, color, id, outputLoc, state_gen) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-gen-btn');
    btn.style.backgroundColor = '#f9f9f9';
    btn.id = id;
    btn.color = color;

    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-gen-btn-symbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        switch (id) {
            case 'polySolver':
                var existingWindow = document.getElementById('sci-gen-poly');
                if (!existingWindow) {openPolyWindow(outputLoc); state_gen.polySolver = true;}
                else {existingWindow.remove(); state_gen.polySolver = false;}
                break;

            case 'plotter':
                var existingWindow = document.getElementById('sci-gen-plot');
                if (!existingWindow) {openPlotterWindow(outputLoc); state_gen.plotter = true;}
                else {existingWindow.remove(); state_gen.plotter = false;}
                break;
                
            default: break;
        }

        refreshBtnDisp(btn.className, state_gen);
    });

    return btn;
}

// --- Polynomials Solver ---
function openPolyWindow(outputLoc) {
    if (document.getElementById('sci-gen-poly')) return;

    var polyWindow = document.createElement('div');
    polyWindow.setAttribute('id', 'sci-gen-poly');
    polyWindow.setAttribute('class', 'sci-gen-tool');

    var header = document.createElement('div');
    header.setAttribute('class', 'sci-gen-tool-header');
    header.textContent = 'Polynomial solver';
    header.classList.add('no-select');  

    var inputContainer = document.createElement('div');
    inputContainer.setAttribute('class', 'sci-gen-poly-input');
    var rowID = 1;
    var row1 = createPolyInput('a' + rowID, 2); rowID++;
    var row2 = createPolyInput('a' + rowID, 1); rowID++;
    inputContainer.append(row1, row2);

    var addRowBtn = document.createElement('button');
    addRowBtn.setAttribute('id', 'sci-gen-poly-addrow');
    addRowBtn.textContent = '+';
    addRowBtn.addEventListener('click', function() {
        rowID = document.getElementsByClassName(row1.className).length + 1;
        inputContainer.append(createPolyInput('a' + rowID));
    });

    var solveBtn = document.createElement('button');
    solveBtn.setAttribute('id', 'sci-gen-poly-confirm');
    solveBtn.textContent = 'Solve polynomials';

    var result = document.createElement('div');
    result.setAttribute('class', 'sci-gen-tool-result');
    result.textContent = '𝑥 =';

    solveBtn.addEventListener('click', function() {
        result.textContent = '';
        let rows = document.getElementsByClassName(row1.className);
        let polynomials = [{coeff: parseFloat(-1 * row1.constant.value), exp: 0}];
        for (let row of rows) {
            let coefficient = row.coefficient.value;
            let exponent = row.exponent.value;
            polynomials.push({ coeff: coefficient, exp: exponent });
        }

        let {roots, exactRoot} = solve(polynomials);
        roots = roots.map(root => {
            if (isNum(root)) {
                let rounded = Math.round(root);
                if (Math.abs(rounded - root) < 1e-6) {
                    return rounded;
                }
                return root.toFixed(3);
            }
            else {
                return root;
            }
        });
            
        if (roots.length === 0) result.textContent = 'No real roots';
        else if (roots[0] == 'ilgl') result.textContent = 'Illegal characters present.';
        else if (roots[0] == 'big') result.textContent = 'Exponent too big.';
        else if (roots[0] == 'blnk') result.textContent = 'Incomplete expression, fill all blank spaces.';
        else {
            result.innerHTML = ''; 

            let textSpan = document.createElement('span');
            textSpan.textContent = '𝑥 = ' + roots.join(', ');
            result.appendChild(textSpan);

            if (exactRoot) {
                let changeform = document.createElement('div');
                changeform.setAttribute('class', 'sci-gen-poly-result-changeform');
                changeform.textContent = 'Num';
                
                let showingExact = true;

                changeform.addEventListener('click', function() {
                    showingExact = !showingExact;

                    let {roots, exactRoot} = solve(polynomials, !showingExact);
                        roots = roots.map(root => {
                            if (isNum(root)) {
                                let rounded = Math.round(root);
                                if (Math.abs(rounded - root) < 1e-6) {
                                    return rounded;
                                }
                                return root.toFixed(3);
                            }
                            else {
                                return root;
                            }
                        });

                    textSpan.textContent = '𝑥 = ' + roots.join(', ');
                    changeform.textContent = showingExact ? 'Num' : 'Exact';
                });

                result.appendChild(changeform);
            }
}
    });

    polyWindow.append(header, inputContainer, addRowBtn, solveBtn, result);
    makeDraggable(header, polyWindow);

    document.body.appendChild(polyWindow);

    return;
}

function createPolyInput(rowID, defaultExponent = 'n') {
    var row = document.createElement('div');
    row.setAttribute('class', 'sci-gen-poly-row');
    row.rowID = 'a' + rowID;

    var inputSection = document.createElement('div');
    inputSection.setAttribute('class', 'sci-gen-poly-row-section');

    var constant = document.createElement('input');
    constant.setAttribute('type', 'text');
    constant.setAttribute('placeholder', 'c');
    constant.setAttribute('class', 'sci-gen-poly-row-section-constant');
    
    var equalSign = document.createElement('span');
    equalSign.textContent = ' = ';
    equalSign.setAttribute('class', 'sci-gen-poly-row-section-equalsign');

    var coefficient = document.createElement('input');
    coefficient.setAttribute('type', 'text');
    coefficient.setAttribute('placeholder', rowID);
    coefficient.setAttribute('class', 'sci-gen-poly-row-section-coeff');

    var variable = document.createElement('span');
    variable.textContent = '𝑥';
    variable.setAttribute('class', 'sci-gen-poly-row-section-variable');

    var exponent = document.createElement('input');
    exponent.setAttribute('type', 'text');
    exponent.setAttribute('placeholder', 'n');
    exponent.setAttribute('class', 'sci-gen-poly-row-section-exponent');
    if (defaultExponent !== 'n') {exponent.value = defaultExponent;}


    var removeBtn = document.createElement('button');
    removeBtn.setAttribute('class', 'sci-gen-poly-row-remove');
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

function openPlotterWindow(outputLoc) {
    if (document.getElementById('sci-gen-plot')) return;

    var plotWindow = document.createElement('div');
    plotWindow.setAttribute('id', 'sci-gen-plot');
    plotWindow.setAttribute('class', 'sci-gen-tool');

    var header = document.createElement('div');
    header.setAttribute('class', 'sci-gen-tool-header');
    header.textContent = 'Function/Data Plotter';
    header.classList.add('no-select');

    var inputSection = document.createElement('div');
    inputSection.setAttribute('id', 'sci-gen-plot-input')
    var dimension = document.createElement('select');
    dimension.setAttribute('id', 'sci-gen-plot-input-dim');
    let options = [
        {text: 'f(x) =', value: '2D'},
        {text: 'f(x,y) =', value: '3D'}
    ];
    options.forEach(opt => {
        let el = document.createElement('option');
        el.text = opt.text;
        el.value = opt.value;
        dimension.appendChild(el);
    });
    var functionInput = document.createElement('input');
    functionInput.setAttribute('id', 'sci-gen-plot-input-input');
    var inputConfirm = document.createElement('div');
    inputConfirm.setAttribute('id', 'sci-gen-plot-input-btn')
    inputConfirm.textContent = "Plot";
    inputSection.append(dimension, functionInput, inputConfirm);

    const canva = document.createElement('canvas');
    canva.setAttribute('class', 'sci-gen-plot-canvas');
    canva.setAttribute('width', '400');
    canva.setAttribute('height', '400');
    const gl = canva.getContext('webgl');

    inputConfirm.addEventListener('click', function() {
        if (functionInput.value) {
            let points = calculatePoints(functionInput.value, dimension.value === '2D'? 2: 3);
        
            console.log(points);
            if (dimension.value === '2D') {
                plot2D(point, canva);
            }
            else if (dimension.value === '3D') {
                plot3D(points, canva);
            }
        }
        
    });

    plotWindow.append(header, inputSection, canva);
    makeDraggable(header, plotWindow);
    document.body.appendChild(plotWindow);
}

function calculatePoints(expression, dimension, lo = [-10, -10], hi = [10, 10], step = 0.001) {
    const processedExpr = processExpr(expression, dimension);
    if (processedExpr.varLst[0] === 'INVALID') return [];

    let points = [];
    const vars = processedExpr.varLst;      // e.g., [] or ['x'] or ['x','y']
    const postfix = processedExpr.expression;

    if (dimension === 2) {  // Expect 1 variable, but may have 0
        const lowerX = lo[0], upperX = hi[0];
        const xVar = vars[0];  // may be undefined if no variable
        for (let xVal = lowerX; xVal <= upperX + step/2; xVal += step) {
            const postfixWithValues = postfix.map(tok => {
                if (xVar !== undefined && tok === xVar) return xVal;
                return tok;
            });
            const y = evaluate(postfixWithValues);
            points.push({ x: xVal, y: y });
        }
    } else {  // dimension === 3 (or higher later) – Expect 2 variables, but may have 0 or 1
        const lowerX = lo[0], upperX = hi[0];
        const lowerY = lo[1], upperY = hi[1];
        const xVar = vars[0];  // may be undefined
        const yVar = vars[1];  // may be undefined
        for (let xVal = lowerX; xVal <= upperX + step/2; xVal += step) {
            for (let yVal = lowerY; yVal <= upperY + step/2; yVal += step) {
                const postfixWithValues = postfix.map(tok => {
                    if (xVar !== undefined && tok === xVar) return xVal;
                    if (yVar !== undefined && tok === yVar) return yVal;
                    return tok;
                });
                const z = evaluate(postfixWithValues);
                points.push({ x: xVal, y: yVal, z: z });
            }
        }
    }
    return points;
}

function processExpr(expression, dimension) {
    // Tokenizer (unchanged)
    const regex = /(\d+(?:\.\d+)?)|([a-zA-Z]+)|([+\-*/^()])|(\s+)/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(expression)) !== null) {
        if (match[4]) continue;
        if (match[1]) tokens.push(parseFloat(match[1]));
        else if (match[2]) tokens.push(match[2]);
        else if (match[3]) tokens.push(match[3]);
    }

    const rawTokens = tokens.filter(t => t !== " ");
    const validExprKey = ['+', '-', '*', '/', '^', 'ln', 'e', 'sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'asin', 'acos', 'atan'];

    const unknownVar = new Set();
    for (let token of rawTokens) {
        let isKey = false;
        for (let keywd of validExprKey) {
            if (token === keywd) isKey = true;
        }
        if (!isKey && typeof token === 'string' && !/^\d+$/.test(token)) {
            unknownVar.add(token);
        }
    }

    const varList = [...unknownVar];

    if (varList.length >= dimension) {
        return { varLst: ['INVALID'], expression: [] };
    }

    const postfix = infixToPostfix(rawTokens);
    return { varLst: varList, expression: postfix };
}

function plot2D(points, canva) {

}

function plot3D(points, canva) {
    const vertexShader = createVShader();
    const fragmentShader = createFShader();
}
function createVShader() {
return `
    #version 300 es
    in vec3 aPosition;
    in vec3 aColor
    vec4 aWorldPos = vec4(aPosition, 1.0);
    uniform mat4 uView;
    uniform mat4 uProjection;
    
    void main() {
        vWorldPos = aPosition;
        vColor = aColor;
        gl_Position = uProjection * uView * aWorldPos;
    }
`
}

function createFShader() {
return `
    #version 300 es
    precision highp float;
    in vec3 vColor;
    in vec3 vWorldPos;
    uniform vec3 uCamPosition;
    out vec4 FragColor;

    void main() {
        float dist = length(vWorldPos - uCamPosition);
        float alpha = 1.0 / (dist + 0.001);
        FragColor = vec4(vColor, alpha);
    }
    `
}

function u_View(camPos, camTarget) {
    const view = mat4.create();
    const up = [0, 1, 0];
    mat4.lookAt(view, camPos, camTarget, up);

    return view
}

function u_Projection(FOV = 45, canvaWidth = 400, canvaHeight = 400) {
    const proj = mat4.create();
    const fov = FOV / 180 * Math.PI;
    const aspect = canvaWidth / canvaHeight;
    const near = 0.1;
    const far = 100.0;
    mat4.perspective(proj, fov, aspect, near, far);

    return proj
}