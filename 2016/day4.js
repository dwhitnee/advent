/*global $ */

// var inputURL = "http://adventofcode.com/2016/day/4/input";  // No CORS alas

function getData( error, callback ) {
  $.get("input/day4")
    .done( function( input ) {
      callback.call( null, input.split( /\s+/ ) );
    });
}

var testdata = [
  "aaaaa-bbb-z-y-x-123[abxyz]",
  "a-b-c-d-e-f-g-h-987[abcde]",
  "not-a-real-room-404[oarel]",
  "totally-real-room-200[decoy]",
  "qzmt-zixmtkozy-ivhz-343[zimth]"
];



/**
 * A room is real (not a decoy) if the checksum is the five most
 * common letters in the encrypted name, in order, with ties broken by
 * alphabetization.
 * Ex: aaaaa-bbb-z-y-x-123[abxyz]
*/
class Room {
  constructor( encryptedRoomName ) {
    this.encryptedRoomName = encryptedRoomName;

    var tokens = encryptedRoomName.match( /^(.*)-(.*)\[(.*)\]/ );
    if (!tokens || tokens.length < 3) {
      throw new Error("illegal room name! " + encryptedRoomName);
    }

    this.name = tokens[1];      // the character before brackets except the sectorId
    this.sectorId = parseInt( tokens[2] );  // number after last "-"
    this.givenChecksum = tokens[3];  // the part in brackets
  }

  // rot13 by the sectorId
  get decryptedName() {
    if (this._decryptedName) {
      return this._decryptedName;
    }

    var amount = this.sectorId % 26;
    var str = this.name;
    this._decryptedName = "";

    for (var i = 0; i < str.length; i ++) {
      var c = str[i];
      if (c==="-") c = " ";
      var code = str.charCodeAt(i);

      if ((code >= 65) && (code <= 90))        // Uppercase letters
        c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
      else if ((code >= 97) && (code <= 122))  // Lowercase letters
        c = String.fromCharCode(((code - 97 + amount) % 26) + 97);

      this._decryptedName += c;
    }
    return this._decryptedName;
  }

  /**
   * Make a sorted histogram of letters in name
   * @return true if checksum is the list of most common letters in order
   */
  isValid() {
    if (this._isValid !== undefined) {
      return this._isValid;
    }

    var letters = {};
    for (var i=0; i < this.name.length; i++) {
      letters[this.name[i]] = letters[this.name[i]] | 0;  // handle nulls
      letters[this.name[i]] += 1;
    }
    letters["-"] = 0;

    // sort histogram be frequency descending, tie break is alpha ascending
    this.checksum = Object.keys( letters ).sort( (a,b) => {
      return (letters[b] - letters[a]) || ((a>b) ? 1 : -1);
    });

    var checksumInvalid;
    for (i=0; i < this.givenChecksum.length; i++) {
      checksumInvalid |= (this.checksum[i] !== this.givenChecksum[i]);
    }

    this._isValid = !checksumInvalid;

    return this._isValid;
  }
}


/**
 *  Canvas drawing routines for ???
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   * @param pinId      HTML text id to display PIN
   */
  constructor( canvasId, answerId, roomId ) {
    var c = document.getElementById( canvasId );
    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.answerEl = document.getElementById( answerId );
    this.roomEl = document.getElementById( roomId );
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }

  drawRoom( room ) {
    if (room.isValid()) {
      $( this.roomEl ).css("color", "green");
      $("#rooms").append( $("<li>").text( room.decryptedName ));
      if (room.decryptedName === "northpole object storage") {
        $("#answer2").text( room.sectorId );
      }
    } else {
      $( this.roomEl ).css("color", "red");
    }

    $( this.roomEl ).html( room.name );
  }

  updateAnswer( answer ) {
    $( this.answerEl ).text( answer );
  }
}




/**
 * @param rooms - array of room strings
 * @param gfx - graphics handler
 * @param - callback( sumOfValidSectorIds ) when done
 */
function addUpValidSectorIds( rooms, gfx, callback ) {

  var sectorIdSum = 0;
  var delay = 10000 / rooms.length;  // take 10s total

  var checkRoom = function( roomIndex ) {
    gfx.progress( 100* roomIndex / rooms.length);

    if (rooms.length == roomIndex) {
      callback.call( null, sectorIdSum );
      return;
    }

    if (rooms[roomIndex]) {
      var room = new Room( rooms[roomIndex] );
      gfx.drawRoom( room );
      if (room.isValid()) {
        sectorIdSum += room.sectorId;
      }
    }

    setTimeout( function() {
      checkRoom( ++roomIndex );
    }, delay );
  };

  checkRoom( 0 );
}



//----------------------------------------------------------------------
function doPartOne( data ) {
  var gfx = new Graphics("canvas1", "answer1", "room");

  var promise = new Promise(
    function( resolve, reject ) {
      addUpValidSectorIds(
        data, gfx,
        function( total ) {
          gfx.updateAnswer( total );
          resolve();
        });
    });
}


//----------------------------------------------------------------------
function doPartTwo( data ) {
  $(".part2").show();

  var gfx = new Graphics("canvas2", "answer2", "duration2");

  addUpValidSectorIds(
    data, gfx,
    function( total ) {
      gfx.updateAnswer( total );
    });
}


function run() {
  // doPartOne( testdata );
  getData( {}, doPartOne );
}

$( run );
