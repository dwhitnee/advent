/*global $, WorkerThread, getData */

"use strict";

class Node {
  constructor( x, y, size, used, avail) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.used = used;
    this.avail = avail;

    if (used > 100) {
      console.log( this );
    }
  }

  // A's data can be moved to B
  // Node A is not empty (its Used is not zero).
  // The data on node A (its Used) would fit on node B (its Avail).
  isViablePairWith( b ) {
    return (this.used !== 0) &&
      !((b.x === this.x) && (b.y === this.y)) &&
      this.used <= b.avail;
  }

  canHold( node ) {
    return this.avail >= node.used;
  }

  toString() {
    return "(" + this.x + ", " + this.y + ") used = " + this.used + ", free = " + this.avail;
  }
}


/**
 */
class DiskGrid {
  /**
   */
  constructor( df ) {
    this.grid = {};
    this.pairs = {};
    this.parseDF( df );
  }


  // root@ebhq-gridcenter# df -h
  // Filesystem              Size  Used  Avail  Use%
  // /dev/grid/node-x0-y0     89T   67T    22T   75%
  // ...
  parseDF( df ) {
    var match, disk;

    for (var i=0; i < df.length; i++) {
      disk = df[i];

      if (disk.startsWith("/dev")) {
        match = disk.match(
            /\/dev\/grid\/node-x(\d+)-y(\d+)\s+(\d+)T\s+(\d+)T\s+(\d+)T\s+(\d+)%/);

        var node = new Node( match[1]|0, match[2]|0,
                             match[3]|0, match[4]|0, match[5]|0 );
        this.addGridNode( node );
      }
    }
  }

  addGridNode( node ) {
    var key = node.x + ":" + node.y;
    this.grid[key] = node;
    // console.log( node.toString() );
  }

  findViablePairs() {
    var total = 0;
    var checked = 0;

    for (var b in this.grid) {
      for (var a in this.grid) {
        checked++;
        if (this.grid[a].isViablePairWith( this.grid[b] )) {
          total++;
          // console.log( this.grid[a].toString() + " -> " + this.grid[b].toString() );
        }
      }
    }

    console.log("Checked " + checked);
    console.log("Grid size " + Object.keys( this.grid ).length);

    return total;
  }
}



function run( data ) {

  var griddy = new DiskGrid( data );
  var viablePairs = griddy.findViablePairs();

  $("#answer1").text( viablePairs );
  // $("#answer2").text( password.unscramble("decab"));

  // $("#answer1").append( $("<div/>").text( password.rulesExecuted + " rules executed"));
  // $("#answer1").append( $("<div/>").text( password.rulesExecuted + " rules executed"));
}


function waitForButton() {
  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day22").then( data => run( data ));
    }
  });
}



if (typeof $ !== 'undefined' ) {

  $( waitForButton );

} else {

  var $ = function() {
    return { text: str => { console.log( str ); }};
  };

  function getData( filename ) {
    return new Promise(
      function( resolve, reject ) {
        var fs = require("fs");
        resolve( fs.readFileSync( filename, 'utf8'));
      });
  }
  getData("input/day22").then( data => run( data.split(/\n/) ));
}


$( waitForButton );
