var species = 120;
var xDimension = 300;
var yDimension = 300;
var gridSize = 2;
var rules = ["111", "110", "101", "100", "011", "010", "001", "000"];

function setup() {
    createCanvas(xDimension * gridSize, yDimension * gridSize).parent(
            "sketch-holder");
    noLoop();
    speciesIn = createInput(120).parent("speciesIn");
    xIn = createInput(80).parent("xIn");
    yIn = createInput(80).parent("yIn");
    sizeIn = createInput(10).parent("sizeIn");
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

function generateCA(species) {
    var output = [];
    firstRow = generateFirstRow(species);
}

function readInputs() {
    species = speciesIn.value();
    xDimension = xIn.value();
    yDimension = yIn.value();
    gridSize = sizeIn.value();
}

function draw() {
    var c = color(255,204,0);
    var size = 15;
    var testData = generateTestData(xDimension, yDimension);
    background(255, 0, 200);
    fill(c);
    noStroke();
    for (i = 0; i < testData.length; i++) {
        row = testData[i];
        for (j = 0; j < row.length; j++ ) {
            if (row[j]) {
                rect(i * gridSize, j * gridSize, gridSize, gridSize);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        readInputs();
        resizeCanvas(xDimension * gridSize, yDimension * gridSize);
        redraw();
    }
}
