/*global $ */

// no freaking CORS on this URL!!!
// var inputURL = "http://adventofcode.com/2016/day/1/input";
// $.get( inputURL )
//   .done( function( data ) {
//     console.log( data );
//   });

var data = "L5, R1, R3, L4, R3, R1, L3, L2, R3, L5, L1, L2, R5, L1, R5, R1, L4, R1, R3, L4, L1, R2, R5, R3, R1, R1, L1, R1, L1, L2, L1, R2, L5, L188, L4, R1, R4, L3, R47, R1, L1, R77, R5, L2, R1, L2, R4, L5, L1, R3, R187, L4, L3, L3, R2, L3, L5, L4, L4, R1, R5, L4, L3, L3, L3, L2, L5, R1, L2, R5, L3, L4, R4, L5, R3, R4, L2, L1, L4, R1, L3, R1, R3, L2, R1, R4, R5, L3, R5, R3, L3, R4, L2, L5, L1, L1, R3, R1, L4, R3, R3, L2, R5, R4, R1, R3, L4, R3, R3, L2, L4, L5, R1, L4, L5, R4, L2, L1, L3, L3, L5, R3, L4, L3, R5, R4, R2, L4, R2, R3, L3, R4, L1, L3, R2, R1, R5, L4, L5, L5, R4, L5, L2, L4, R4, R4, R1, L3, L2, L4, R3";

var gfx;
var start = { x:200, y:200 };

function initGfx() {
  var c = document.getElementById("canvas");
  var gfx = c.getContext("2d");
  gfx.moveTo( start.x, start.y);

  return gfx;
}

function moveTo( gfx, pos ) {
  gfx.lineTo( start.x + pos.x, start.y + pos.y );
  gfx.stroke();
}

function finish( gfx, pos ) {
  gfx.strokeStyle="#FF0000";

  gfx.moveTo( start.x, start.y );
  gfx.lineTo( start.x + pos.x, start.y + pos.y );
  gfx.stroke();
}


function run() {
  var gfx = initGfx();

  var moves = data.split(", ");

  var dirs = {
    "N": { "L": "W", "R": "E" },
    "E": { "L": "N", "R": "S" },
    "S": { "L": "E", "R": "W" },
    "W": { "L": "S", "R": "N" }
  };

  var dir = "N";
  var pos = { x:0, y:0 };

  for (var i=0; i < moves.length; i++) {
    var turn = moves[i].slice( 0,1 );
    var distance = parseInt( moves[i].slice( 1 ));

    console.log( turn + "-" + distance );

    dir = dirs[dir][turn];

    if (dir === "N") {
      pos.x += distance;
    } else if (dir == "S") {
      pos.x -= distance;
    } else if (dir == "W") {
      pos.y -= distance;
    } else if (dir == "E") {
      pos.y += distance;
    }
    moveTo( gfx, pos );
  }

  finish( gfx, pos );
  console.log("Final postion is " + JSON.stringify( pos ));
  console.log("Shortest distance is " + (Math.abs( pos.x ) + Math.abs( pos.y )));
}

$( run );
