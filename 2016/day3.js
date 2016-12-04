/*global data, $ */

/**
 * See if triangle lengths are possible
 */
class TriangleChecker {
  /**
   * @param gfx the object that draws the output
   */
  constructor( gfx ) {
    this.gfx = gfx;
    this.answer = 0;
  }

  done() {
    this.gfx.updateAnswer( this.answer );
  }

  isTriangle( triangle ) {
    return (triangle[0] + triangle[1] > triangle[2]) &&
      (triangle[0] + triangle[2] > triangle[1]) &&
      (triangle[1] + triangle[2] > triangle[0]);
  }

  checkTriangles( triangles ) {
    for (var i = 0; i < triangles.length; i++) {
      var triangle = triangles[i].split(/\ +/).map( Number );
      if (this.isTriangle( triangle )) {
        this.answer++;
      }
    }
    this.done();
  }

  /**
   *  check for triangle in columns, not rows
   */
  checkTrianglesByColumn( triangles ) {
    for (var i = 0; i < triangles.length; i += 3) {
      var row1 = triangles[i+0].split(/\ +/).map( Number );
      var row2 = triangles[i+1].split(/\ +/).map( Number );
      var row3 = triangles[i+2].split(/\ +/).map( Number );

      for (var r=0; r < 3; r++) {
        if (this.isTriangle( [ row1[r], row2[r], row3[r] ] )) {
          this.answer++;
        }
      }
    }
    this.done();
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
  constructor( canvasId, answerId ) {
    var c = document.getElementById( canvasId );
    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.answerEl = document.getElementById( answerId );
  }

  updateAnswer( answer ) {
    $( this.answerEl ).text( answer );
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
}



//----------------------------------------------------------------------
function doPartOne() {
  var gfx = new Graphics("canvas1", "answer1");

  var checker = new TriangleChecker( gfx );
  checker.checkTriangles( data );
}

//----------------------------------------------------------------------
function doPartTwo() {

  $(".part2").show();

  var gfx = new Graphics("canvas2", "answer2");
  var checker = new TriangleChecker( gfx );
  checker.checkTrianglesByColumn( data );
}



// Do the things
function run() {
  doPartOne();
  doPartTwo();
}

$( run );
