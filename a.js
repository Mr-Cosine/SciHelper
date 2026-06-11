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
        if (expression.value && dimension.value && isNum(xmin.value) && isNum(xmax.value) && isNum(ymin.value) && isNum(ymax.value)) {
            let DESIRED_SAMPLE = 2000;
            let xspan = [null, null]; let yspan = [null, null];

            xspan = [parseFloat(xmin.value), parseFloat(xmax.value)];
            yspan = [parseFloat(ymin.value), parseFloat(ymax.value)];
            step = Math.min(Math.abs(yspan[1] - yspan[0]), Math.abs(xspan[1] - xspan[0]))/DESIRED_SAMPLE;
            let points = calculatePoints(expression.value, dimension.value, xspan, yspan, step);

            if (dimension.value == 2) plot2D(points, graph, xspan, yspan);
            else plot3D(points, graph, xspan, yspan);
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
        xmin.value = Math.round((startRanges.xmin - xDelta) * 1000)/ 1000;
        xmax.value = Math.round((startRanges.xmax - xDelta) * 1000) / 1000;
        ymin.value = Math.round((startRanges.ymin + yDelta) * 1000) / 1000;
        ymax.value = Math.round((startRanges.ymax + yDelta) * 1000) / 1000;
        
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
        
        xmin.value = Math.round((xCenter - xRange / 2) * 1000)/ 1000;
        xmax.value = Math.round((xCenter + xRange / 2) * 1000)/ 1000;
        ymin.value = Math.round((yCenter - yRange / 2) * 1000)/ 1000;
        ymax.value = Math.round((yCenter + yRange / 2) * 1000)/ 1000;
        
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

            ctx.textAlign = "middle";
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
    console.log(points)
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

            ctx.textAlign = "middle";
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

    const viridisMapping = new viridisPlot();
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

function infixToPostfix(tokens) {
    const ops = new operators();
    let outputQueue = [];
    let operatorStack = [];

    for (let token of tokens) {
        if (isNum(token)) outputQueue.push(parseFloat(token));
        else if (token === '(') operatorStack.push(token);
        else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') { outputQueue.push(operatorStack.pop()); }
            operatorStack.pop(); 
            let top = operatorStack[operatorStack.length - 1];
            if (top && ops.isUnary(top)) outputQueue.push(operatorStack.pop());
        } 
        else if (ops.isOperator(token)) {
            const precToken = ops.precedence(token);
            while (operatorStack.length > 0) {
                let operator = operatorStack[operatorStack.length - 1];
                if (operator === '(') break;
                const precOp = ops.precedence(operator);
                if (precOp > precToken || (precOp === precToken && token !== '^')) outputQueue.push(operatorStack.pop());
                else break;
            }
            operatorStack.push(token);
        } 
        else outputQueue.push(token);
    }
    while (operatorStack.length > 0) { outputQueue.push(operatorStack.pop()); }
    return outputQueue;
}

function evaluate(postfix) {
    const ops = new operators();
    let stack = [];
    
    for (let token of postfix) {
        if (isNum(token)) {
            stack.push(token);
        }
        else if (ops.isBinary(token)) {
            if (stack.length < 2) return "Error";
            let b = stack.pop();
            let a = stack.pop();

            let result = ops.eval(a, token, b);
            if (!isNum(result) || !isFinite(result) || result === null) { return "Error"; }
            stack.push(result);
        }
        else if (ops.isUnary(token)) {
            if (stack.length < 1) return "Error";
            let a = stack.pop();

            let result = ops.eval(a, token);
            if (!isNum(result) || !isFinite(result) || result === null) { return "Error"; }
            stack.push(result);
        }
        else return "Error";
    }
    return (stack.length === 1)? stack[0] : "Error";
}

let plot = () => {
    if (expression.value && dimension.value && isNum(xmin.value) && isNum(xmax.value) && isNum(ymin.value) && isNum(ymax.value)) {
        let DESIRED_SAMPLE = 2000;
        let xspan = [null, null]; let yspan = [null, null];

        xspan = [parseFloat(xmin.value), parseFloat(xmax.value)];
        yspan = [parseFloat(ymin.value), parseFloat(ymax.value)];
        step = Math.min(Math.abs(yspan[1] - yspan[0]), Math.abs(xspan[1] - xspan[0]))/DESIRED_SAMPLE;
        let points = calculatePoints(expression.value, dimension.value, xspan, yspan, step);
    }
}
inputConfirm.addEventListener('click', plot);

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