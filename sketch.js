var species = 30;
var xDimension = 11;
var yDimension = 5;
var gridSize = 15;
var ruleSet = {}
var rules = ["111", "110", "101", "100", "011", "010", "001", "000"];

function setup() {
    createCanvas(xDimension * gridSize, yDimension * gridSize).parent(
            "sketch-holder");
    noLoop();
    speciesIn = createInput(30).parent("speciesIn");
    xIn = createInput(41).parent("xIn");
    yIn = createInput(20).parent("yIn");
    sizeIn = createInput(15).parent("sizeIn");
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
    var output = [];
    output.push(generateFirstRow(xDimension));
    //let required so that 'i' isn't used/overwritten in function call
    for (let i = 0; i < yDimension - 1; i++) {
        output.push(generateNextRow(output[output.length - 1]));
    }
    return output;
}

function generateRules(species) {
    var binary = species.toString(2).split('');
    while (binary.length < 8) {
        binary.unshift('0');
    }
    console.log(binary);
    var ruleSet = {};
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
    for (i = 0; i < lastRow.length; i++) {
        //mess because js doesn't do negative array indexes
        //and we're looping the space side to side
        if (i == 0) {
            var context = [lastRow[lastRow.length - 1], lastRow[i],
                lastRow[i + 1]].join('');
        } else if (i == lastRow.length - 1) {
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
    species = speciesIn.value();
    xDimension = xIn.value();
    yDimension = yIn.value();
    gridSize = sizeIn.value();
}

function draw() {
    var c = color(255,204,0);
    var size = 15;
    //var testData = generateTestData(xDimension, yDimension);
    let testData = generateCA();
    background(255, 0, 200);
    fill(c);
    noStroke();
    for (i = 0; i < testData.length; i++) {
        row = testData[i];
        for (j = 0; j < row.length; j++ ) {
            if (row[j] == true) {
                rect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        readInputs();
        resizeCanvas(xDimension * gridSize, yDimension * gridSize);
        generateRules();
        redraw();
    }
}
