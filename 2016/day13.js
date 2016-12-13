/*global $, WorkerThread, getData */

/**
 * All walls are
 */
class Maze {
  /**
   */
  constructor( favoriteNumber ) {
    this.favoriteNumber = favoriteNumber|0;
  }

  setStart( x, y ) {
    this.start = { x:x, y:y };
  }
  setGoal( x, y ) {
    this.goal = { x:x, y:y };
  }

  print( width, height ) {
    for (var y=0; y < height; y++) {
      var str = "";
      for (var x=0; x < width; x++) {
        str += this.isWall(x,y)?"#":".";
      }
      console.log( str );
    }
  }

  /**
   * @returns true if odd sum of bits of x2+3x+2xy+y+y2 + favoriteNumber
   */
  isWall( x, y ) {
    x = x|0;  // convert to int
    y = y|0;

    var outWall = 0;
    var value = x*x + 3*x + 2*x*y +y + y*y + this.favoriteNumber;
    var bits = (value >>> 0).toString(2);
    for (var i=0; i < bits.length; i++) {
      outWall += parseInt( bits.charAt(i) );
    }
    return outWall % 2;
  }


}


/**
 *  Canvas drawing routines for maze and path
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   */
  constructor( canvasId, maze ) {
    var c = document.getElementById( canvasId );
    this.maze = maze;

    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );
  }

  progress( pct ) {
    // $("progress").attr("value", 100 * this.cpu.pc / this.cpu.program.length );
  }
}


// @return a promise to do the work

function doAllTheThings( favoriteNumber ) {

  var maze = new Maze( favoriteNumber );
  var gfx = new Graphics("canvas1", maze );

  maze.setStart( 1, 1 );
  maze.setGoal( 7, 4 );

  // worker function
  function doWork( i ) {
    maze.print( 10, 7 );
    return false;
    // maze.findNextStepInPath();
    // return !maze.foundPath();
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( maze );
        },
        {
          progressFn: (pct) => {
            gfx.progress( pct );
          },
          chunkSize: 10000
          // totalWorkUnits: data.length,
          // totalTime: 5000
        });
      worker.start();
    });
}

function run( favoriteNumber ) {
  doAllTheThings( favoriteNumber ).then(
    maze => {
      $("#answer1").text( maze.foo );
    });
}

function waitForButton() {
  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input );
    } else {
      run( 1352 );
    }
  });
}

$( waitForButton );
