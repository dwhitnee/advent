/*global $ */

var data = [
  "LLLUDRDLLULDUDLLRLUDURULDURRRRLLURLDLDDDULLDDUDLRDLRDUURRDUUDLLRUUDDLULURDLRDUUDUDRURULLLLDRULDDLRDDRDLRDDLURLDDUDLLUUDLRDDDDLULUUURRDLUUDDLULLURRRDULLUDUDRDRDDRLDLLRLRDDDRDLULLUULDLLLRRDDUURUURDLLDRRDDLRULDLLDRLLUDRRDLUUULDLURLLDDURRUULLLLLRLUDLDDLLLURRRDUDULRULULDDLLDLRDDDUULRLRDUURLURRUDDURRUUDUDLDDLDULDDDDDULRULRDLRLDLRDLDDLUDRDUUDLDUDUDLLLRLUUDRUDDDRDRURRLLLDLUULDUULRDLULLUURLDRRRLDRLUDRRURLDULULDRUDDULLLDRDLLULUDDDDRDRULDULRRRRDDRULDLRDU",
  "DLDDRRDLLDUURRLULLLLRDRLUDURLDRRDURRRRUUDDUDRRDDDRRLDDLDDLURDLDRLUDULDUDUUDDDLLULRRLLUDULLLUULDDRDDUDUUDULURULULLDRLRUURDRDDLRRUDRUULLLLURRUDRDULDDRURRURLLLLLRLLLRLLUDUDLRDLULDUDLULLLUUDLLDDDUDUDLLRRDLRDLLLRRLRUDRDUDRURLUUURULLDDDDLLURDULURRLLLRLRRULLRRRLUUULLLLRLRDUURRDUURLLLDRDURRRULDDUDRRDLRLDLLRUDDLLUDRLLUUDRLLLLLLUDLURLLRUDRUUUULDLUDULLDDDDRLURUURDDDURRRLRLUDUUDURDDDDRRLRDLURDDLLULDRDDURLLURULUUUUURDUUULDRRLLURRRRRLDDUULLRULLDLDLDLRRRDRLDRUUD",
  "RLDRRRURULDLUDLDUDLLDUUURRDUDDURULLRRDDULUUDRRRULRUURRRLUUULRDRUDRRLLRLURDLDRDRDLLUDRUULRUDRUDDRURLRLURRDDRRURUUDRRDDRURURUDUUUDUDRRLRDRUUURLLUUUDLRUUDDRDDDDLDRLRDUDDULDDLRLLRURLLURLDDLDLDDULLDDUUURDLRUDUUDLDURDDRUULDRDDRDDDUUUDRDRDDRRDRRDLRDRURDUDDLUUUDULLUULULULRDRUUDDURURDRRRRLUDLDUDURLDRURDLLUUUDLRRDRRURDDULULURLDUDDLUDLDDLLRLDULLULULURUURLDULUDLLUUDLDDULDRRDDUULLUDLDLLRDRDURDDURDDURLDDURUURLLRURURUDDURRDRLRLDDUUDUULRDLLURRRRULURULDUDUDDUDDRLLLDLURDUURUURLUULRRLDLULDDRLDDUURULURUDRD",
  "URLDDRLLRRLDRLLRRURURURDDLRRRUUUURULRRUUDLUDRULLDLRUDDLULRUULDULURLLRLLUDDUDLURDRRRRLURULRURRURRULRRRULDLLDDLRLUDULUUUDDUDDRRDDDDUULRRLDRRULULRDUURRLDDRDULDURUDUDDLDLLURDDLDDRUDUUUDUUURDLDUDUUULLDLRDULRRRDLLURLDLLULRDDULULURLRLUULRLLLDDDUDLLDLURRRULRDUDDLULUDRUDDURULRLRUDDURLLURULLURDRULDUDLDULRRDLDURLUURRDDUDDUDRURUDDURRUUDURUULLLLDDRDDDDDULUUDDURRULLDRRLRRRRRDDRUUDDDURDRDRUDDUULDUDRRDRULUURLURLUDUDULDDRDULDLRUUDLLLRRLRDRDDUUULRDUDLUDLURRDUURDULDRLLDRDULDUDUULRLLDLRLDLUUDLRUULDUUULDLRLRLUULLLLRLRDUDRUUDURLDUDRRURLRUDRRLRDDLRDDLDDUDDDRLRLLRLUUURLURRRLULRLLDRLRDDRRDRL",
  "DLLLLLLRLRDRUDLRLLRLDLRURRUURLDLDDDDDUDUULLLLRRLRRDUUDUDLULLRRDULUDLLULURLRULURUULRLURDUDLUDULULUUURLRUDULURULRURULURLRLDRRRRLUDLLDULLDDLLULUURRULRDURDUUDDDURRUDLLLLRLDLUDDULLDUDDURURURRRRULDULULUDDUUDRLRLLLDLLLUUUURUDUUDLDLLRLRDDUULLUURLDDLRRDRLULDLULRULDLDURLULUURRRUDLLRDLUDDULRULULUDDURDLUUURDUUURDUDURLUUDRLUDRULUDDRRDLUUDLLLRDDDDDDLDURDDLDRDLUUDRULLUDRDLDULLULDDRUUDRRLRURRUULLRLRDUUURRDRRDULDDULUUDDURLULRLRURLLRRR"
];

//var data = ["ULL","RRDDD","LURDL","UUUUD"];
var code = "";
var gfx;
var moveDuration = 40;  // ms

var crackedColor = "#33cc33";

// 1 2 3
// 4 5 6
// 7 8 9
var keypad = {
  "1": { x: 0, y: 0, "L": 1, "R": 2, "U": 1, "D": 4 },
  "2": { x: 1, y: 0, "L": 1, "R": 3, "U": 2, "D": 5  },
  "3": { x: 2, y: 0, "L": 2, "R": 3, "U": 3, "D": 6  },
  "4": { x: 0, y: 1, "L": 4, "R": 5, "U": 1, "D": 7  },
  "5": { x: 1, y: 1, "L": 4, "R": 6, "U": 2, "D": 8  },
  "6": { x: 2, y: 1, "L": 5, "R": 6, "U": 3, "D": 9  },
  "7": { x: 0, y: 2, "L": 7, "R": 8, "U": 4, "D": 7  },
  "8": { x: 1, y: 2, "L": 7, "R": 9, "U": 5, "D": 8  },
  "9": { x: 2, y: 2, "L": 8, "R": 9, "U": 6, "D": 9  }
};

function initGfx() {
  var c = document.getElementById("canvas");
  var gfx = c.getContext("2d");
  gfx.translate( 50, 50 );
  // gfx.scale( 10,10 );

  return gfx;
}

function drawButton( gfx, key, pressed, color ) {
  var pressedColor = color || "#a0a0a0";
  var unpressedColor = color || "#a0a0a0";

  gfx.save();

  gfx.font = "32px sans-serif";

  var x = keypad[key].x * 50;
  var y = keypad[key].y * 50;

  if (pressed) {
    gfx.fillStyle = pressedColor;
    gfx.fillRect( x-20, y-20, 40, 40);
    gfx.fillStyle = "white";
  } else {
    gfx.fillStyle = "white";
    gfx.fillRect( x-20, y-20, 40, 40);

    gfx.strokeStyle = unpressedColor;
    gfx.strokeRect( x-20, y-20, 40, 40);
    gfx.fillStyle = "black";
  }

  gfx.fillText( key, x-10, y+10);

  gfx.restore();
}


/**
 * One step in cracking the PIN
 * @param digit which of the 4 digits we are cracking
 * @param key number of key we are hovering over
 * @param i step in procedure
 */
function crack( digit, key, i ) {
  if (digit >= data.length) {
    return;
  }

  var digitIsCracked = (i === data[digit].length);

  if (digitIsCracked) {
    drawButton( gfx, key, true, crackedColor );
    code += key;
    $("#answer1").text( code );

    // crack next digit
    setTimeout( function() {
      drawButton( gfx, key, false );  // unhighlight last cracked digit
      crack( ++digit, key, 0 );         // start next digit where we left off
    }, 1000 );

  } else {
    var move = data[digit].charAt( i );

    drawButton( gfx, key, false );  // unhighlight last tested key
    key = keypad[key][move];
    drawButton( gfx, key, true );   // highlight next key

    // continue cracking this digit
    setTimeout( function() {
      crack( digit, key, ++i );
    }, moveDuration );
  }
};


function run() {
  gfx = initGfx();

  for (key = 1; key <= 9; key++) {
    drawButton( gfx, key, false );
  }

  var moves = 0;
  for (var i=0; i < data.length; i++) {
    moves += data[i].length;
  }

  var crackTime;

  do {
    moveDuration = Math.floor( moveDuration / 2 );
    crackTime = Math.ceil( moves*moveDuration/1000 );
  } while ( crackTime > 30);

  $("#duration").text( crackTime + 5 );

  var key = 5;    // starting key
  drawButton( gfx, key, true );  // draw first button pressed

  // search for first digit
  setTimeout( function() {
    drawButton( gfx, key, false );  // unpress button
    crack( 0, key, 0 );             // start cracking
  }, 1000 );
};

$( run );
