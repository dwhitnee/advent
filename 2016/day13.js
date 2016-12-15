/*global $, Maze, WorkerThread, getData, Worker */

// import lib/maze.js

/**
 *  Canvas drawing routines for maze and path
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   * @param maze only passed to get initial dimesions of canvas
   */
  constructor( canvasId, maze ) {
    var c = document.getElementById( canvasId );
    this.scale = 3;
    c.width = maze.width * this.scale*3;
    c.height = maze.height * this.scale*3;

    this.maze = maze;
    this.gfx = c.getContext("2d");
  }

  progress( pct ) {
    // $("progress").attr("value", 100 * this.cpu.pc / this.cpu.program.length );
  }

  drawMaze( maze ) {
    var wall = "#333";
    var clear = "#ccc";
    var path = "#afa";
    var there = "#eee";
    var neutral = "#aaa";
    var endPoint = "#faa";

    console.log("Drawing!");
    this.gfx.save();

    this.gfx.translate( 10, 10 );
    this.gfx.scale( this.scale, this.scale );

    this.gfx.fillStyle = neutral;
    this.gfx.fillRect( -10, -10, maze.width*3+20, maze.height*3+20 );

    for (var x = 0; x < maze.width; x++) {
      for (var y = 0; y < maze.height; y++) {
        if (maze.isWall(x, y)) {
          this.gfx.fillStyle = wall;
        } else if (x === maze.start.x && y === maze.start.y) {
          this.gfx.fillStyle = endPoint;
        } else if (x === maze.goal.x && y === maze.goal.y) {
          this.gfx.fillStyle = endPoint;
        } else if (maze.path && maze.isPath(x, y)) {
          this.gfx.fillStyle = path;
        } else if (maze.path && maze.wasHere(x, y)) {
          this.gfx.fillStyle = there;
        } else {
          this.gfx.fillStyle = clear;
        }
        this.gfx.fillRect( x*3, y*3, 2, 2);
      }
    }

    this.gfx.restore();
  }
}


/*
// @return a promise to do the work
function doAllTheThings( favoriteNumber ) {

  var maze = new Maze( favoriteNumber );

  // FIXME!!!  Need WebWorkers to make graphics work in a recursive function

  maze.setStart( 1, 1 );
  // maze.setGoal( 7, 4 );
  maze.setGoal( 31, 39 );

  var gfx = new Graphics("canvas1", maze );
  maze.gfx = gfx;

  maze.solve();
  gfx.drawMaze();
  maze.print();

  // maze.print( 50, 50 );
  $("#answer1").text( Object.keys( maze.path ).length );

  // worker function
  function doWork( i ) {
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
          }
          // chunkSize: 10000
          // totalWorkUnits: data.length,
          // totalTime: 5000
        });
      worker.start();
    });
}
 */


function run( favoriteNumber ) {

  var maze = new Maze( favoriteNumber );
  maze.setStart( 1, 1 );
  maze.setGoal( 31, 39 );

  var gfx = new Graphics("canvas1", maze );
  gfx.drawMaze( maze );
  maze.print();

  var worker = new Worker("lib/maze.js");  // maze is also a worker, hacky?

  worker.onmessage = function(e) {
    // console.log("receieved: " + e);
    var maze = e.data;
    maze.__proto__ = Maze.prototype;  // cheat and re-objectify
    gfx.drawMaze( maze );
    console.log( Object.keys( maze.path ).length + ", " + Object.keys( maze.beenThere ).length );
    // maze.print();
  };

  // tell worker what to do
  // receive updates from worker
  worker.postMessage( maze );  // this will solve the maze, expect updates as it goes.


  // doAllTheThings( favoriteNumber ).then(
  //   maze => {
  //     $("#answer1").text( maze.foo );
  //   });
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
