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

function calculatePoints(expression, dimension, x, y, defaultStep = 0.001) {
    const processedExpr = processExpr(expression, dimension);
    if (processedExpr[0] === 'INVALID') return [];

    let points = [];

    if (dimension == 2) {
        const lowerX = x[0], upperX = x[1]; 
        if (!isNum(lowerX) || !isNum(upperX) || lowerX >= upperX) return [];

        let step = defaultStep;
        const maxStep = Math.abs(y[1] - y[0])/2000;
        const minStep = 1e-6;

        let prevPoint = { x: lowerX-0.001, y: evaluate(processedExpr.map(tok => {if (tok === 'x' || tok === 'X') return lowerX-0.001; else return tok;})) };
        
        for (let xVal = lowerX; xVal <= upperX + step/2;) {
            const postfixWithValues = processedExpr.map(tok => {
                if (tok === 'x' || tok === 'X') return xVal;
                else return tok;
            });
            let yVal = evaluate(postfixWithValues);

            if (isNum(yVal)) {
                step = Math.min(maxStep, Math.max(1/Math.abs((yVal - prevPoint.y)/(xVal - prevPoint.x)) * 0.05, minStep));
                points.push({ x: xVal, y: yVal });
                prevPoint = { x: xVal, y: yVal };
            }

            xVal += step;
        }
        return points;
    } 
    else {
        const lowerX = x[0], upperX = x[1];
        const lowerY = y[0], upperY = y[1];
        if (!isNum(lowerX) || !isNum(upperX) || lowerX >= upperX) return [];
        if (!isNum(lowerY) || !isNum(upperY) || lowerY >= upperY) return [];

        let step = min(Math.abs(y[1] - y[0]), Math.abs(x[1] - x[0]))/2000;

        for (let xVal = lowerX; xVal <= upperX + step/2; xVal += step) {
            for (let yVal = lowerY; yVal <= upperY + step/2;) {
                const postfixWithValues = processedExpr.map(tok => {
                    if (tok === 'x' || tok === 'X') return xVal;
                    else if (tok === 'y' || tok === 'Y') return yVal;
                    else return tok;
                });

                let zVal = evaluate(postfixWithValues);
                if (isNum(zVal)) points.push({ x: xVal, y: yVal, z: zVal, step: step });
                yVal += step
            }
        }
        return points;
    }
}

function processExpr(expression, dimension) {
    const regex = /(\d+(?:\.\d+)?)|([a-zA-Z]+)|([+\-*/^()])|(\s+)/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(expression)) !== null) {
        if (match[4]) continue;
        if (match[1]) tokens.push(parseFloat(match[1]));
        else if (match[2]) tokens.push(match[2]);
        else if (match[3]) tokens.push(match[3]);
    }

    const rawTokens = tokens.filter(t => t !== " ").map(t => (typeof t === 'string' && t === 'X') ? 'x' : t);
    const ops = new operators();

    const unknownVar = new Set();
    for (let token of rawTokens) {
        if (!ops.isOperator(token) && typeof token === 'string' && !/^\d+$/.test(token)) {
            unknownVar.add(token);
        }
    }
    const varList = [...unknownVar]
    if (varList.length >= dimension) return { varLst: ['INVALID'], expression: [] };
    if (dimension == 2 && varList.filter(v => (v.length > 1 || !v.includes("x"))).length > 0) return ['INVALID'];
    if (dimension == 3 && varList.filter(v => (v.length > 1 || (!v.includes("x") && !v.includes("y")))).length > 0) return ['INVALID'];

    return infixToPostfix(rawTokens);
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

    var functionInput = document.createElement('div');
    functionInput.setAttribute('id', 'sci-gen-plot-input-function')
    var dimension = document.createElement('select');
    dimension.setAttribute('id', 'sci-gen-plot-input-function-dim');
    let options = [
        {text: 'f(x) =', value: 2},
        {text: 'f(x,y) =', value: 3}
    ];
    options.forEach(opt => {
        let el = document.createElement('option');
        el.text = opt.text;
        el.value = opt.value;
        dimension.appendChild(el);
    });
    var expression = document.createElement('input');
    expression.setAttribute('id', 'sci-gen-plot-input-function-expr');
    var inputConfirm = document.createElement('div');
    inputConfirm.setAttribute('id', 'sci-gen-plot-input-function-confirm')
    inputConfirm.textContent = "Plot";
    functionInput.append(dimension, expression, inputConfirm);

    var rangeInput = document.createElement('div');
    rangeInput.setAttribute('id', 'sci-gen-plot-input-range');
    var xrange = document.createElement('div');
    xrange.setAttribute('class', 'sci-gen-plot-input-range-var');
    xrange.setAttribute("id", "x");
    var xlabel = document.createElement('div');
    xlabel.setAttribute('class',  'sci-gen-plot-input-range-label');
    xlabel.textContent = 'x range:';
    var xmin = document.createElement('input');
    xmin.setAttribute('class',  'sci-gen-plot-input-range-min');
    xmin.value = "-10";
    xmin.type = "number";
    var xmax = document.createElement('input');
    xmax.setAttribute('class',  'sci-gen-plot-input-range-max');
    xmax.value = "10";
    xmax.type = "number";
    var connlabel = document.createElement('div');
    connlabel.setAttribute('class', 'sci-gen-plot-input-range-label');
    connlabel.textContent = '~';

    var yrange = document.createElement('div');
    yrange.setAttribute('class', 'sci-gen-plot-input-range-var');
    yrange.setAttribute('id', 'y');
    var ylabel = document.createElement('div');
    ylabel.setAttribute('class',  'sci-gen-plot-input-range-label');
    ylabel.textContent = 'y range:';
    var ymin = document.createElement('input')
    ymin.setAttribute('class',  'sci-gen-plot-input-range-min');
    ymin.value = "-10";
    ymin.type = "number";
    var ymax = document.createElement('input');
    ymax.setAttribute('class',  'sci-gen-plot-input-range-max');
    ymax.value = "10";
    ymax.type = "number";

    xrange.append(xlabel, xmin, connlabel.cloneNode(true), xmax);
    yrange.append(ylabel, ymin, connlabel.cloneNode(true), ymax);

    rangeInput.append(xrange, yrange);
    
    inputSection.append(functionInput, rangeInput);
    

    var graphSection = document.createElement('div');
    graphSection.setAttribute('id', 'sci-gen-plot-canvas');
    const graph = document.createElement('canvas');
    graph.setAttribute('id', 'sci-gen-plot-canvas-canvas');
    graph.setAttribute('width', '840');
    graph.setAttribute('height', '840');
    graphSection.append(graph);

    let plot = () => {
        console.log(isNum(xmin.value))
        console.log(xmin.value)
        if (expression.value && dimension.value && isNum(xmin.value) && isNum(xmax.value)) {
            let xspan = [parseFloat(xmin.value), parseFloat(xmax.value)];
            let yspan = [null, null];

            if (dimension.value == 2) {
                if (isNum(ymin.value) && isNum(ymax.value)) yspan = [parseFloat(ymin.value), parseFloat(ymax.value)];
                console.log('y')
                let points = calculatePoints(expression.value, dimension.value, xspan, yspan);
                plot2D(points, graph, xspan, yspan);
            }
            else {
                if (isNum(ymin.value) && isNum(ymax.value)) yspan = [parseFloat(ymin.value), parseFloat(ymax.value)];
                console.log('y')
                let points = calculatePoints(expression.value, dimension.value, xspan, yspan);
                plot3D(points, graph, xspan, yspan);
            }
        }
    }
    inputConfirm.addEventListener('click', plot);

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let startRanges = { xmin: 0, xmax: 0, ymin: 0, ymax: 0 };

    // Panning: start drag on mousedown
    graphSection.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        // Store current ranges at drag start
        startRanges.xmin = parseFloat(xmin.value);
        startRanges.xmax = parseFloat(xmax.value);
        startRanges.ymin = parseFloat(ymin.value);
        startRanges.ymax = parseFloat(ymax.value);
        e.preventDefault(); // prevent text selection
    });

    // Panning: update ranges while dragging
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        // Convert pixel movement to data units
        const canvasRect = graphSection.getBoundingClientRect();
        const width = canvasRect.width;
        const height = canvasRect.height;
        
        const xRange = startRanges.xmax - startRanges.xmin;
        const yRange = startRanges.ymax - startRanges.ymin;
        
        const xDelta = (dx / width) * xRange;
        const yDelta = (dy / height) * yRange;
        
        // Update input fields (note: y axis is inverted because canvas Y goes down)
        xmin.value = startRanges.xmin - xDelta;
        xmax.value = startRanges.xmax - xDelta;
        ymin.value = startRanges.ymin + yDelta;
        ymax.value = startRanges.ymax + yDelta;
        
        plot();
    });

    // End dragging on mouseup
    document.addEventListener('mouseup', () => { isDragging = false; });

    // Zoom with wheel (centered)
    graphSection.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.1 : 0.9; // scroll down = zoom out, up = zoom in
        
        const xminVal = parseFloat(xmin.value);
        const xmaxVal = parseFloat(xmax.value);
        const yminVal = parseFloat(ymin.value);
        const ymaxVal = parseFloat(ymax.value);
        
        const xCenter = (xminVal + xmaxVal) / 2;
        const yCenter = (yminVal + ymaxVal) / 2;
        const xRange = (xmaxVal - xminVal) * factor;
        const yRange = (ymaxVal - yminVal) * factor;
        
        xmin.value = xCenter - xRange / 2;
        xmax.value = xCenter + xRange / 2;
        ymin.value = yCenter - yRange / 2;
        ymax.value = yCenter + yRange / 2;
        
        plot();
    }, { passive: false });

    plotWindow.append(header, inputSection, graphSection);
    makeDraggable(header, plotWindow);
    document.body.appendChild(plotWindow);
}

function plot2D(points, canvas, xrange, yrange) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    const CANVAS_YSTART = 0;
    const CANVAS_YEND = canvas.height;
    const CANVAS_XSTART = 0;
    const CANVAS_XEND = canvas.width;
    const CANVAS_XCENTER = canvas.width/2;
    const CANVAS_YCENTER = canvas.height/2;

    const validPoints = points.filter(p => isFinite(p.x) && isFinite(p.y));
    if (validPoints.length === 0) {
        ctx.fillStyle = 'red';
        ctx.font = "20px sans-serif";
        ctx.textAlign = "middle";
        ctx.fillText('No valid points', CANVAS_XCENTER, CANVAS_YCENTER);
        return;
    }

    function line(x1, y1, x2, y2, lineWidth = 1, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function XYaxis(lineWidth = 1, color = "#ccc") {
        function tickStep(range, desiredTickCount) { return range / desiredTickCount; }

        let MIN_X = xrange[0];
        let MAX_X = xrange[1];

        let MIN_Y = yrange[0];
        let MAX_Y = yrange[1];

        const tickStepX = tickStep(MAX_X - MIN_X, 10);
        const tickStepY = tickStep(MAX_Y - MIN_Y, 10);
        const tickLen = canvas.width * 0.02;   
        ctx.fillStyle = "#ccc";
        ctx.font = `${canvas.width * 0.03}px sans-serif`;
        const tickFontDeviate = canvas.width * 0.02;

        let existedZero = false;
        // Y axis
        if (MIN_X * MAX_X < 0) {
            line(canvasX(0), CANVAS_YSTART, canvasX(0), CANVAS_YEND, lineWidth, color);

            ctx.textAlign = "right";
            ctx.textBaseline = 'middle';
            if (canvasY(0) < CANVAS_YEND) {
                for (let y = canvasY(0); y <= CANVAS_YEND + tickStepY * scaleY / 2; y += tickStepY * scaleY) {
                    line(canvasX(0)- tickLen/2, y, canvasX(0)+ tickLen/2, y, lineWidth, color);
                    let val = realY(y);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);``
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, canvasX(0) - tickFontDeviate, y)
                    else if (!existedZero) { ctx.fillText(val, canvasX(0) - tickFontDeviate, y + tickFontDeviate); existedZero = true; }
                    else continue;
                }
            }
            if (canvasY(0) > CANVAS_YSTART) {
                for (let y = canvasY(0); y >= CANVAS_YSTART - tickStepY * scaleY / 2; y -= tickStepY * scaleY) {
                    line(canvasX(0)- tickLen/2, y, canvasX(0)+ tickLen/2, y, lineWidth, color);
                    let val = realY(y);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, canvasX(0) - tickFontDeviate, y)
                    else if (!existedZero) { ctx.fillText(val, canvasX(0) - tickFontDeviate, y + tickFontDeviate); existedZero = true; }
                    else continue;
                }
            }
        }
        ctx.textAlign = "left";
        ctx.textBaseline = 'top';
        ctx.fillText("y", CANVAS_XSTART + 10, CANVAS_YSTART + 10);

        // X axis
        if (MIN_Y * MAX_Y < 0) {
            line(CANVAS_XSTART, canvasY(0), CANVAS_XEND, canvasY(0), lineWidth, color);

            ctx.textAlign = "middle";
            ctx.textBaseline = 'top';
            if (canvasX(0) < CANVAS_XEND) {
                for (let x = canvasX(0); x <= CANVAS_XEND + tickStepX * scaleX / 2; x += tickStepX * scaleX) {
                    line(x, canvasY(0)- tickLen/2, x, canvasY(0)+ tickLen/2, lineWidth, color);
                    let val = realX(x);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, x, canvasY(0) + tickFontDeviate);
                    else if (!existedZero) ctx.fillText(val, x - tickFontDeviate, canvasY(0) + tickFontDeviate);
                    else continue;
                }
            }
            if (canvasX(0) > CANVAS_XSTART) {
                for (let x = canvasX(0); x >= CANVAS_XSTART - tickStepX * scaleX / 2; x -= tickStepX * scaleX) {
                    line(x, canvasY(0)- tickLen/2, x, canvasY(0)+ tickLen/2, lineWidth, color);
                    let val = realX(x);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, x, canvasY(0) + tickFontDeviate);
                    else if (!existedZero) ctx.fillText(val, x - tickFontDeviate, canvasY(0) + tickFontDeviate);
                    else continue;
                }
            }
        }
        ctx.textAlign = "right";
        ctx.textBaseline = 'bottom';
        ctx.fillText("x", CANVAS_XEND - 10, CANVAS_YEND - 10);
    }

    let MIN_X = xrange[0];
    let MAX_X = xrange[1];

    let MIN_Y = yrange[0];
    let MAX_Y = yrange[1];

    if ( MIN_Y === null || MAX_Y === null) {
        MIN_Y = Math.min(...validPoints.map(p => p.y));
        MAX_Y = Math.max(...validPoints.map(p => p.y));
        const MIN_PADDING = 2;
        MAX_Y += (Math.abs(MAX_Y * 0.1) > MIN_PADDING)? (MAX_Y * 0.1) : MIN_PADDING;
        MIN_Y -= (Math.abs(MIN_Y * 0.1) > MIN_PADDING)? (MIN_Y * 0.1) : MIN_PADDING;
    }

    let scaleX = canvas.width / (MAX_X - MIN_X);
    let scaleY = canvas.height / (MAX_Y - MIN_Y);

    function canvasX(x) {return (x - MIN_X) * scaleX; }
    function canvasY(y) { return CANVAS_YEND - (y - MIN_Y) * scaleY; }
    function realX(canvasX) { return canvasX / scaleX + MIN_X; }
    function realY(canvasY) { return (CANVAS_YEND - canvasY) / scaleY + MIN_Y; }

    XYaxis(1, "#ccc");
    
    const MAX_SLOPE = 1e6;  // tune this based on your data's typical max finite slope
    let prev = validPoints[0];
    validPoints.pop(0);
    for (let curr of validPoints) {
        let dx = curr.x - prev.x;
        if (dx === 0) { line(canvasX(curr.X), CANVAS_YSTART, canvasX(curr.X), CANVAS_YEND, 1, "#444"); continue; }
 
        let slope = Math.abs((curr.y - prev.y) / dx);
        if (slope < MAX_SLOPE) line(canvasX(prev.x), canvasY(prev.y), canvasX(curr.x), canvasY(curr.y), 1, "#444");
        prev = curr;
    }
}

function plot3D(points, canvas, xrange, yrange) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    const CANVAS_YSTART = 0;
    const CANVAS_YEND = canvas.height;
    const CANVAS_XSTART = 0;
    const CANVAS_XEND = canvas.width;
    const CANVAS_XCENTER = canvas.width/2;
    const CANVAS_YCENTER = canvas.height/2;

    const validPoints = points.filter(p => isFinite(p.x) && isFinite(p.y) && isFinite(p.z));
    if (validPoints.length === 0) {
        ctx.fillStyle = 'red';
        ctx.font = "20px sans-serif";
        ctx.textAlign = "middle";
        ctx.fillText('No valid points', CANVAS_XCENTER, CANVAS_YCENTER);
        return;
    }

    function line(x1, y1, x2, y2, lineWidth = 1, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function XYaxis(lineWidth = 1, color = "#ccc") {
        function tickStep(range, desiredTickCount) { return range / desiredTickCount; }

        let MIN_X = xrange[0];
        let MAX_X = xrange[1];

        let MIN_Y = yrange[0];
        let MAX_Y = yrange[1];

        const tickStepX = tickStep(MAX_X - MIN_X, 10);
        const tickStepY = tickStep(MAX_Y - MIN_Y, 10);
        const tickLen = canvas.width * 0.02;   
        ctx.fillStyle = "#ccc";
        ctx.font = `${canvas.width * 0.03}px sans-serif`;
        const tickFontDeviate = canvas.width * 0.02;

        let existedZero = false;
        // Y axis
        if (MIN_X * MAX_X < 0) {
            line(canvasX(0), CANVAS_YSTART, canvasX(0), CANVAS_YEND, lineWidth, color);

            ctx.textAlign = "right";
            ctx.textBaseline = 'middle';
            if (canvasY(0) < CANVAS_YEND) {
                for (let y = canvasY(0); y <= CANVAS_YEND + tickStepY * scaleY / 2; y += tickStepY * scaleY) {
                    line(canvasX(0)- tickLen/2, y, canvasX(0)+ tickLen/2, y, lineWidth, color);
                    let val = realY(y);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);``
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, canvasX(0) - tickFontDeviate, y)
                    else if (!existedZero) { ctx.fillText(val, canvasX(0) - tickFontDeviate, y + tickFontDeviate); existedZero = true; }
                    else continue;
                }
            }
            if (canvasY(0) > CANVAS_YSTART) {
                for (let y = canvasY(0); y >= CANVAS_YSTART - tickStepY * scaleY / 2; y -= tickStepY * scaleY) {
                    line(canvasX(0)- tickLen/2, y, canvasX(0)+ tickLen/2, y, lineWidth, color);
                    let val = realY(y);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, canvasX(0) - tickFontDeviate, y)
                    else if (!existedZero) { ctx.fillText(val, canvasX(0) - tickFontDeviate, y + tickFontDeviate); existedZero = true; }
                    else continue;
                }
            }
        }
        ctx.textAlign = "left";
        ctx.textBaseline = 'top';
        ctx.fillText("y", CANVAS_XSTART + 10, CANVAS_YSTART + 10);

        // X axis
        if (MIN_Y * MAX_Y < 0) {
            line(CANVAS_XSTART, canvasY(0), CANVAS_XEND, canvasY(0), lineWidth, color);

            ctx.textAlign = "middle";
            ctx.textBaseline = 'top';
            if (canvasX(0) < CANVAS_XEND) {
                for (let x = canvasX(0); x <= CANVAS_XEND + tickStepX * scaleX / 2; x += tickStepX * scaleX) {
                    line(x, canvasY(0)- tickLen/2, x, canvasY(0)+ tickLen/2, lineWidth, color);
                    let val = realX(x);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, x, canvasY(0) + tickFontDeviate);
                    else if (!existedZero) ctx.fillText(val, x - tickFontDeviate, canvasY(0) + tickFontDeviate);
                    else continue;
                }
            }
            if (canvasX(0) > CANVAS_XSTART) {
                for (let x = canvasX(0); x >= CANVAS_XSTART - tickStepX * scaleX / 2; x -= tickStepX * scaleX) {
                    line(x, canvasY(0)- tickLen/2, x, canvasY(0)+ tickLen/2, lineWidth, color);
                    let val = realX(x);
                    if (Math.abs(Math.round(val) - val) < 1e-3) val = Math.round(val).toString();
                    else val = val.toFixed(2);
                    if (Math.abs(val) > 1e-6) ctx.fillText(val, x, canvasY(0) + tickFontDeviate);
                    else if (!existedZero) ctx.fillText(val, x - tickFontDeviate, canvasY(0) + tickFontDeviate);
                    else continue;
                }
            }
        }
        ctx.textAlign = "right";
        ctx.textBaseline = 'bottom';
        ctx.fillText("x", CANVAS_XEND - 10, CANVAS_YEND - 10);
    }

    let MIN_X = xrange[0];
    let MAX_X = xrange[1];

    let MIN_Y = yrange[0];
    let MAX_Y = yrange[1];

    let MIN_Z = validPoints[0].z;
    let MAX_Z = validPoints[0].z;
    for (let point of validPoints) {
        if (point.z < MIN_Z) MIN_Z = point.z;
        if (point.z > MAX_Z) MAX_Z = point.z;
    }

    let scaleX = canvas.width / (MAX_X - MIN_X);
    let scaleY = canvas.height / (MAX_Y - MIN_Y);

    function canvasX(x) {return (x - MIN_X) * scaleX; }
    function canvasY(y) { return CANVAS_YEND - (y - MIN_Y) * scaleY; }
    function realX(canvasX) { return canvasX / scaleX + MIN_X; }
    function realY(canvasY) { return (CANVAS_YEND - canvasY) / scaleY + MIN_Y; }

    const viridisMapping = new viridis();
    const maxZMag = Math.max( Math.abs(MIN_X), Math.abs(MAX_X), Math.abs(MIN_Y), Math.abs(MAX_Y) );
    const minColor = (MIN_Z < 0)? -Math.min(maxZMag, Math.abs(MIN_Z)): Math.min(maxZMag, Math.abs(MIN_Z));
    const maxColor = (MAX_Z < 0)? -Math.min(maxZMag, Math.abs(MAX_Z)): Math.min(maxZMag, Math.abs(MAX_Z));

    for (let point of validPoints) {
        const color = viridisMapping.mapColor(minColor, maxColor, point.z);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(canvasX(point.x - point.step/2), canvasY(point.y + point.step/2), point.step*scaleX, point.step*scaleY);
    }

    XYaxis(1, "#ccc");
}

/*
function plot3D(points, canvas) {
    const vertexShader = createVShader();
    const fragmentShader = createFShader();
}s

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
    */