/*global $, WorkerThread, getData, md5 */

/**
 * Write an assembly language processor
 */
class TrapRoom {
  /**
   */
  constructor( firstRow, numRows ) {
    this.rows = [ firstRow ];
    this.safeTiles = this.countSafeTiles( firstRow );

    var prevRow = firstRow;
    for (var i=1; i < numRows; i++) {
      prevRow = this.generateRowFromPreviousRow( prevRow );
      this.rows.push( prevRow );
      this.safeTiles += this.countSafeTiles( prevRow );
    }
  }

  print() {
    for (var i=0; i < this.rows.length; i++) {
      console.log( this.rows[i] );
      $("#room").append($("<p/>").text( this.rows[i] ));
    }
  }

  /**
   * The type of tile 2 is based on the types of tiles A, B, and C;
   * the type of tile 1 is based on tiles an imaginary "safe" tile and A, B.
   * Let's call these three tiles from the previous row the left,
   * center, and right tiles, respectively. Then, a new tile is a trap
   * only in one of the following situations:

   * Its left and center tiles are traps, but its right tile is not.
   * Its center and right tiles are traps, but its left tile is not.
   * Only its left tile is a trap.
   * Only its right tile is a trap.
   */
  generateRowFromPreviousRow( row ) {
    // LC.
    // .CR
    // L..
    // ..R
    var trap = "^";
    var safe = ".";
    var nextRow = "";

    for (var i=0; i < row.length; i++) {
      var L = (i>0)?row[i-1]:".";
      var C = row[i];
      var R = (i<row.length-1)?row[i+1]:".";
      var tile;
      if ((L === trap) && (C === trap) && (R === safe)) {
        tile = trap;
      } else if ((L === safe) && (C === trap) && (R === trap)) {
        tile = trap;
      } else if ((L === trap) && (C === safe) && (R === safe)) {
        tile = trap;
      } else if ((L === safe) && (C === safe) && (R === trap)) {
        tile = trap;
      } else {
        tile = safe;
      }
      nextRow += tile;
    }
    return nextRow;
  }

  countSafeTiles( row ) {
    return row.split(".").length - 1;
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


function run( firstRow, numRows ) {

  var room = new TrapRoom( firstRow[0], 40 );
  $("#answer1").text( room.safeTiles );
  room.print();

  room = new TrapRoom( firstRow[0], 400000 );
  $("#answer2").text( room.safeTiles );
}


function waitForButton() {
  var firstRow = ".^^.^.^^^^";

  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input, 40 );
    } else {
      getData("input/day18").then( data => run( data ));
    }
  });
}

$( waitForButton );
