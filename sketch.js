//TODO - buttons to randomize inputs, radio options
//     - make pretty
//     - typed arrays for performance benefit?

var species = 73;
var xDimension = 61;
var yDimension = 30;
var gridSize = 15;
var ruleSet = {}
var rules = ["111", "110", "101", "100", "011", "010", "001", "000"];

function setup() {
    speciesIn = createInput(73).parent("speciesIn");
    xIn = createInput(61).parent("xIn");
    yIn = createInput(30).parent("yIn");
    sizeIn = createInput(15).parent("sizeIn");
    createCanvas(xDimension * gridSize, yDimension * gridSize).parent(
            "sketch-holder");
    noLoop();
}

function generateTestData(x,y) {
    var testData = [];
    for (i = 0; i < x ; i++) {
        var row = [];
        for (j = 0; j < y ; j++) {
            if (Math.random() > 0.5) {
            row.push(1);
            } else { row.push(0);
            }
        }
        testData.push(row);
    }
    return testData;
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
    var ruleSet = {};
    var binary = species.toString(2).split('');
    while (binary.length < 8) {   //left pad to 8 digit binary number
        binary.unshift('0');
    }
    for (i = 0; i < binary.length; i++) {
        ruleSet[rules[i]] = binary[i];
    }
    return ruleSet;
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
        output.push(ruleSet[context]);
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
    let c = color(255,204,0);
    let size = 15;
    let ca = generateCA();
    let dataLength = ca.length;
    background(255, 0, 200);
    fill(c);
    noStroke();
    for (i = 0; i < dataLength; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (j = 0; j < rowLength; j++ ) {
            if (row[j] == true) {
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
