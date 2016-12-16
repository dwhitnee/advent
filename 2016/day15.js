/*global $, WorkerThread, getData, md5 */

/**
 *
 */
class Disc {
  /**
   */
  constructor( id, positions, initialPosition ) {
    this.id = id;
    this.pos = initialPosition;
    this.positions = positions;
  }

  // move one second
  tick() {
    this.pos += 1;
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
  constructor() {
    this.time = 0;
    this.ballPosition = 0;
    this.discs = {};
  }

  dropBall() {
    this.ballDropping = true;
  }

  dropBallAtTime( time ) {
    for (var i=0; i < time; i++) {
      this.tick();
    }
    this.releaseBall();
  }

  // move time forward
  tick() {
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
    if (this.ballPosition > 0) {
      var disc = this.discs[ this.ballPosition ];

      if (disc.isSlotLinedUp()) {
        this.ballPosition++;      // ball falls through

      } else {
        // ball bounces away
        this.ballPosition = -1;
        this.ballDropping = false;
      }
    }
  }

  ballFellThrough() {
    return this.ballPosition >= this.discs.length();
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
      this.addDisc( new Disc( match[1], match[2], match[4] ));
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
    this.gfx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var discId in  this.sculpture.discs) {
      var disc = this.sculpture.discs[discId];

      this.gfx.save();

      this.gfx.strokeStyle = "#ccc";
      this.gfx.lineWidth = 2;

      this.gfx.scale( 3, 3 );
      this.gfx.translate( 20, 10 + 30*discId );
      this.gfx.rotate( disc.angle - Math.PI/2 );

      this.gfx.beginPath();
      // x, y, radius, angles
      var gap = .2;
      this.gfx.arc( 0, 0, 10, gap, Math.PI-gap );
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
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
}


// @return a promise to do the work
function runProgram( data ) {

  var sculpture = new Sculpture( data );
  sculpture.parseDiscs( data );

  var gfx = new Graphics("canvas1", sculpture );

  // try starting sculpture at various times and see if ball falls through.
  // TBD

  sculpture.dropBall( 0 );

  // worker function
  function doWork( i ) {
    sculpture.tick();

    gfx.drawSculpture();
    return true;
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( sculpture );
        },
        {
          progressFn: (pct) => {
            gfx.progress( pct );
          },
          // chunkSize: 10,
          totalWorkUnits: 50,
          totalTime: 10000
        });
      worker.start();
    });
}


function run( salt ) {
  var testdata = [
    "Disc #1 has 5 positions; at time=0, it is at position 4.",
    "Disc #2 has 2 positions; at time=0, it is at position 1.",
    "Disc #3 has 5 positions; at time=0, it is at position 0.",
    "Disc #4 has 15 positions; at time=0, it is at position 2."
  ];

  runProgram( testdata ).then(
    pad => {
      $("#answer1").text( pad.keys[63].index + ": " + pad.keys[63].key );
      $("#answer1").append( $("<div/>").text( pad.candidates.length + " md5's evaluated"));
      console.log( pad.keys );
    });
}


function waitForButton() {
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
