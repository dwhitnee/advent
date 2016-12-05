/*global $, md5, WorkerThread */


var testdata = "abc";
var data = "ojvtpuvg";

/**
 * A door has an 8 char password, generated one character at a time by
 * finding the MD5 hash of the Door ID plus an increasing integer index (starting with 0).
 * If the MD5 hash starts with "00000" then the next char is part of the password.
 * Keep incrementing the index until all 8 chars are found.
 */
class Door {
  constructor( doorId ) {
    this.doorId = doorId;
    this.password = "........";
  }

  passwordCracked() {
    return this.password.indexOf(".") < 0;
  }

  updatePasswordChar( index, char ) {
    if (this.password.charAt( index ) === ".") {
      var password = this.password.split("");
      password[index] = char;
      this.password = password.join("");
    }
  }

  // takes ~25s
  calculatePasswordSilently() {
    for (var i=0, password=""; password.length < 8; i++) {
      var candidate = md5("" + self.doorId + i );
      if (candidate.match( /^00000/ )) {
        password += candidate.charAt( 5 );
        console.log("Password: " + password );
      }
    }
    return password;
  }

  // 400s for 100 chunkSize
  // 71s  for 1,000
  // 27s for 10,000
  // 23s for 100,000

  // Crack a password based on md5's that have leading "00000"
  // The next char is the password
  // @return a promise to do the work
  calculateSequentialPassword() {
    var self = this;

    // worker function
    function doWork( i ) {
      var candidate = md5("" + self.doorId + i );
      if (candidate.match( /^00000/ )) {
        self.updatePasswordChar( self.password.indexOf("."), candidate.charAt( 5 ));
        self.displayPasswordProgress("password1");
      }
      return !self.passwordCracked();
    }

    return new Promise(
      function( resolve, reject ) {
        var worker = new WorkerThread( doWork, resolve, {
          chunkSize: 10000,
          progressFn: (pct, index) => {
            $("#candidate1").text( index );
            self.displayPasswordProgress("password1");
          }
        }  );
        worker.start();
      });
  }

  // Crack a password based on md5's that have leading "00000"
  // The next two chars are the password index and char.
  // @return a promise to do the work
  calculateIndexedPassword() {
    var self = this;

    // worker function
    function doWork( i ) {
      var candidate = md5("" + self.doorId + i );
      if (candidate.match( /^00000/ )) {
        var pos = candidate.charAt( 5 );
        if ("01234567".indexOf( pos ) >= 0) {
          self.updatePasswordChar( pos, candidate.charAt( 6 ));
        }
        self.displayPasswordProgress("password2");
      }
      return !self.passwordCracked();
    }

    return new Promise(
      function( resolve, reject ) {
        var worker = new WorkerThread( doWork, resolve, {
          chunkSize: 10000,
          progressFn: (pct, index) => {
            $("#candidate2").text( index );
            self.displayPasswordProgress("password2");
          }
        }  );
        worker.start();
      });
  }

  displayPasswordProgress( id ) {
    var password = this.password;
    while (password.indexOf(".") >= 0) {
      password = password.replace(/\./, Math.random().toString(36)[5]);
    }
    $("#"+id ).text( password );
  }
}




//----------------------------------------------------------------------
function crackPassword( data ) {
  var start = Date.now();
  var door = new Door( data );

  door.calculateSequentialPassword().then( function() {
    $("#password1").text( door.password );
    $("#timing1").text( (Date.now() - start)  / 1000);

    start = Date.now();
    door = new Door( data );
    door.calculateIndexedPassword().then( function() {
      $("#password2").text( door.password );
      $("#timing2").text( (Date.now() - start)  / 1000);

      $("#password2").addClass("blink");
    });
  });


}

function run() {
  crackPassword( data );
}

$( run );
