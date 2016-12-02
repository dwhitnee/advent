/*global $ */

var data = [
  "LLLUDRDLLULDUDLLRLUDURULDURRRRLLURLDLDDDULLDDUDLRDLRDUURRDUUDLLRUUDDLULURDLRDUUDUDRURULLLLDRULDDLRDDRDLRDDLURLDDUDLLUUDLRDDDDLULUUURRDLUUDDLULLURRRDULLUDUDRDRDDRLDLLRLRDDDRDLULLUULDLLLRRDDUURUURDLLDRRDDLRULDLLDRLLUDRRDLUUULDLURLLDDURRUULLLLLRLUDLDDLLLURRRDUDULRULULDDLLDLRDDDUULRLRDUURLURRUDDURRUUDUDLDDLDULDDDDDULRULRDLRLDLRDLDDLUDRDUUDLDUDUDLLLRLUUDRUDDDRDRURRLLLDLUULDUULRDLULLUURLDRRRLDRLUDRRURLDULULDRUDDULLLDRDLLULUDDDDRDRULDULRRRRDDRULDLRDU",
  "DLDDRRDLLDUURRLULLLLRDRLUDURLDRRDURRRRUUDDUDRRDDDRRLDDLDDLURDLDRLUDULDUDUUDDDLLULRRLLUDULLLUULDDRDDUDUUDULURULULLDRLRUURDRDDLRRUDRUULLLLURRUDRDULDDRURRURLLLLLRLLLRLLUDUDLRDLULDUDLULLLUUDLLDDDUDUDLLRRDLRDLLLRRLRUDRDUDRURLUUURULLDDDDLLURDULURRLLLRLRRULLRRRLUUULLLLRLRDUURRDUURLLLDRDURRRULDDUDRRDLRLDLLRUDDLLUDRLLUUDRLLLLLLUDLURLLRUDRUUUULDLUDULLDDDDRLURUURDDDURRRLRLUDUUDURDDDDRRLRDLURDDLLULDRDDURLLURULUUUUURDUUULDRRLLURRRRRLDDUULLRULLDLDLDLRRRDRLDRUUD",
  "RLDRRRURULDLUDLDUDLLDUUURRDUDDURULLRRDDULUUDRRRULRUURRRLUUULRDRUDRRLLRLURDLDRDRDLLUDRUULRUDRUDDRURLRLURRDDRRURUUDRRDDRURURUDUUUDUDRRLRDRUUURLLUUUDLRUUDDRDDDDLDRLRDUDDULDDLRLLRURLLURLDDLDLDDULLDDUUURDLRUDUUDLDURDDRUULDRDDRDDDUUUDRDRDDRRDRRDLRDRURDUDDLUUUDULLUULULULRDRUUDDURURDRRRRLUDLDUDURLDRURDLLUUUDLRRDRRURDDULULURLDUDDLUDLDDLLRLDULLULULURUURLDULUDLLUUDLDDULDRRDDUULLUDLDLLRDRDURDDURDDURLDDURUURLLRURURUDDURRDRLRLDDUUDUULRDLLURRRRULURULDUDUDDUDDRLLLDLURDUURUURLUULRRLDLULDDRLDDUURULURUDRD",
  "URLDDRLLRRLDRLLRRURURURDDLRRRUUUURULRRUUDLUDRULLDLRUDDLULRUULDULURLLRLLUDDUDLURDRRRRLURULRURRURRULRRRULDLLDDLRLUDULUUUDDUDDRRDDDDUULRRLDRRULULRDUURRLDDRDULDURUDUDDLDLLURDDLDDRUDUUUDUUURDLDUDUUULLDLRDULRRRDLLURLDLLULRDDULULURLRLUULRLLLDDDUDLLDLURRRULRDUDDLULUDRUDDURULRLRUDDURLLURULLURDRULDUDLDULRRDLDURLUURRDDUDDUDRURUDDURRUUDURUULLLLDDRDDDDDULUUDDURRULLDRRLRRRRRDDRUUDDDURDRDRUDDUULDUDRRDRULUURLURLUDUDULDDRDULDLRUUDLLLRRLRDRDDUUULRDUDLUDLURRDUURDULDRLLDRDULDUDUULRLLDLRLDLUUDLRUULDUUULDLRLRLUULLLLRLRDUDRUUDURLDUDRRURLRUDRRLRDDLRDDLDDUDDDRLRLLRLUUURLURRRLULRLLDRLRDDRRDRL",
  "DLLLLLLRLRDRUDLRLLRLDLRURRUURLDLDDDDDUDUULLLLRRLRRDUUDUDLULLRRDULUDLLULURLRULURUULRLURDUDLUDULULUUURLRUDULURULRURULURLRLDRRRRLUDLLDULLDDLLULUURRULRDURDUUDDDURRUDLLLLRLDLUDDULLDUDDURURURRRRULDULULUDDUUDRLRLLLDLLLUUUURUDUUDLDLLRLRDDUULLUURLDDLRRDRLULDLULRULDLDURLULUURRRUDLLRDLUDDULRULULUDDURDLUUURDUUURDUDURLUUDRLUDRULUDDRRDLUUDLLLRDDDDDDLDURDDLDRDLUUDRULLUDRDLDULLULDDRUUDRRLRURRUULLRLRDUUURRDRRDULDDULUUDDURLULRLRURLLRRR"
];

//var data = ["ULL","RRDDD","LURDL","UUUUD"];

/**
 * Logic to walk the data to figure out the PIN for this keypad
 */
class PINCracker {

  constructor( keypad, gfx ) {
    this.code = "";
    this.moveDuration = 40;  // msec
    this.crackedColor = "#33cc33";
    this.keypad = keypad;
    this.gfx = gfx;
  }

  // initial drawing of keypad
  drawPad() {
    for (var key in this.keypad) {
      this.gfx.drawButton( this.keypad, key, false );
    }
  }

  /**
   * Start the cracking process, figure out how long to delay
   */
  getCracking( data ) {
    this.drawPad();

    var moves = 0;
    for (var i=0; i < data.length; i++) {
      moves += data[i].length;
    }

    var crackTime;
    do {
      this.moveDuration = Math.floor( this.moveDuration / 2 );
      crackTime = Math.ceil( moves*this.moveDuration/1000 );
    } while ( crackTime > 20);

    this.gfx.updateDuration( crackTime + 5 );

    var key = 5;    // starting key
    this.gfx.drawButton( this.keypad, key, true );  // draw first button pressed


    var self = this;
    var promise = new Promise(
      function( resolve, reject ) {
        self.done = resolve; // called when cracking is all done
        self.fail = reject;  // called on error (never?)

        // search for first digit
        setTimeout( () => {
          self.gfx.drawButton( self.keypad, key, false );  // unpress button
          self.crack( 0, key, 0 );             // start cracking
        }, 1000 );
      });

    return promise;
  }

  /**
   * One step in cracking the PIN
   * @param digit which of the 4 digits we are cracking
   * @param key number of key we are hovering over
   * @param i step in procedure
   */
  crack( digit, key, i ) {
    if (digit >= data.length) {
      this.done();
      return;
    }

    var digitIsCracked = (i === data[digit].length);

    if (digitIsCracked) {
      this.gfx.drawButton( this.keypad, key, true, this.crackedColor );
      this.code += key;
      this.gfx.updatePIN( this.code );

      // crack next digit
      setTimeout( () => {
        this.gfx.drawButton( this.keypad, key, false );  // unhighlight last cracked digit
        this.crack( ++digit, key, 0 );         // start next digit where we left off
      }, 1000 );

    } else {
      var move = data[digit].charAt( i );

      this.gfx.drawButton( this.keypad, key, false );  // unhighlight last tested key
      key = this.keypad[key][move];
      this.gfx.drawButton( this.keypad, key, true );   // highlight next key

      // continue cracking this digit
      setTimeout( () => {
        this.crack( digit, key, ++i );
      }, this.moveDuration );
    }
  }

}


//----------------------------------------------------------------------
class Graphics {
  constructor( canvasId, pinId, durationId ) {
    var c = document.getElementById( canvasId );
    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    // gfx.scale( 10,10 );
    this.pinEl = document.getElementById( pinId );
    this.durationEl = document.getElementById( durationId );
  }

  updatePIN( code ) {
    $( this.pinEl ).text( code );
  }

  updateDuration( crackTime ) {
    $( this.durationEl).text( crackTime );
  }

  drawButton( keypad, key, pressed, color ) {
    var pressedColor = color || "#a0a0a0";
    var unpressedColor = color || "#a0a0a0";

    this.gfx.save();

    this.gfx.font = "32px sans-serif";

    var x = keypad[key].x * 50;
    var y = keypad[key].y * 50;

    if (pressed) {
      this.gfx.fillStyle = pressedColor;
      this.gfx.fillRect( x-20, y-20, 40, 40);
      this.gfx.fillStyle = "white";
    } else {
      this.gfx.fillStyle = "white";
      this.gfx.fillRect( x-20, y-20, 40, 40);

      this.gfx.strokeStyle = unpressedColor;
      this.gfx.strokeRect( x-20, y-20, 40, 40);
      this.gfx.fillStyle = "black";
    }

    this.gfx.fillText( key, x-10, y+10);

    this.gfx.restore();
  }
}




function crackKeypad1() {
  // 1 2 3
  // 4 5 6
  // 7 8 9
  var keypad = {
    "1": { x: 0, y: 0, "L": "1", "R": "2", "U": "1", "D": "4" },
    "2": { x: 1, y: 0, "L": "1", "R": "3", "U": "2", "D": "5"  },
    "3": { x: 2, y: 0, "L": "2", "R": "3", "U": "3", "D": "6"  },
    "4": { x: 0, y: 1, "L": "4", "R": "5", "U": "1", "D": "7"  },
    "5": { x: 1, y: 1, "L": "4", "R": "6", "U": "2", "D": "8"  },
    "6": { x: 2, y: 1, "L": "5", "R": "6", "U": "3", "D": "9"  },
    "7": { x: 0, y: 2, "L": "7", "R": "8", "U": "4", "D": "7"  },
    "8": { x: 1, y: 2, "L": "7", "R": "9", "U": "5", "D": "8"  },
    "9": { x: 2, y: 2, "L": "8", "R": "9", "U": "6", "D": "9"  }
  };

  var gfx = new Graphics("canvas1", "answer1", "duration1");
  var cracker = new PINCracker( keypad, gfx );
  return cracker.getCracking( data );
};


function crackKeypad2() {
  //     1
  //   2 3 4
  // 5 6 7 8 9
  //   A B C
  //     D
  var keypad = {
    "1": { x: 2, y: 0, "L": "1", "R": "1", "U": "1", "D": "3" },
    "2": { x: 1, y: 1, "L": "2", "R": "3", "U": "2", "D": "6"  },
    "3": { x: 2, y: 1, "L": "2", "R": "4", "U": "1", "D": "7"  },
    "4": { x: 3, y: 1, "L": "3", "R": "4", "U": "1", "D": "7"  },
    "5": { x: 0, y: 2, "L": "4", "R": "6", "U": "4", "D": "8"  },
    "6": { x: 1, y: 2, "L": "5", "R": "7", "U": "2", "D": "A"  },
    "7": { x: 2, y: 2, "L": "6", "R": "8", "U": "3", "D": "B"  },
    "8": { x: 3, y: 2, "L": "7", "R": "9", "U": "3", "D": "C"  },
    "9": { x: 4, y: 2, "L": "8", "R": "9", "U": "9", "D": "9"  },
    "A": { x: 1, y: 3, "L": "A", "R": "B", "U": "6", "D": "A"  },
    "B": { x: 2, y: 3, "L": "A", "R": "C", "U": "7", "D": "D"  },
    "C": { x: 3, y: 3, "L": "B", "R": "C", "U": "8", "D": "C"  },
    "D": { x: 2, y: 4, "L": "D", "R": "D", "U": "B", "D": "D"  }
  };

  $(".part2").show();

  var gfx = new Graphics("canvas2", "answer2", "duration2");
  var cracker = new PINCracker( keypad, gfx );
  cracker.getCracking( data );
}


function run() {
  crackKeypad1().then( function() {
    crackKeypad2();
  });
}

$( run );
