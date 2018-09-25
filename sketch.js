//     - typed arrays for performance benefit?
var ruleSet = [];
var species = document.getElementById('speciesIn');
var nbh = document.getElementById('neighborhood');
var numColors = document.getElementById('colors');
var xDimension = document.getElementById('xIn');
var yDimension = document.getElementById('yIn');
var gridSize = document.getElementById('sizeIn');
var bkgrnd = document.getElementById('background');
var color1 = document.getElementById('color1');
var color2 = document.getElementById('color2');
var color3 = document.getElementById('color3');
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

function setup() {
    createCanvas(xDimension.value * gridSize.value, yDimension.value * gridSize.value).parent(
            "sketch-holder");
    noLoop();
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
    let c = [bkgrnd.value, color1.value, color2.value, color3.value, "#123456", "#871381"];
    let ca = generateCA();
    let dataLength = ca.length;
    let grid = gridSize.value;
    background(c[0]);
    noStroke();
    for (i = 0; i < dataLength; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (j = 0; j < rowLength; j++ ) {
            if (row[j] != '0') {
                fill(c[parseInt(row[j])]);
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

function keyPressed() {
    if (keyCode === ENTER) {
        reSizeCheck();
    } else if (keyCode === 80) {
        performanceTest();
    } else if (keyCode === 37) {
        changeSpecies(-1);
    } else if (keyCode === 39) {
        changeSpecies(1);
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
