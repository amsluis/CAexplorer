// mandala rendering along cardinal directions
// color palette selection
// multiple renders - intial conditions, species increments, etc.
// Use browserify to modularize code
// Use JSHint to standardize code
// Allow input & working with large numbers
//  - BigInt library with toArray(radix) function
var ruleSet;
var canvas;
var species = document.getElementById('speciesIn');
var nbh = document.getElementById('neighborhood');
var numColors = document.getElementById('numColors');
var xDimension = document.getElementById('xIn');
var yDimension = document.getElementById('yIn');
var gridSize = document.getElementById('sizeIn');
//var colorList = ['#eeeeee','#5e8ae2','#fed217','#222222','#123456','#871381','#8c1292']
//var colorList = ['#ffffff', '#dddddd', '#bbbbbb', '#999999', '#777777', '#555555', '#333333', '#111111', '#000000'];
var colorList = ['#FEFFFE', '#BFD7EA', '#0B3954', '#E0FF4F', '#FF6663', '#5CA4A9', '#F4F1BB']
function caType() {return document.querySelector('input[name="caType"]:checked').value};
function startCond() {return document.querySelector('input[name="startCond"]:checked').value};

function Settings() {
    this.ruleSet = 'stuff';
    this.old = 'remains';
}

function Render() {
    var render = new Settings();

    this.ruleSet = 'new';

    return render;
};

var a = new Render();

(function setup() {
    let holder = document.getElementById('sketch-holder');
    canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    canvas.id = 'Canvas';
    createColorTable();
    draw();
}());

function generateCA() {
    ruleSet = generateRules();
    let output = [];
    output.push(generateFirstRow(xDimension.value));
    for (let i = 0; i < yDimension.value - 1; i++) {
        output.push(generateNextRow(output[output.length - 1]));
    }
    return output;
}


function generateRules() {
    let sp = parseInt(species.value);
    let r = (nbh.value * 2) + 1;
    let c = parseInt(numColors.value);
    let rules = [];
    if (caType() == 'elementary') {
        document.getElementById('max').innerHTML = Math.pow(c,(Math.pow(c,r))).toString();
        sp = sp.toString(c).padStart(Math.pow(c,r),'0').split('').reverse();
        for (let i = 0; i < Math.pow(c,r); i++) {
            rule = i.toString(c).padStart(r, '0');
            rules.push(sp[i]);
        }
    } else if (caType() == 'totalistic') {
        document.getElementById('max').innerHTML = Math.pow(c, ((c-1)*r+1));
        sp = sp.toString(c).padStart(r*(c-1)+1, '0').split('').reverse();
        for (let i = 0; i < (r*(c-1)+1); i++) {
            rules.push(sp[i]);
        }
    }
    return new Uint8Array(rules);
}

function generateFirstRow(width) {
    var output = new Uint8Array(width);
    var center = Math.floor(width/2);
    if (startCond() == 'random') {
        for (let i = 0; i < width; i++) {
            if (Math.random() >= 0.5) {
                output[i] = 1;
            } else {
                output[i] = 0;
            }
        }
    } else {
        output[center] = 1;
    }
    output = loopRowEnds(output);
    return output;
}

function loopRowEnds(row) { //copyWithin() may be cleaner + more performant
    let output = new Uint8Array(row.length + nbh.value * 2);
    for (let i = 0; i < nbh.value; i++) {
        output[i] = row[row.length - nbh.value + i];
        output[output.length - 1 - i] = row[nbh.value - 1 - i];
    }
    output.set(row, nbh.value);
    return output;
}

function updateLoopEnds(row) {
    const len = row.length;
    const n = parseInt(nbh.value);
    row.copyWithin(0, len - n*2, len - n);
    row.copyWithin(len - n, n, n*2);
    return row;
}

function generateNextRow(lastRow) {
    var len = lastRow.length;
    var newRow = new Uint8Array(len);
    const r = nbh.value*2 + 1;
    const n = parseInt(nbh.value);
    const c = parseInt(numColors.value);
    if (caType() == 'elementary') { //special case small neighborhoods for ~4x speedup
        if (n == 1) {
            for (let i = 0; i < len - n*2; i++) {
                let total = lastRow[i]*c*c + lastRow[i+1]*c + lastRow[i+2]
                newRow[i+n] = ruleSet[total];
            }
        } else if (n == 2) {
            for (let i = 0; i < len - n*2; i++) {
                let total = lastRow[i]*c*c*c*c + lastRow[i+1]*c*c*c +
                    lastRow[i+2]*c*c + lastRow[i+3]*c + lastRow[i+4];
                newRow[i+n] = ruleSet[total];
            }
        } else {
            for (let i = 0; i < len - n*2; i++) {
                let total = 0
                for (let j = 0; j < r; j++) {
                    total += lastRow[i + j]*Math.pow(c, j);
                }
                newRow[i+n] = ruleSet[total];
            }
        }
    } else if (caType() == 'totalistic') {
        for (let i = 0; i < len - n*2; i++) {
            let total = 0
            for (let j = 0; j < r; j++) {
                total += lastRow[i+j];
            }
            newRow[i+n] = ruleSet[total];

        }
    }
    updateLoopEnds(newRow);
    return newRow;
}

function draw() {
    let colors = readColorTable();
    let ca = generateCA();
    let grid = gridSize.value;
    const r = parseInt(nbh.value);
    var ctx = canvas.getContext('2d');
    createColorTable();
    canvas.width  = xDimension.value * gridSize.value;
    canvas.height = yDimension.value * gridSize.value;
    ctx.fillStyle = colors[0];
    ctx.fillRect(0,0,xDimension.value * grid,yDimension.value * grid);
    for (let i = 0; i < ca.length; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (let j = 0; j < rowLength; j++ ) {
            if (row[j + r] != '0') {
                ctx.fillStyle = colors[parseInt(row[j + r])];
                ctx.fillRect(j * grid, i * grid, grid, grid);
            }
        }
    }
}

function reSize(x,y,g) {
    gridSize.value = g || gridSize.value;
    xDimension.value = x || xDimension.value;
    yDimension.value = y || yDimension.value;
    draw();
}

function changeSpecies(amount) {
    newValue = parseInt(species.value) + amount;
    document.getElementById('speciesIn').value = newValue.toString();
    draw();
}

function addColorRow(table, rowNum) {
    let row = table.insertRow(-1);
    let label = row.insertCell(0);
    label.innerHTML = 'Color ' + rowNum.toString() + ':';
    let cell2 = row.insertCell(1);
    let input = document.createElement("input");
    let color = colorList[rowNum] || '#000000'
    input.setAttribute('type', 'color');
    input.setAttribute('value', color);
    input.setAttribute('id', 'colorInput' + rowNum);
    cell2.appendChild(input);
    let cell3 = row.insertCell(2);
    let btn = document.createElement('button');
    btn.setAttribute('onclick', "randomizeColor('colorInput" +  rowNum + "')");
    let t = document.createTextNode("Rand");
    btn.appendChild(t);
    cell3.appendChild(btn);
}

function createColorTable() {
    let table = document.getElementById('colors');
    table.innerHTML = '';
    for (i = 0; i < numColors.value; i++) {
        addColorRow(table, i);
    }
}

function readColorTable() {
    let colors = document.getElementById('colors');
    let output = [];
    for (i = 0; i < colors.rows.length; i++) {
        output.push(colors.rows[i].cells[1].firstChild.value);
    }
    colorList = output;
    return output;
}

function randomColor() {
    let c = '';
    while (c.length < 6) {
        c += (Math.random()).toString(16).substr(-6).substr(-1)
    }
    return '#' + c;
}

function randomizeColor(element) {
    e = document.getElementById(element);
    e.value = randomColor();
    draw();
}

function randomizeAllColors() {
    let colors = document.getElementById('colors');
    for ( i = 0; i < colors.rows.length; i++) {
        colors.rows[i].cells[1].firstChild.value = randomColor();
    }
    draw();
}

document.addEventListener('keydown', (keyCode) => {
    if (keyCode.key === 'Enter') {
        draw();
    } else if (keyCode.key === 'p') {
        performanceTest();
    } else if (keyCode.key === 'ArrowLeft') {
        changeSpecies(-1);
    } else if (keyCode.key === 'ArrowRight') {
        changeSpecies(1);
    } else if (keyCode.key === 'c') {
        clearTable();
    } else if (keyCode.key === 'q') {
        document.getElementById('small').click();
    } else if (keyCode.key === 'w') {
        document.getElementById('medium').click();
    } else if (keyCode.key === 'e') {
        document.getElementById('large').click();
    } else if (keyCode.key === 'r') {
        randomizeAllColors();
    } else if (keyCode.key === 'a') {
        reSize(1200,600,1);
    }
})

function performanceTest() {
    let t0 = performance.now();
    for (var i = 2116; i <= 2216; i++) {
        xDimension.value = 401;
        yDimension.value = 200;
        species.value = i;
        generateCA();
    };
    let t1 = performance.now();
    console.log("Test took: " + (t1 - t0)/1000 + " seconds");
}
