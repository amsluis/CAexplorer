//TODO - buttons to randomize inputs, radio options
//     - make pretty
//     - typed arrays for performance benefit?

var species = 777;
var xDimension = 61;
var yDimension = 30;
var gridSize = 15;
var ruleSet = []

function setup() {
    speciesIn = createInput(777).parent("speciesIn");
    xIn = createInput(401).parent("xIn");
    yIn = createInput(200).parent("yIn");
    sizeIn = createInput(2).parent("sizeIn");
    createCanvas(xDimension * gridSize, yDimension * gridSize).parent(
            "sketch-holder");
    noLoop();
}

function generateCA() {
    ruleSet = generateRules(species);
    let output = [];
    output.push(generateFirstRow(xDimension));
    for (let i = 0; i < yDimension - 1; i++) {
        output.push(generateNextRow(output[output.length - 1]));
    }
    return output;
}

function generateRules(species) {
    var trinary = species.toString(3).split('');
    while (trinary.length < 7) {   //left pad to 7 digit binary number
        trinary.unshift('0');
    }
    return trinary;
}

function generateFirstRow(width) {
    var output = [];
    var center = Math.floor(width/2);
    for (i = 0; i < width; i++) {
        if (i == center) {
            output.push('1');
        } else {
            output.push('0');
        }
    }
    return output;
}
/*
function generateFirstRow(width) {
    var output = [];
    for (i = 0; i < width; i++) {
        if (Math.random() >= 0.5) {
            output.push('1');
        } else {
            output.push('0');
        }
    }
    return output;
}
*/

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

function readInputs() {
    // p5.js redraw handling is strange, so check whether the canvas
    // needs to be redrawn and call resizeCanvas or redraw, depending,
    // to ensure you don't redraw twice.
    let resize = false;
    if (xDimension != xIn.value() ||
        yDimension != yIn.value() ||
        gridSize != sizeIn.value()) {
        resize = true;
    }
    species = parseInt(speciesIn.value());
    xDimension = xIn.value();
    yDimension = yIn.value();
    gridSize = sizeIn.value();
    generateRules(species);
    if (resize) {
        resizeCanvas(xDimension * gridSize, yDimension * gridSize);
    } else {
        redraw();
    }
}

function draw() {
    let c = [0,color(255,204,0), color(51,224,165)];
    let size = 15;
    let ca = generateCA();
    let dataLength = ca.length;
    background(255, 0, 200);
    noStroke();
    for (i = 0; i < dataLength; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (j = 0; j < rowLength; j++ ) {
            if (row[j] != '0') {
                var clr = parseInt(row[j]);
                debugger;
                fill(c[parseInt(row[j])]);
                rect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        readInputs();
    }
}
