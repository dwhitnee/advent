// http://adventofcode.com/day/2
// Find nice strings
// 2016 David Whitney

if (!String.prototype.includes) {
    String.prototype.includes = function() {
        'use strict';
        if (typeof arguments[1] === "number") {
            if (this.length < arguments[0].length + arguments[1].length) {
                return false;
            } else {
                if (this.substr(arguments[1], arguments[0].length) === arguments[0]) return true;
                else return false;
            }
        } else {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        }
    };
}

var niceStrings = 0;


function containsThreeVowels( str ) {
  var count = 0;
  var vowels = "aeiou";

  for (var i = 0; i < str.length; i++) {
    if ( vowels.includes( str[i] )) {
      count++;
      if (count >= 3) {
        return true;
      }
    }
  }
  return false;
}

function containsDoubleLetter( str ) {
  var lastLetter = str[0];

  for (var i = 1; i < str.length; i++) {
    if (lastLetter === str[i]) {
      return true;
    }
    lastLetter = str[i];
  }
  return false;
}

function containsCrappyPairs( str ) {
  // ab, cd, pq, or xy
  var crappy = ["ab", "cd", "pq", "xy"];

  for (var i = 1; i < str.length; i++) {
    var substr = str[i-1] + str[i];
    if (crappy.indexOf( substr ) !== -1) {
      return true;
    }
  }
  return false;
}

// Determine if string is "nice"
function processLine( line ) {

  if (containsThreeVowels( line ) &&
      containsDoubleLetter( line ) &&
      !containsCrappyPairs( line ))
  {
    niceStrings++;
  }
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
                console.log("There are "+ niceStrings + " nice strings");
              });

// console.log( containsThreeVowels("alepha") );
// console.log( containsDoubleLetter("aleppha") );