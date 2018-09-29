// mandala rendering along cardinal directions
// color palette selection
// remove p5
// multiple renders - intial conditions, species increments, etc.
// Use browserify to modularize code
// Use JSHint to standardize code
var ruleSet = [];
var species = document.getElementById('speciesIn');
var nbh = document.getElementById('neighborhood');
var numColors = document.getElementById('numColors');
var xDimension = document.getElementById('xIn');
var yDimension = document.getElementById('yIn');
var gridSize = document.getElementById('sizeIn');
var bkgrnd = document.getElementById('background');
var color1 = document.getElementById('color1');
var color2 = document.getElementById('color2');
var color3 = document.getElementById('color3');
//var colorList = ['#eeeeee','#5e8ae2','#fed217','#222222','#123456','#871381','#8c1292']
//var colorList = ['#ffffff', '#dddddd', '#bbbbbb', '#999999', '#777777', '#555555', '#333333', '#111111', '#000000'];
var colorList = ['#FEFFFE', '#BFD7EA', '#0B3954', '#E0FF4F', '#FF6663', '#5CA4A9', '#F4F1BB']
var sizeCheck = [xDimension.value, yDimension.value, gridSize.value];
function caType() {return document.querySelector('input[name="caType"]:checked').value};
function startCond() {return document.querySelector('input[name="startCond"]:checked').value};
document.getElementById('inc').onclick = function() {changeSpecies(1)};
document.getElementById('inc10').onclick = function() {changeSpecies(10)};
document.getElementById('inc100').onclick = function() {changeSpecies(100)};
document.getElementById('dec').onclick = function() {changeSpecies(-1)};
document.getElementById('dec10').onclick = function() {changeSpecies(-10)};
document.getElementById('dec100').onclick = function() {changeSpecies(-100)};
document.getElementById('small').onclick = function() {reSize(31,15,8)};
document.getElementById('medium').onclick = function() {reSize(151,75,5)};
document.getElementById('large').onclick = function() {reSize(401,200,3)};
document.getElementById('numColors').onchange = function() {createColorTable()};



function setup() {
    createCanvas(xDimension.value * gridSize.value,
                 yDimension.value * gridSize.value).parent("sketch-holder");
    noLoop();
    createColorTable();
}

function generateCA() {
    ruleSet = generateRules(species.value);
    let output = [];
    output.push(generateFirstRow(xDimension.value));
    for (let i = 0; i < yDimension.value - 1; i++) {
        output.push(generateNextRow(output[output.length - 1]));
    }
    return output;
}

function generateRules(species) {
    let rules = {}
    species = parseInt(species);
    r = (nbh.value * 2) + 1;
    n = parseInt(numColors.value);
    // reverse to make order little endian
    if (caType() == 'elementary') {
        document.getElementById('max').innerHTML = Math.pow(n,(Math.pow(n,r))).toString();
        species = species.toString(n).padStart(Math.pow(n,r),'0').split('').reverse();
        for (i = 0; i < Math.pow(n,r); i++) {
            rule = i.toString(n).padStart(r, '0');
            rules[rule] = species[i];
        }
    } else if (caType() == 'totalistic') {
        document.getElementById('max').innerHTML = Math.pow(n, ((n-1)*r+1));
        species = species.toString(n).padStart(r*(n-1)+1,'0').split('').reverse();
        for (i = 0; i < (r*(n-1)+1); i++) {
            rules[i] = species[i];
        }
    }
    return rules;
}

function generateFirstRow(width) {
    var output = [];
    var center = Math.floor(width/2);
    if (startCond() == 'random'){
        for (i =0; i< width; i++) {
            if (Math.random() >= 0.5) {
                output.push('1');
            } else {
                output.push('0');
            }
        }
    } else {
        for (i = 0; i < width; i++) {
            if (i == center) {
                output.push('1');
            } else {
                output.push('0');
            }
        }
    }
    return output;
}

function generateNextRow(lastRow) {
    var newRow = [];
    let rowLength = lastRow.length;
    let r = nbh.value*2 + 1;
    let row = lastRow.slice();
    // Pad row with neighborhood range elements from ends to loop x axis
    for (i = 0; i < nbh.value; i++) {
        row.unshift(row[rowLength - 1]);
        row.push(row[i*2+1]);
    }
    if (caType() == 'elementary') {
        for (i = 0; i < rowLength; i++) {
            let neighborhood = row.slice(i,i+r).join('');
            newRow.push(ruleSet[neighborhood]);
        }
    } else if (caType() == 'totalistic') {
        for (i = 0; i < rowLength; i++) {
            let neighborhood = row.slice(i,i+r);
            neighborhood = neighborhood.reduce(function(acc, val) { return acc + parseInt(val); }, 0);
            newRow.push(ruleSet[neighborhood]);
        }
    }
    return newRow;
}

function reSizeCheck() {
    // p5.js redraw handling is strange, so check whether the canvas
    // needs to be redrawn and call resizeCanvas or redraw, depending,
    // to ensure you don't redraw twice.
    let resize = false;
    if (xDimension.value != sizeCheck[0] ||
            yDimension.value != sizeCheck[1] ||
            gridSize.value != sizeCheck[2]) {
        resize = true;
        sizeCheck[0] = xDimension.value;
        sizeCheck[1] = yDimension.value;
        sizeCheck[2] = gridSize.value;
    }
    if (resize) {
        resizeCanvas(xDimension.value * gridSize.value, yDimension.value * gridSize.value);
    } else {
        redraw();
    }
};

function draw() {
    let colors = readColorTable();
    let ca = generateCA();
    let dataLength = ca.length;
    let grid = gridSize.value;
    background(colors[0]);
    noStroke();
    for (i = 0; i < dataLength; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (j = 0; j < rowLength; j++ ) {
            if (row[j] != '0') {
                fill(colors[parseInt(row[j])]);
                rect(j * grid, i * grid, grid, grid);
            }
        }
    }
};


function changeSpecies(amount) {
    newValue = parseInt(species.value) + amount;
    document.getElementById('speciesIn').value = newValue.toString();
    redraw();
}

function reSize(w, h, g) {
    xDimension.value = w;
    yDimension.value = h;
    gridSize.value = g;
    reSizeCheck();
}

function addColorRow(table, rowNum) {
    let row = table.insertRow(-1);
    let label = row.insertCell(0);
    label.innerHTML = 'Color ' + rowNum.toString() + ':';
    let cell2 = row.insertCell(1);
    let input = document.createElement("input");
    input.setAttribute('type', 'color');
    input.setAttribute('value', colorList[rowNum]);
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
    redraw();
}

function randomizeAllColors() {
    let colors = document.getElementById('colors');
    for ( i = 0; i < colors.rows.length; i++) {
        colors.rows[i].cells[1].firstChild.value = randomColor();
    }
    redraw();
}

function keyPressed() {
    if (keyCode === ENTER) {
        reSizeCheck();
    } else if (keyCode === 80) {
        performanceTest();
    } else if (keyCode === 37) {
        changeSpecies(-1);
    } else if (keyCode === 39) {
        changeSpecies(1);
    } else if (keyCode === 67) {
        clearTable();
    } else if (keyCode === 81) {
        document.getElementById('small').click();
    } else if (keyCode === 87) {
        document.getElementById('medium').click();
    } else if (keyCode === 69) {
        document.getElementById('large').click();
    };
};

function performanceTest() {
    let t0 = performance.now();
    for (var i = 16; i <= 116; i++) {
        xDimension.value = 201;
        yDimension.value = 100;
        species.value = i;
        generateCA();
    };
    let t1 = performance.now();
    console.log("Test took: " + (t1 - t0)/1000 + " seconds");
}
