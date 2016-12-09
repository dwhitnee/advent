/*global $, getData */

// Uses too much memory, need to jack it up:
//   node --max_old_space_size=4096 day9.js

"use strict";

class RLE {
  constructor() {
  }

  // turn A(1x5)BC into ABBBBBC
  decompress( input ) {
    var doText = true;  // can't do text normally because string would be 11451628995 chars
    var output= (doText? "":0);
    var marker;

    for (var i=0; i < input.length; i++) {
      var ch = input.charAt(i);

      if (!marker) {
        if (ch === "(") {
          marker = "X";          // start reading marker (not part of output)
        } else {
          output += doText?ch:1;         // pass through output
        }
      } else {
        if (ch !== ")") {
          marker += input.charAt(i);  // keep reading marker

        } else {  // marker done, decompress based on marker

          var m = marker.match(/X(.*)x(.*)/);
          var len = m[1];
          var times = m[2];
          var token = input.substr( i+1, len);
          output += this.decompress( token.repeat( times ));

          i += len|0;
          marker = "";  // back to regular mode
        }
      }
    }
    return output;
  }
}

// same syntax as ajax version
function getData( filename ) {
  return new Promise(
    function( resolve, reject ) {
      var fs = require("fs");
      resolve( fs.readFileSync( filename, 'utf8'));
    });
}

function runTest() {
  var rle = new RLE();

  var data =[
    "X(8x2)(3x3)ABCY",
    "(3x3)XYZ",
//    "(27x12)(20x12)(13x14)(7x10)(1x12)A", // 241920
    "(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN" // 445
  ];

  for (var i=0; i < data.length; i++) {
    var output = rle.decompress( data[i] );
    $("#answer"+(i+1)).text( output.length + " " + output );
  }
}

function run(){
  var rle = new RLE();
  getData("input/day9").then(
    data => {
      var output = rle.decompress( data );
      $("#answer1").text( output.length );
    });
};



if (typeof $ !== 'undefined' ) {
  $( runTest );

} else {
  var $ = function() {
    return { text: str => { console.log( str ); }};
  };

  runTest();
}
