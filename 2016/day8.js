/*global $, WorkerThread, getData */

/**
 * Logic to walk the data to figure out the PIN for this keypad
 */
class Screen {

  /**
   * @param keypad data structure for the size and shape of keys on keypad
   * @param gfx the object that draws the output
   */
  constructor( width, height) {
    this.width = width;
    this.height = height;
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (var x=0; x < this.width; x++) {
      this.grid[x] = [];
    }
  }

  pixel( x, y ) {
    return this.grid[x][y];
  }

  pixelsLit() {
    var lit = 0;
    for (var x=0; x < this.width; x++) {
      for (var y=0; y < this.height; y++) {
        lit = lit + (this.pixel( x, y )? 1:0);
      }
    }
    return lit;
  }

  /**
   * rect 1x3
   * rotate row y=2 by 8
   * rotate column x=5 by 1
   *
   * rect AxB turns on all of the pixels in a rectangle at the
   * top-left of the screen which is A wide and B tall.
   *
   * rotate row y=A by B shifts all of the pixels in row A (0 is the
   * top row) right by B pixels. Pixels that would fall off the right
   * end appear at the left end of the row.
   *
   * rotate column x=A by B shifts all of the pixels in column A (0 is
   * the left column) down by B pixels. Pixels that would fall off the
   * bottom appear at the top of the column.
   *
   */
  handleCommand( cmd ) {
    if (!cmd) return;

    var tokens = cmd.split(" ");

    if (tokens[0] === "rect") {
      var xy = tokens[1].split("x");
      this.fillRect( xy[0], xy[1] );
    }

    if (tokens[0] === "rotate") {
      if (tokens[1] === "row") {
        tokens = cmd.match(/rotate row y=(\d+) by (\d+)/ );
        this.rotateRowBits( tokens[1], tokens[2] );

      } else if (tokens[1] === "column") {
        tokens = cmd.match(/rotate column x=(\d+) by (\d+)/ );
        this.rotateColumnBits( tokens[1], tokens[2] );

      } else {
        // bad data!
      }
    }
  }

  /* fillrect starting at upper left corner */
  fillRect( w, h ) {
    for (var x = 0; x < w; x++) {
      for (var y = 0; y < h; y++) {
        this.grid[x][y] = true;
      }
    }
  }

  // rotate bits down in column (with wrapping)
  rotateColumnBits( col, shift ) {
    for (var i = 0; i < shift; i++) {
      var last = this.grid[col][this.height-1];  // save last item in col
      for (var y=this.height-1; y > 0; y--) {
        this.grid[col][y] = this.grid[col][y-1];
      }
      this.grid[col][0] = last;  // rotate around the corner
    }
  }

  // rotate bits right in given row (with wrapping)
  rotateRowBits( row, shift ) {
    for (var i = 0; i < shift; i++) {
      var last = this.grid[this.width-1][row];  // save last item in row
      for (var x=this.width-1; x > 0; x--) {
        this.grid[x][row] = this.grid[x-1][row];
      }
      this.grid[0][row] = last;  // rotate around the corner
    }
  }
}


/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   * @param pinId      HTML text id to display PIN
   */
  constructor( canvasId, screen ) {
    var c = document.getElementById( canvasId );
    this.screen = screen;
    this.gfx = c.getContext("2d");
  }

  progress( pct ) {
    $("progress").attr("value", pct );
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

    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );

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
function processScreenCommands( data ) {

  var screen = new Screen(50,6);
  var gfx = new Graphics("canvas1", screen );
  gfx.drawScreen();

  // worker function
  function doWork( i ) {
    var line = data[i];
    if (!line) {
      return false;  // EOF or bad data
    }
    screen.handleCommand( line );
    return i < data.length;
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          // gfx.restore();
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





/* TEST DATA
rect 3x2
rotate column x=1 by 1
rotate row y=0 by 4
rotate column x=1 by 1
*/

function run( data ) {
  processScreenCommands( data ).then(
    pixels => {
      $("#answer1").text( pixels );
    });
}

function waitForButton() {
  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day8").then( data => run( data ));
    }
  });
}

$( waitForButton );
