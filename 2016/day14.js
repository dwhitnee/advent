/*global $, WorkerThread, getData, md5 */

/**
 *
 */
class OneTimePad {
  /**
   */
  constructor( salt ) {
    this.salt = salt;
    this.candidates = [];
    this.keys = [];
    this.candidateIndex = 0;
  }

  // iterateover candidates until a good one found
  generateNextKey() {
    for (;; this.candidateIndex++) {
      var key = this.isKey( this.getCandidateKey( this.candidateIndex ),
                            this.candidateIndex );
      if (key) {
        this.keys.push( key );
        this.candidateIndex++;
        return;
      }
    }
  }

  // rehash of hashes
  stretchMD5( str, times ) {
    for (var i=0; i < times; i++) {
      str = md5( str );
    }
    return str;
  }

  // do the md5 thing on this index, cache result
  getCandidateKey( i ) {
    if (!this.candidates[i]) {
      // this.candidates[i] = md5( this.salt.concat( i ));
      this.candidates[i] = this.stretchMD5( this.salt.concat( i ), 2017);
    }
    return this.candidates[i];
  }

  /**
   * A hash is a key only if: It contains three of the same character
   * in a row, like 777. Only consider the first such triplet in a hash.
   * One of the next 1000 hashes in the stream contains that same character
   * five times in a row, like 77777.
   */
  isKey( key, index ) {
    var triplet = this.getTriplet( key );
    if (!triplet) {
      return false;
    }
    for (var i=1; i <= 1000; i++) {
      var quintKey = this.getQuintuplet( this.getCandidateKey(index+i), triplet);
      if (quintKey) {
        return {
          key: key,
          index: index,
          quint: index+i,
          quintKey: quintKey
        };
      }
    }
    return false;
  }

  // return char if it shows up 3 times in a row in the string
  getTriplet( key ) {
    for (var i=0; i < key.length-2; i++) {
      if ((key[i] === key[i+1]) &&
          (key[i] === key[i+2])) {
        return key[i];
      }
    }
    return "";
  }

  // return char if it shows up 5 times in a row in the string
  getQuintuplet( key, target ) {
    for (var i=0; i < key.length-4; i++) {
      if ((key[i] === target) &&
          (key[i] === key[i+1]) &&
          (key[i] === key[i+2]) &&
          (key[i] === key[i+3]) &&
          (key[i] === key[i+4]))
      {
        return key[i];
      }
    }
    return "";
  }

}


/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   */
  constructor( canvasId, pad ) {
    var c = document.getElementById( canvasId );
    this.pad = pad;

    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
}


// @return a promise to do the work
function runProgram( salt ) {

  var pad = new OneTimePad( salt );
  var gfx = new Graphics("canvas1", pad );

  // worker function
  function doWork( i ) {
    pad.generateNextKey();
    return pad.keys.length < 64;
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( pad );
        },
        {
          progressFn: (pct) => {
            gfx.progress( 100 * pad.keys.length / 64 );
          },
          chunkSize: 10,
          totalWorkUnits: 64,
          totalTime: 5000
        });
      worker.start();
    });
}


function run( salt ) {
  var testdata = "abc";

  runProgram( salt ).then(
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
      run( input.trim() );
    } else {
      run("zpqevtbw");
    }
  });
}

$( waitForButton );
