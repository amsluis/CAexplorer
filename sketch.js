// mandala rendering along cardinal directions
// multiple renders - intial conditions, species increments, etc.
// Use browserify to modularize code
// Use JSHint to standardize code
// Allow input & working with large numbers
//  - BigInt library with toArray(radix) function
//
//var colorList = ['#eeeeee','#5e8ae2','#fed217','#222222','#123456','#871381','#8c1292']
//var colorList = ['#ffffff', '#dddddd', '#bbbbbb', '#999999', '#777777', '#555555', '#333333', '#111111', '#000000'];

var ca;
var colorList = ['#FEFFFE', '#BFD7EA', '#0B3954', '#E0FF4F', '#FF6663', '#5CA4A9', '#F4F1BB'];
var settings = { };

function readSettings(s) {
    s.species = bigInt(document.getElementById('speciesIn').value);
    s.nbh = parseInt(document.getElementById('neighborhood').value);
    s.numColors = parseInt(document.getElementById('numColors').value);
    s.xDimension = parseInt(document.getElementById('xIn').value);
    s.yDimension = parseInt(document.getElementById('yIn').value);
    s.gridSize = parseInt(document.getElementById('sizeIn').value);
    s.caType = document.querySelector('input[name="caType"]:checked').value;
    s.startCond = document.querySelector('input[name="startCond"]:checked').value;
};

function writeSettings(s) {
    document.getElementById('speciesIn').value = s.species.toString();
    document.getElementById('neighborhood').value = s.nbh;
    document.getElementById('numColors').value = s.numColors;
    document.getElementById('xIn').value = s.xDimension;
    document.getElementById('yIn').value = s.yDimension;
    document.getElementById('sizeIn').value = s.gridSize;
    // document.querySelector('input[name="caType"]:checked').value = s.caType
    // document.querySelector('input[name="startCond"]:checked').value = s.startCond
    // TODO
};

function CA(settings, canvas, canvas_hidden) {
    Object.setPrototypeOf(this.__proto__, settings);
    this.ruleSet = null;
    this.canvas = canvas;
    this.canvas_hidden = canvas_hidden;
    this.ca = null;
};

CA.prototype.generateCA = function() {
    this.generateRules();
    let output = [];
    output.push(this.generateFirstRow(this.xDimension));
    for (let i = 0; i < this.yDimension - 1; i++) {
        output.push(this.generateNextRow(output[output.length - 1]));
    }
    return output;
};

CA.prototype.generateRules = function() {
    let r =  (this.nbh * 2) + 1;
    let c =  this.numColors;
    let sp = this.species.toArray(c);
    let rules = [];
    if (this.caType == 'elementary') {
        document.getElementById('max').innerHTML = Math.pow(c,(Math.pow(c,r))).toString();
        while (sp.value.length < Math.pow(c,r)) {
            sp.value.unshift(0);
        };
        sp.value.reverse();
        for (let i = 0; i < Math.pow(c,r); i++) {
            rule = i.toString(c).padStart(r, '0');
            rules.push(sp.value[i]);
        }
    } else if (this.caType == 'totalistic') {
        document.getElementById('max').innerHTML = Math.pow(c, ((c-1)*r+1));
        //sp = sp.toString(c).padStart(r*(c-1)+1, '0').split('').reverse();
        while (sp.value.length < (r*(c-1)+1)) {
            sp.value.unshift(0);
        };
        sp.value.reverse();
        for (let i = 0; i < (r*(c-1)+1); i++) {
            rules.push(sp.value[i]);
        }
    }
    this.ruleSet = new Uint8Array(rules);
};

CA.prototype.generateFirstRow = function(width) {
    var output = new Uint8Array(width);
    var center = Math.floor(width/2);
    if (this.startCond == 'random') {
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
    output = this.loopRowEnds(output);
    return output;
};

//copyWithin() may be cleaner + more performant
CA.prototype.loopRowEnds = function(row) { 
    let output = new Uint8Array(row.length + this.nbh * 2);
    for (let i = 0; i < this.nbh; i++) {
        output[i] = row[row.length - this.nbh + i];
        output[output.length - 1 - i] = row[this.nbh - 1 - i];
    }
    output.set(row, this.nbh);
    return output;
};

CA.prototype.updateLoopEnds = function(row) {
    const len = row.length;
    const n = this.nbh;
    row.copyWithin(0, len - n*2, len - n);
    row.copyWithin(len - n, n, n*2);
    return row;
};

CA.prototype.generateNextRow = function(lastRow) {
    var len = lastRow.length;
    var newRow = new Uint8Array(len);
    const r = this.nbh * 2 + 1;
    const n = this.nbh;
    const c = this.numColors;
    if (this.caType == 'elementary') { //special case small neighborhoods for ~4x speedup
        if (n == 1) {
            for (let i = 0; i < len - n*2; i++) {
                let total = lastRow[i]*c*c + lastRow[i+1]*c + lastRow[i+2]
                newRow[i+n] = this.ruleSet[total];
            }
        } else if (n == 2) {
            for (let i = 0; i < len - n*2; i++) {
                let total = lastRow[i]*c*c*c*c + lastRow[i+1]*c*c*c +
                    lastRow[i+2]*c*c + lastRow[i+3]*c + lastRow[i+4];
                newRow[i+n] = this.ruleSet[total];
            }
        } else {
            for (let i = 0; i < len - n*2; i++) {
                let total = 0
                for (let j = 0; j < r; j++) {
                    total += lastRow[i + j]*Math.pow(c, j);
                }
                newRow[i+n] = this.ruleSet[total];
            }
        }
    } else if (this.caType == 'totalistic') {
        for (let i = 0; i < len - n*2; i++) {
            let total = 0
            for (let j = 0; j < r; j++) {
                total += lastRow[i+j];
            }
            newRow[i+n] = this.ruleSet[total];

        }
    }
    this.updateLoopEnds(newRow);
    return newRow;
};

CA.prototype.buildPixelArray = function(colors) {
    let array_length = this.xDimension * this.yDimension * 4;
    let data = new Uint8ClampedArray(array_length);
    for (let i = 0; i < this.ca.length; i++ ) {
        let row = this.ca[i];
        let shift = row.length - 2;
        for (let j = 1; j < row.length - 2; j++ ) {
            let color = colors[row[j]];
            data[i*shift*4 + j*4] =     parseInt(color.slice(1,3),16);
            data[i*shift*4 + j*4 + 1] = parseInt(color.slice(3,5),16);
            data[i*shift*4 + j*4 + 2] = parseInt(color.slice(5,7),16);
            data[i*shift*4 + j*4 + 3] = 0xff;
        }
    }
    return data;
}


CA.prototype.draw = function() {
    readSettings(ca);
    this.ca = this.generateCA();
    let colors = readColorTable();
    let g = this.gridSize;
    const r = this.nbh;
    let ctx = this.canvas.getContext('2d');
    let ctx_hidden = this.canvas_hidden.getContext('2d');
    ctx_hidden.imageSmoothingEnabled = false;
    ctx_hidden.mozImageSmoothingEnabled = false;
    ctx_hidden.webkitImageSmoothingEnabled = false;
    ctx_hidden.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    let pixel_data = this.buildPixelArray(colors);
    createColorTable();

    this.canvas_hidden.height = this.yDimension;
    this.canvas_hidden.width =  this.xDimension;
    this.canvas.height = this.yDimension * g;
    this.canvas.width =  this.xDimension * g;

    let image = new ImageData(pixel_data, this.xDimension);
    ctx_hidden.putImageData(image, 0, 0);
    ctx.drawImage(this.canvas_hidden, 0, 0, this.canvas.width, this.canvas.height);


    /*
    canvas.width  = this.xDimension * g;
    canvas.height = this.yDimension * g;
    ctx.fillStyle = colors[0];
    ctx.fillRect(0,0,this.xDimension * g ,this.yDimension * g);
    for (let i = 0; i < this.ca.length; i++) {
        let row = this.ca[i];
        let rowLength = row.length;
        for (let j = 0; j < rowLength; j++ ) {
            if (row[j + r] != '0') {
                ctx.fillStyle = colors[parseInt(row[j + r])];
                ctx.fillRect(j * g, i * g, g, g);
            }
        }
    }
    */
};

(function setup() {
    canvas_hidden = document.createElement('canvas');
    canvas_hidden.hidden = true;
    canvas = document.getElementById('canvas');
    canvas_hidden.id = 'Canvas Hidden';
    readSettings(settings);
    ca = new CA(settings, canvas, canvas_hidden);
    createColorTable();
    ca.draw();
}());

function reSize(x,y,g) {
    ca.gridSize = g || ca.gridSize;
    ca.xDimension = x || ca.xDimension;
    ca.yDimension = y || ca.yDimension;
    writeSettings(ca);
    ca.draw();
};

function changeSpecies(amount) {
    ca.species = ca.species.add(amount);
    writeSettings(ca);
    ca.draw();
};

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
};

function createColorTable() {
    let table = document.getElementById('colors');
    table.innerHTML = '';
    for (i = 0; i < numColors.value; i++) {
        addColorRow(table, i);
    };
};

function readColorTable() {
    let colors = document.getElementById('colors');
    let output = [];
    for (i = 0; i < colors.rows.length; i++) {
        output.push(colors.rows[i].cells[1].firstChild.value);
    };
    colorList = output;
    return output;
};

function randomColor() {
    let c = '';
    while (c.length < 6) {
        c += (Math.random()).toString(16).substr(-6).substr(-1)
    };
    return '#' + c;
};

function randomizeColor(element) {
    e = document.getElementById(element);
    e.value = randomColor();
    ca.draw();
};

function randomizeAllColors() {
    let colors = document.getElementById('colors');
    for ( i = 0; i < colors.rows.length; i++) {
        colors.rows[i].cells[1].firstChild.value = randomColor();
    }
    ca.draw();
};

document.addEventListener('keydown', (keyCode) => {
    if (keyCode.key === 'Enter') {
        ca.draw();
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
});

function performanceTest() {
    let t0 = performance.now();
    for (var i = 2116; i <= 2216; i++) {
        ca.xDimension.value = 401;
        ca.yDimension.value = 200;
        ca.species.value = i;
        ca.generateCA();
    };
    let t1 = performance.now();
    console.log("Test took: " + (t1 - t0)/1000 + " seconds");
};
