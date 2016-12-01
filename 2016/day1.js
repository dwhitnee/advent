/*global $ */

// no freaking CORS on this URL!!!
// var inputURL = "http://adventofcode.com/2016/day/1/input";
// $.get( inputURL )
//   .done( function( data ) {
//     console.log( data );
//   });

// var data = "R8, R4, R4, R8";
var data = "L5, R1, R3, L4, R3, R1, L3, L2, R3, L5, L1, L2, R5, L1, R5, R1, L4, R1, R3, L4, L1, R2, R5, R3, R1, R1, L1, R1, L1, L2, L1, R2, L5, L188, L4, R1, R4, L3, R47, R1, L1, R77, R5, L2, R1, L2, R4, L5, L1, R3, R187, L4, L3, L3, R2, L3, L5, L4, L4, R1, R5, L4, L3, L3, L3, L2, L5, R1, L2, R5, L3, L4, R4, L5, R3, R4, L2, L1, L4, R1, L3, R1, R3, L2, R1, R4, R5, L3, R5, R3, L3, R4, L2, L5, L1, L1, R3, R1, L4, R3, R3, L2, R5, R4, R1, R3, L4, R3, R3, L2, L4, L5, R1, L4, L5, R4, L2, L1, L3, L3, L5, R3, L4, L3, R5, R4, R2, L4, R2, R3, L3, R4, L1, L3, R2, R1, R5, L4, L5, L5, R4, L5, L2, L4, R4, R4, R1, L3, L2, L4, R3";

var gfx;
var start = { x:200, y:100 };
var grid = {};

function initGfx() {
  var c = document.getElementById("canvas");
  var gfx = c.getContext("2d");
  gfx.translate( start.x, start.y );
  // gfx.scale( 10,10 );

  gfx.beginPath();
  gfx.strokeStyle="#777";
  gfx.moveTo( 0, 0 );

  return gfx;
}

function drawTo( gfx, pos ) {
  gfx.lineTo( pos.x, pos.y );
  gfx.stroke();
}

function markLocation( gfx, pos, color ) {
  gfx.save();
  gfx.strokeStyle = color;
  gfx.strokeRect( pos.x-20, pos.y-20, 40, 40);
  gfx.restore();
}

function finish( gfx, pos ) {
  gfx.closePath();  // end old line

  gfx.beginPath();
  gfx.setLineDash([1, 1]);  /*dashes are 5px and spaces are 3px*/
  gfx.moveTo( 0, 0 );
  gfx.lineTo( pos.x, pos.y );
  gfx.stroke();
}

// @return true if we've been here before
function haveWeBeenThere( pos ) {
  var beenThere = grid[pos.x+":"+pos.y];
  grid[pos.x+":"+pos.y] = true;

  console.log( JSON.stringify( grid ));
  return beenThere;
}

function moveX( pos, distance ) {
  var beenThere = false;
  var outBunny;

  for (var i=0; i < Math.abs( distance ); i++) {
    if (distance < 0 ) {
      pos.x -= 1;
    } else {
      pos.x += 1;
    }
    beenThere |= haveWeBeenThere( pos );
    if (!outBunny && beenThere) {
      outBunny = Object.assign({}, pos);  // shallow clone
    }
  }
  return outBunny;
}

function moveY( pos, distance ) {
  var outBunny;
  var beenThere = false;

  for (var i=0; i < Math.abs( distance ); i++) {
    if (distance < 0 ) {
      pos.y -= 1;
    } else {
      pos.y += 1;
    }
    beenThere |= haveWeBeenThere( pos );
    if (!outBunny && beenThere) {
      outBunny = Object.assign({}, pos);  // shallow clone
    }
  }
  return outBunny;
}


function run() {
  var gfx = initGfx();

  var moves = data.split(", ");
  var doneThat = false;

  var dirs = {
    "N": { "L": "W", "R": "E" },
    "E": { "L": "N", "R": "S" },
    "S": { "L": "E", "R": "W" },
    "W": { "L": "S", "R": "N" }
  };

  var dir = "N";
  var pos = { x:0, y:0 };
  var shortestDistance = 0;

  markLocation( gfx, pos, "#a0a0a0");

  for (var i=0; i < moves.length; i++) {
    var turn = moves[i].slice( 0,1 );
    var distance = parseInt( moves[i].slice( 1 ));

    dir = dirs[dir][turn];
    var bunny = undefined;

    if (dir === "N") {
      bunny = moveY( pos, distance );
    } else if (dir == "S") {
      bunny = moveY( pos, -distance );
    } else if (dir == "W") {
      bunny = moveX( pos, -distance );
    } else if (dir == "E") {
      bunny = moveX( pos, distance );
    }
    drawTo( gfx, pos );

    if (bunny && !doneThat) {
      doneThat = true;
      shortestDistance = Math.abs( bunny.x ) + Math.abs( bunny.y );
      $("#answer2").text( shortestDistance );
      markLocation( gfx, bunny, "#00FF00");
    }
  }

  markLocation( gfx, pos, "#FF0000");
  finish( gfx, pos );

  shortestDistance = Math.abs( pos.x ) + Math.abs( pos.y );

  console.log("Final postion is " + JSON.stringify( pos ));
  console.log("Shortest distance is " + shortestDistance );
  $("#answer1").text( shortestDistance );
}

$( run );
