function setup() {
    createCanvas(495,495).parent("sketch-holder");
    noLoop();
    background(255, 0, 200);
}

function generateTestData(x,y) {
    var test_data = [];
    for (i = 0; i < x ; i++) {
        var row = [];
        for (j = 0; j < y ; j++) {
            if (Math.random() > 0.5) {
            row.push(1);
            } else { row.push(0);
            }
        }
        test_data.push(row);
    }
    return test_data;
}

var test_data = generateTestData(33,33);

function draw() {
    var c = color(255,204,0);
    var size = 15;
    fill(c);
    noStroke();
    for (i = 0; i < test_data.length; i++) {
        row = test_data[i];
        for (j = 0; j < row.length; j++ ) {
            if (row[j]) {
                rect(i * size, j * size, size, size);
            }
        }
    }
}
