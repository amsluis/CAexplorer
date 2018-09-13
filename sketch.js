//     - typed arrays for performance benefit?
//     - limit species input to valid range for r (neighborhood) and n (colors)
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
var sizeCheck = [xDimension.value, yDimension.value, gridSize.value];
function caType() {return document.querySelector('input[name="caType"]:checked').value};
function startCond() {return document.querySelector('input[name="startCond"]:checked').value};
document.getElementById('inc').onclick = function(){
    newValue = parseInt(species.value) + 1;
    document.getElementById('speciesIn').value = newValue.toString();
    redraw();
}
document.getElementById('dec').onclick = function(){
    newValue = parseInt(species.value) - 1;
    document.getElementById('speciesIn').value = newValue.toString();
    redraw();
}


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

/*
function generateRules(species) {
    species = parseInt(species);
    var trinary = species.toString(3).split('');
    while (trinary.length < 7) {   //left pad to 7 digit binary number
        trinary.unshift('0');
    }
    return trinary;
}
*/

function generateRules(species) {
    let rules = {}
    species = parseInt(species);
    r = (nbh.value * 2) + 1;
    n = parseInt(numColors.value);
    // reverse to make order little endian
    console.log(species);
    console.log(r,n);
    if (caType() == 'elementary') {
        species = species.toString(n).padStart(Math.pow(n,r),'0').split('').reverse();
        for (i = 0; i < Math.pow(n,r); i++) {
            rule = i.toString(n).padStart(r, '0');
            rules[rule] = species[i];
        }
    } else if (caType() == 'totalistic') {
        species = species.toString(n).padStart(r*(n-1)).split('').reverse();
        for (i = 0; i < (r*(n-1)+1); i++) {
            rules[i] = species[i];
        }
    }
    console.log(rules);
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
    var output = [];
    let rowLength = lastRow.length
    for (i = 0; i < rowLength; i++) {
        //mess because js doesn't do negative array indexes
        //and we're looping the space side to side
        if (i == 0) {
            var context = [lastRow[rowLength - 1], lastRow[i],
                lastRow[i + 1]].join('');
        } else if (i == rowLength - 1) {
            var context = [lastRow[i - 1], lastRow[i],lastRow[0]].join('');
        } else {
            var context = [lastRow[i - 1], lastRow[i],
            lastRow[i + 1]].join('');
        }
        var total = context.split('');
        var total = total.map( function(n){
            return parseInt(n, 10)
        });
        total = total.reduce( function(a,b){
            return a+b
        });
        output.push(ruleSet[ruleSet.length - 1 - total]);
    }
    return output;
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
    let c = [bkgrnd.value, color1.value, color2.value];
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

function keyPressed() {
    if (keyCode === ENTER) {
        reSizeCheck();
    };
    if (keyCode === 80) {
        performanceTest();
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
