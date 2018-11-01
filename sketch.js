// mandala rendering along cardinal directions
// color palette selection
// remove p5
// multiple renders - intial conditions, species increments, etc.
// Use browserify to modularize code
// Use JSHint to standardize code
// TODO - redraw calls, remove rest of p5
var ruleSet = [];
var canvas
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

setup();


function setup() {
    //createCanvas(xDimension.value * gridSize.value,
    //             yDimension.value * gridSize.value).parent("sketch-holder");
    console.log('running');
    let holder = document.getElementById('sketch-holder');
    canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    canvas.id = 'Canvas';
    createColorTable();
    draw();
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
        for (let i = 0; i < Math.pow(n,r); i++) {
            rule = i.toString(n).padStart(r, '0');
            rules[rule] = species[i];
        }
    } else if (caType() == 'totalistic') {
        document.getElementById('max').innerHTML = Math.pow(n, ((n-1)*r+1));
        species = species.toString(n).padStart(r*(n-1)+1,'0').split('').reverse();
        for (let i = 0; i < (r*(n-1)+1); i++) {
            rules[i] = species[i];
        }
    }
    debugger;
    return rules;
}

function generateFirstRow(width) {
    var output = [];
    var center = Math.floor(width/2);
    if (startCond() == 'random'){
        for (let i = 0; i < width; i++) {
            if (Math.random() >= 0.5) {
                output.push('1');
            } else {
                output.push('0');
            }
        }
    } else {
        for (let i = 0; i < width; i++) {
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
    for (let i = 0; i < nbh.value; i++) {
        row.unshift(row[rowLength - 1]);
        row.push(row[i*2+1]);
    }
    if (caType() == 'elementary') {
        for (let i = 0; i < rowLength; i++) {
            let neighborhood = row.slice(i,i+r).join('');
            newRow.push(ruleSet[neighborhood]);
        }
    } else if (caType() == 'totalistic') {
        for (let i = 0; i < rowLength; i++) {
            let neighborhood = row.slice(i,i+r);
            neighborhood = neighborhood.reduce(function(acc, val) { return acc + parseInt(val); }, 0);
            newRow.push(ruleSet[neighborhood]);
        }
    }
    return newRow;
}

function draw() {
    let colors = readColorTable();
    let ca = generateCA();
    let grid = gridSize.value;
    var ctx = canvas.getContext('2d');
    canvas.width  = xDimension.value * gridSize.value;
    canvas.height = yDimension.value * gridSize.value;
    ctx.fillStyle = colors[0];
    ctx.fillRect(0,0,xDimension.value * grid,yDimension.value * grid);
    for (let i = 0; i < ca.length; i++) {
        let row = ca[i];
        let rowLength = row.length;
        for (let j = 0; j < rowLength; j++ ) {
            if (row[j] != '0') {
                ctx.fillStyle = colors[parseInt(row[j])];
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
    console.log(keyCode);
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
    for (var i = 16; i <= 116; i++) {
        xDimension.value = 201;
        yDimension.value = 100;
        species.value = i;
        generateCA();
    };
    let t1 = performance.now();
    console.log("Test took: " + (t1 - t0)/1000 + " seconds");
}
