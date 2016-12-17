/*global $, WorkerThread, getData, md5 */

/**
 * Write an assembly language processor
 */
class VaultMaze {
  /**
   */
  constructor( passcode ) {
    this.passcode = passcode;
    this.shortestPath = "";
    this.longestPath = "";
  }

  solve() {
    this.search( 0, 0, "");
  }

  isValid( x, y ) {
    return (x>=0) && (y >=0) && (x<4) && (y<4);
  }

  isVault( x, y ) {
    return (x === 3) && (y === 3);
  }

  /**
   * Only the first four characters of the hash are used; they represent,
   * respectively, the doors up, down, left, and right from your current position.
   */
  search( x, y, path ) {

    if (this.isVault( x, y )) {
      if (!this.shortestPath || (path.length < this.shortestPath.length)) {
        this.shortestPath = path;
        console.log( path );
      }
      if (path.length > this.longestPath.length) {
        this.longestPath = path;
        console.log( path.length );
      }
      return;
    }

    var hash = md5(this.passcode+path);
    // console.log( hash );

    if (this.isDoor( hash[0] ) && this.isValid( x, y-1 )) {
      this.search( x, y-1, path+"U" );
    }
    if (this.isDoor( hash[1] ) && this.isValid( x, y+1 )) {
      this.search( x, y+1, path+"D" );
    }
    if (this.isDoor( hash[2] ) && this.isValid( x-1, y )) {
      this.search( x-1, y, path+"L" );
    }
    if (this.isDoor( hash[3] ) && this.isValid( x+1, y )) {
      this.search( x+1, y, path+"R" );
    }
  }

  /**
   * Any b, c, d, e, or f means that the corresponding door is
   * open; any other character (any number or a) means that the
   * corresponding door is closed and locked.
   */
  isDoor( ch ) {
    return (ch === "b") || (ch === "c") || (ch === "d") || (ch === "e") || (ch === "f");
  }

}


/**
 *  Canvas drawing routines for keypad buttons and some text
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
    $("progress").attr("value", pct );
  }
}


// @return a promise to do the work
function runMaze( passcode ) {

  var maze = new VaultMaze( passcode );
  var gfx = new Graphics("canvas1", maze );

  // FIXME this is recursive, so poo

  // worker function
  function doWork( i ) {
    // cpu.executeNextLine();
    // return !cpu.programDone();
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
            gfx.drawMaze();
          },
          chunkSize: 10000
          // totalWorkUnits: data.length,
          // totalTime: 5000
        });
      worker.start();
    });
}


function run( passcode ) {

  var maze = new VaultMaze( passcode );
  maze.solve();

  $("#answer1").text( maze.shortestPath );
  $("#answer2").text( maze.longestPath.length );
}


function waitForButton() {
//  var passcode = "hijkl";
  var passcode = "rrrbmfta";

  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input );
    } else {
      run( passcode );
    }
  });
}

$( waitForButton );
