// http://adventofcode.com/day/1
// find the floor the elevator stops on given "up (" and "down )" commands
// 2015 David Whitney


var fs = require('fs');

var filename = process.argv[2];
console.log("Reading input from " + filename );

var floor = 0;

function processElevatorCommands( err, data ) {
  var inBasement = 0;

  for (var i=0; i< data.length; i++) {
    var command = String.fromCharCode( data[i] );
    if (command === ")") {
      floor--;
    } else if (command === "(") {
      floor++;
    } else {
      console.error("Oops: '" + command + "'");
    }
    if (!inBasement) {
      if (floor < 0) {
        inBasement = i;
      }
    }
  }
  console.log("Ending floor: " + floor );
  console.log("First time in basement: " + (inBasement+1) );
}

fs.readFile( filename, processElevatorCommands );
