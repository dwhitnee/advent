/*global $, md5, WorkerThread */

function getData() {
  return new Promise(
    function( resolve, reject ) {
      $.get("input/day6")
        .done( function( input ) {
          resolve( input.split( /\s+/ ));
        })
        .fail( function( err ) {
          reject( err );
        });
    });
}



/**
 * Find most frequently occurring letter in each position of a list of corrupted words
 * This is stupid
 */
class Message {
  constructor( input ) {
    this.input = input;
    this.decodedMessage = "";
  }

  // Build a map of letters and how often they occur in each position of a stirng
  // @return a promise to do the work
  decodeInput() {
    var self = this;
    this.letters = {};

    // worker function
    function doWork( i ) {

      var line = self.input[i];
      if (!line) {
        return false;
      }

      self.messageLength = line.length;

      for (var c=0; c < line.length; c++) {
        self.letters[c] = self.letters[c] || {};
        var ch = line.charAt( c );
        self.letters[c][ch] = self.letters[c][ch] || 0;
        self.letters[c][ch]++;
      }

      self.displayProgress( line, "corruptedMessage");

      return i < self.input.length;
    }

    return new Promise(
      function( resolve, reject ) {
        var worker = new WorkerThread( doWork, resolve, {
          // chunkSize: 10000,
          progressFn: (pct, index) => {
            $("#candidate1").text( index );
            self.displayProgress("corruptedMessage");
          }
        }  );
        worker.start();
      });
  }

  // most frequent letter in each position of the string
  get mostCommonMessage() {
    // sort letter maps by size descending
    for (var i=0; i < this.messageLength; i++) {
      var histogram = this.letters[i];
      var sorted = Object.keys( histogram ).sort( (a,b) => {
        return histogram[b] - histogram[a];
      });
      this.decodedMessage += sorted[0];
    }
    return this.decodedMessage;
  }

  // least frequent letter in each position of the string
  get leastCommonMessage() {
    // sort letter maps by size descending
    for (var i=0; i < this.messageLength; i++) {
      var histogram = this.letters[i];
      var sorted = Object.keys( histogram ).sort( (a,b) => {
        return histogram[a] - histogram[b];
      });
      this.decodedMessage += sorted[0];
    }
    return this.decodedMessage;
  }

  displayProgress( line, id ) {
    $("#"+id ).text( line );
  }
}




//----------------------------------------------------------------------
function crackMessage( data ) {
  var start = Date.now();
  var message = new Message( data );

  message.decodeInput( data ).then( function() {
    $("#message1").text( message.mostCommonMessage );
    $("#timing1").text( (Date.now() - start)  / 1000);

    start = Date.now();
    message = new Message( data );
    message.decodeInput( data ).then( function() {
      $("#message2").text( message.leastCommonMessage );
      $("#timing2").text( (Date.now() - start)  / 1000);
    });
  });

}

function run() {
  getData().then( data => { crackMessage( data ); });
}

$( run );
