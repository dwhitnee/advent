// http://adventofcode.com/day/2
// Calculate needed wrapping paper for boxes
// 2016 David Whitney

var paper = 0;
var boxes = 0;
var ribbon = 0;

// read "1x2x3" and calculate needed wrapping paper, plus one extra a square
function processLine( line ) {

  boxes += 1;

  var dims = line.split('x').map( Number );  // convert to int

  // JS SUCKS! arrays of ints are sorted alphabetically
  dims.sort(function(a, b){return a-b;});

  var sideA = dims[0] * dims[1];
  var sideB = dims[0] * dims[2];
  var sideC = dims[1] * dims[2];

  // add slack of the smaller side
  paper += 2*sideA + 2*sideB + 2*sideC + sideA;

  ribbon += dims[0]+dims[0]+dims[1]+dims[1] + dims[0]*dims[1]*dims[2];
}


//----------------------------------------------------------------------
//----------------------------------------------------------------------
var filename = process.argv[2];
console.log("Reading input from " + filename );

var dataReader = require('readline').createInterface({
  input: require('fs').createReadStream( filename )
});


dataReader.on('line', processLine );

dataReader.on('close', function() {
                console.log( boxes + " boxes need " + paper + " sqft of wrapping paper");
                console.log( ribbon + " ft of ribbon");
              });
