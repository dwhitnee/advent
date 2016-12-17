/*global $, WorkerThread, getData */

"use strict";

/**
 * Logic to walk the data to figure out the PIN for this keypad
 */
class DiskWiper {

  /**
   * @param keypad data structure for the size and shape of keys on keypad
   * @param gfx the object that draws the output
   */
  constructor( seed ) {
    this.seed = seed;
    this.data = seed;
    // this.data = parseInt( seed, 2);  // binary representation
  }

  fillDisk( diskSize ) {
    var output = this.seed.slice(0);  // copy it
    while (output.length < diskSize) {
      output = this.generateRandomLookingData( output );
    }
    this.fill = output.slice(0, diskSize );
  }

  computeChecksum() {
    var checksum = this.checksum( this.fill );
    while (!(checksum.length % 2)) {
      checksum = this.checksum( checksum );
    }
    return checksum;
  }

  // @return checksum of the randomish fill
  checksum( str ) {
    var checksum = "";
    for (var i=0; i < str.length; i += 2) {
      checksum += (str[i] === str[i+1])?"1":"0";
    }
    return checksum;
  }

  generateRandomLookingData( data ) {
    return data + "0" + this.reverseXOR( data );
  }

  // reverse string and swap (XOR) the 0's and 1's
  reverseXOR( str ) {
    function xor( bit ) {
      return (bit==="0")?"1":"0";
    }
    var outStr = "";
    for (var i = str.length - 1; i >= 0; outStr += xor( str[i--] )) {}
    return outStr;
  }
}


function run( seed, diskSize, elem ) {
  var wiper = new DiskWiper( seed );
  wiper.fillDisk( diskSize );
  var checksum = wiper.computeChecksum();
  $(elem).text( checksum );
}

function waitForButton() {
  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      run("00111101111101000", 272, "#answer1");
      setTimeout( () => { run("00111101111101000", 35651584, "#answer2"); }, 5000 );
    }
  });
}

$( waitForButton );
