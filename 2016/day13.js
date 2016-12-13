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
    this.width = x + 10;
    this.height = y + 10;
  }
  setWasHere(x, y) {
    this.beenThere[x+":"+y] = true;
  }
  wasHere(x, y) {
    return this.beenThere[x+":"+y];
  }
  setPath(x, y) {
    this.path[x+":"+y] = true;
  }
  isPath(x, y) {
    return this.path[x+":"+y];
  }

  solve() {
    this.beenThere = {};
    this.path = {};
    this.recursiveSolve( this.start.x, this.start.y );
  }

  // follow a wall until we find our goal
  recursiveSolve(x, y) {
    if (x === this.goal.x && y === this.goal.y) return true;   // Done!

    if (this.isWall(x, y) || this.wasHere(x, y)) return false;   // can't get there from here

    // If you are on a wall or already were here
    this.setWasHere(x, y);

    if (x != 0) {  // Checks if not on left edge
      if (this.recursiveSolve(x-1, y)) { // Recalls method one to the left
        this.setPath(x, y);
        return true;
      }
    }
//  if (x != width - 1) { // Checks if not on right edge (there is no right edge)
      if (this.recursiveSolve(x+1, y)) { // Recalls method one to the right
        this.setPath(x, y);
        return true;
      }
//  }
//  if (y != height- 1) { // Checks if not on bottom edge (there is no bottom edge)
      if (this.recursiveSolve(x, y+1)) { // Recalls method one down
        this.setPath(x, y);
        return true;
      }
//  }
    if (y != 0) {  // Checks if not on top edge
      if (this.recursiveSolve(x, y-1)) { // Recalls method one up
        this.setPath(x, y);
        return true;
      }
    }
    return false;
  }

  print() {
    for (var y=0; y < this.height; y++) {
      var str = "";
      for (var x=0; x < this.width; x++) {
        if ((x === this.goal.x) &&
            (y === this.goal.y))
        {
          str += "G";
        } else if ((x === this.start.x) &&
                   (y === this.start.y))
        {
          str += "S";
        } else {
          if (this.isWall(x,y)) str += "|";
          else if (this.isPath(x,y)) str += "O";
          else str += ".";
        }
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
    this.scale = 3;
    c.width = maze.width * this.scale*3;
    c.height = maze.height * this.scale*3;

    this.maze = maze;
    this.gfx = c.getContext("2d");
  }

  progress( pct ) {
    // $("progress").attr("value", 100 * this.cpu.pc / this.cpu.program.length );
  }

  drawMaze() {
    var wall = "#ccc";
    var clear = "#333";
    var path = "#afa";
    var neutral = "#aaa";
    var endPoint = "#faa";

    this.gfx.save();

    this.gfx.translate( 10, 10 );
    this.gfx.scale( this.scale, this.scale );

    this.gfx.fillStyle = neutral;
    this.gfx.fillRect( -10, -10, this.maze.width*3+20, this.maze.height*3+20 );

    for (var x = 0; x < this.maze.width; x++) {
      for (var y = 0; y < this.maze.height; y++) {
        if (this.maze.isWall(x, y)) {
          this.gfx.fillStyle = wall;
        } else if (x === this.maze.start.x && y === this.maze.start.y) {
          this.gfx.fillStyle = endPoint;
        } else if (x === this.maze.goal.x && y === this.maze.goal.y) {
          this.gfx.fillStyle = endPoint;
        } else if (this.maze.path && this.maze.isPath(x, y)) {
          this.gfx.fillStyle = path;
        } else {
          this.gfx.fillStyle = clear;
        }
        this.gfx.fillRect( x*3, y*3, 2, 2);
      }
    }

    this.gfx.restore();
  }
}


// @return a promise to do the work

function doAllTheThings( favoriteNumber ) {

  var maze = new Maze( favoriteNumber );

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
