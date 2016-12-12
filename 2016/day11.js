/*global $, WorkerThread, getData */

var data = [
];

//var data = ["ULL","RRDDD","LURDL","UUUUD"];

/**
 * Logic to walk the data to figure out the PIN for this keypad
 */
class Elevator {
  /**
   */
  constructor() {
    this.floors = [];
  }

  parseFloors( data ) {
    var floors = [];
    for (var i=0; i < data.length; i++) {
      floors[i] = {};
      var match = data[i].match(/The (.*) floor contains (nothing relevant|.*)./);
      if (match[2] !== "nothing relevant") {
        floors[i].things = this.findThingsOnFloor( match[2] );
      }
      floors[i].name = match[1];
    }
    console.log( JSON.stringify( floors ));
  }

  findThingsOnFloor( inventory ) {
    var list = inventory.split(",");
    var things = [];
    for (var i=0; i < list.length; i++) {
      var match = list[i].match(/.*a (.*-compatible microchip|.* generator)/);
      things.push( match[1] );
    }
    return things;
  }

}


/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   * @param pinId      HTML text id to display PIN
   * @param durationId HTML text id to display time left
   */
  constructor( canvasId, screen, durationId ) {
    var c = document.getElementById( canvasId );
    this.screen = screen;
    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );
    this.durationEl = document.getElementById( durationId );
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
  updateDuration( crackTime ) {
    $( this.durationEl).text( crackTime );
  }

  /**
   * Draw a filled out outline rect to represent each button
   * @param pressed if true draw a filled rect
   * @param color override color of button
   */
  drawScreen() {
    var on = "#ccc";
    var off = "#aaa";
    var neutral = "#888";

    this.gfx.save();

    this.gfx.fillStyle = neutral;
    this.gfx.fillRect( -10, -10, this.screen.width*3+20, this.screen.height*3+20 );

    for (var x = 0; x < this.screen.width; x++) {
      for (var y = 0; y < this.screen.height; y++) {
        if (this.screen.pixel( x, y )) {
          this.gfx.fillStyle = on;
        } else {
          this.gfx.fillStyle = off;
        }
        this.gfx.fillRect( x*3, y*3, 2, 2);
      }
    }
    this.gfx.restore();
  }
}



// @return a promise to do the work
function doStuff( data ) {

  var elevator = new Elevator();
  elevator.parseFloors( data );

  var gfx = new Graphics("canvas1", elevator );
  // gfx.drawScreen();


  // worker function
  function doWork( i ) {
    var line = data[i];
    if (!line) {
      return false;
    }
    screen.handleCommand( line );
    return i < data.length;
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( screen.pixelsLit() );
        },
        {
          progressFn: (pct) => {
            gfx.drawScreen( screen );
            gfx.progress( pct );
          },
          totalWorkUnits: data.length,
          totalTime: 5000
        });
      worker.start();
    });
}

function run() {

  var testdata = [
    "The first floor contains a hydrogen-compatible microchip, and a lithium-compatible microchip.",
    "The second floor contains a hydrogen generator.",
    "The third floor contains a lithium generator.",
    "The fourth floor contains nothing relevant."
  ];

  var elevator = new Elevator();
  elevator.parseFloors( testdata );

  // getData("input/day11").then(
  //   data => {
  //     elevator.parseFloors( data );
  //     elevator.computeMoves().then(
  //       moves => {
  //         $("#answer1").text( moves );
  //       });
  //   });
}

$( run );
