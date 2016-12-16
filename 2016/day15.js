/*global $, WorkerThread, getData, md5 */

/**
 *
 */
class Disc {
  /**
   */
  constructor( id, positions, initialPosition ) {
    this.id = id|0;
    this.pos = initialPosition|0;
    this.positions = positions|0;
  }

  // move one second
  tick() {
    this.pos += 1;
    this.pos %= this.positions;
  }

  // move one second
  tickN( times ) {
    this.pos += times;
    this.pos %= this.positions;
  }

  // ball will fall through slot at position #0
 isSlotLinedUp() {
    return !this.pos;
  }

  get angle() {
    return 2*Math.PI * this.pos/this.positions;
  }
}

/**
 * If you press the button exactly at time=0, the capsule would start
 * to fall; it would reach the first disc at time=1. Since the first
 * disc was at position 4 at time=0, by time=1 it has ticked one
 * position forward. As a five-position disc, the next position is 0,
 * and the capsule falls through the slot.
*/
class Sculpture {
  constructor( data ) {
    this.time = 0;
    this.ballPosition = 0;
    this.ballDropping = false;
    this.discs = {};
    this.parseDiscs( data );
  }

  dropBall() {
    this.ballDropping = true;
  }

  dropBallAtTime( time ) {
    this.tickN( time );
    this.dropBall();
  }

  tickN( times ) {
    this.time += times;
    for (var id in  this.discs) {
      this.discs[id].tickN( times );
    }
    if (this.ballDropping) {
      this.checkBall();
    }
  }

  // move time forward, rotate discs, move ball down
  tick() {
    this.time++;
    for (var id in  this.discs) {
      this.discs[id].tick();
    }
    if (this.ballDropping) {
      this.checkBall();
    }
  }

  // see if the ball fell through the current disc
  // updates ball and sculpture state
  checkBall() {
    this.ballPosition++;

    var disc = this.discs[ this.ballPosition ];

    if (disc && !disc.isSlotLinedUp()) {
      // ball bounces away
      this.ballPosition = -1;
      this.ballDropping = false;
    }
  }

  ballFellThrough() {
    return this.ballPosition >= Object.keys( this.discs ).length+1;
  }

  addDisc( disc ) {
    this.discs[disc.id] = disc;
  }

  // "Disc #1 has 5 positions; at time=0, it is at position 4."
  parseDiscs( data ) {
    for (var i=0; i < data.length; i++) {
      var match = data[i].match(
          /Disc #(\d+) has (\d+) positions; at time=(\d+), it is at position (\d+)./);
      // cheat and assume always at time 0
      if (match) {
        this.addDisc( new Disc( match[1], match[2], match[4] ));
      }
    }
  }
}



/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   */
  constructor( canvasId, sculpture ) {
    this.canvas = document.getElementById( canvasId );
    this.sculpture = sculpture;
    this.gfx = this.canvas.getContext("2d");
  }

  drawSculpture() {
    $("#time").text( this.sculpture.time );

    this.gfx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gfx.save();

    this.gfx.scale( 3, 3 );
    this.gfx.translate( 20, 10 );

    this.gfx.save();
    this.gfx.translate( 0, 30*this.sculpture.ballPosition );
    this.gfx.beginPath();
    this.gfx.fillStyle = "#f33";
    this.gfx.arc( 0, 0, 3, 0, 2*Math.PI );
    this.gfx.fill();
    this.gfx.restore();

    for (var discId in  this.sculpture.discs) {
      var disc = this.sculpture.discs[discId];

      this.gfx.save();

      this.gfx.strokeStyle = "#ccc";
      this.gfx.fillStyle = "black";
      this.gfx.lineWidth = 2;

      this.gfx.translate( 0, 30*discId );
      this.gfx.rotate( disc.angle - Math.PI/2 );  // -90 deg so north is up

      var gap = .2;
      this.gfx.beginPath();
      this.gfx.arc( 0, 0, 10, gap, Math.PI-gap );      // x, y, radius, angles
      this.gfx.closePath();
      this.gfx.stroke();

      this.gfx.beginPath();
      this.gfx.arc( 0,0, 10, Math.PI+gap, 2*Math.PI-gap );
      this.gfx.closePath();
      this.gfx.stroke();

      this.gfx.rotate( Math.PI/2 );
      this.gfx.fillText( discId, 3, 3 );

      this.gfx.restore();
    }
    this.gfx.restore();
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
}


// @return a promise to do the work
function dropBallAt( dropTime, data, gfx ) {

  $("#dropTime").text( dropTime );

  var sculpture = new Sculpture( data );
  gfx.sculpture = sculpture;
  sculpture.dropBallAtTime( dropTime );

  // worker function
  function doWork( i ) {
    gfx.drawSculpture();
    if (i => dropTime) {
      sculpture.dropBall();
      sculpture.tick();
      return sculpture.ballDropping && !sculpture.ballFellThrough();
    } else {
      sculpture.tick();
      return true;
    }
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          if (sculpture.ballFellThrough()) {
            resolve( sculpture );
          } else {
            reject( sculpture );
          }
        },
        {
          progressFn: (pct) => {
            gfx.drawSculpture();
            gfx.progress( pct );
          },
          // chunkSize: 1000
          totalWorkUnits: 10,
          totalTime: 10000
        });

      gfx.drawSculpture();
      setTimeout( function() {
        worker.start();
      }, 1000 );

    });
}


function run( data ) {
  var dropTime = findRightTimeToDropBall( data );

  var gfx = new Graphics("canvas1");

  function seeIfBallFallsThrough( startTime) {
    dropBallAt( startTime, data, gfx )
      .then( sculpture => {
        gfx.drawSculpture();
        $("#answer1").text( startTime );
      })
      .catch( sculpture => {
        seeIfBallFallsThrough( startTime+1 );
      });
  }

  seeIfBallFallsThrough( dropTime );
}


function findRightTimeToDropBall( data ) {

  for (var startTime=0; ; startTime++) {
    if (!(startTime % 10000)) {
      console.log( startTime );
    }

    var sculpture = new Sculpture( data );

    //  "Disc #N has 11 positions; at time=0, it is at position 0.",
    // sculpture.addDisc( new Disc( data.length, 11, 0 ));

    sculpture.dropBallAtTime( startTime );

    while (sculpture.ballDropping && !sculpture.ballFellThrough()) {
      sculpture.tick();
    }
    if (sculpture.ballFellThrough()) {
      console.log("It worked! Start = " + startTime );
      return startTime;
    }
  }
}


function waitForButton() {
  var testdata = [
    "Disc #1 has 5 positions; at time=0, it is at position 4.",
    "Disc #2 has 2 positions; at time=0, it is at position 1.",
    // "Disc #3 has 5 positions; at time=0, it is at position 0.",
    // "Disc #4 has 15 positions; at time=0, it is at position 2."
  ];


  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day15").then( data => run( data ));
    }
  });
}

$( waitForButton );
