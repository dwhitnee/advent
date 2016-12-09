/*global $, getData */

"use strict";

class RLE {
  constructor() {
  }

  // turn A(1x5)BC into ABBBBBC
  decompress( input ) {
    var output= "";
    var marker;

    for (var i=0; i < input.length; i++) {
      var ch = input.charAt(i);

      if (!marker) {
        if (ch === "(") {
          marker = "X";          // start reading marker (not part of output)
        } else {
          output += ch;         // pass through output
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
/*
function getData( filename ) {
  return new Promise(
    function( resolve, reject ) {
      var fs = require("fs");
      resolve( fs.readFileSync( filename, 'utf8'));
    });
}
*/

function runTest() {
  var rle = new RLE();
  var data = "(3x3)XYZ";
  var output = rle.decompress( data );
  $("#answer1").text( output.length + " " + output );
}

function run(){
  var rle = new RLE();
  getData("input/day9").then(
    data => {
      var output = rle.decompress( data );
      // console.log( output.length );
      $("#answer1").text( output.length );
    });
};

$( runTest );
