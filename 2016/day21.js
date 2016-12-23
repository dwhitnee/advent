/*global $, WorkerThread, getData */

/**
 * Write an assembly language processor, uh, password scrambler
 */
class Password {
  /**
   */
  constructor( rules ) {
    this.rulesExecuted = 0;
    this.rules = rules;
  }

  // go through all the rules in reverse order and undo them
  unscramble( scrambled ) {
    this.target = scrambled;
    console.log( this.target );

    for (var i=this.rules.length-1; i >= 0; i--) {
      var rule = this.rules[i];
      this.useRuleToScramble( rule, true );
    }
    return this.target;
  }

  scramble( password ) {
    this.target = password;
    console.log( this.target );

    for (var i=0; i < this.rules.length; i++) {
      var rule = this.rules[i];
      this.useRuleToScramble( rule );
    }
    return this.target;
  }


  // @param doScramble true means scramble, false means unscramble reverse process)
  useRuleToScramble( rule, oppositeDay ) {
    var tokens = rule.split(" ");
    if (!tokens) {
      return;
    }

    var match;
    this.rulesExecuted++;

    if (tokens[0] === "swap") {
      if (tokens[1] === "position") {
        match = rule.match(/swap position (\d+) with position (\d+)/);
        this.swapPositions( match[1]|0, match[2]|0, oppositeDay );
      } else {
        match = rule.match(/swap letter (\w+) with letter (\w+)/);
        this.swapLetters( match[1], match[2], oppositeDay );
      }

    } else if (tokens[0] == "rotate") {
      if (tokens[1] === "based") {
        match = rule.match(/rotate based on position of letter (\w+)/);
        this.rotateBasedOnPositionOfLetter( match[1], oppositeDay );

      } else {
        match = rule.match(/rotate (\w+) (\d+) step.*/);
        this.rotateSteps( match[1], match[2]|0, oppositeDay );
      }

    } else if (tokens[0] == "reverse") {
      match = rule.match(/reverse positions (\d+) through (\d+)/);
      this.reverse( match[1]|0, match[2]|0, oppositeDay );

    } else if (tokens[0] == "move") {
      match = rule.match(/move position (\d+) to position (\d+)/);
      this.move( match[1]|0, match[2]|0, oppositeDay );

    } else {
      console.log("Bad rule! : '" + rule + "'");
    }

    console.log( this.target + "   " + rule);
  }


  // swap position 5 with position 6
  // swap letter b with letter d
  // rotate right 7 steps
  // rotate based on position of letter b
  // reverse positions 1 through 6
  // move position 1 to position 0

  /**
   * "swap position X with position Y"
   *    means that the letters at indexes X and Y (counting from 0) should be swapped.
   */
  swapPositions( x, y, oppositeDay ) {
    if (oppositeDay) {
      [x,y]=[y,x];
    }
    var str = this.target;
    var xChar = str[x];
    var yChar = str[y];
    var newStr = [];


    for (var i = 0; i < str.length; i++) {
      if (i === x) {
        newStr.push( yChar );
      } else if (i === y) {
        newStr.push( xChar );
      } else {
        newStr.push( str[i] );
      }
    }
    this.target = newStr.join("");
  }


  /**
   * "swap letter X with letter Y" means that the letters X and Y
   * should be swapped (regardless of where they appear in the string).
   */
  swapLetters( x, y, oppositeDay ) {
    var str = this.target;
    var newStr = [];
    if (oppositeDay) {
      [x,y]=[y,x];
    }

    for (var i = 0; i < str.length; i++) {
      if (str[i] === x) {
        newStr.push( y );
      } else if (str[i] === y) {
        newStr.push( x );
      } else {
        newStr.push( str[i] );
      }
    }
    this.target = newStr.join("");
  }


  /**
   * "rotate left/right X steps" means that the whole string should be
   * rotated; for example, one right rotation would turn abcd into dabc.
   */
  rotateSteps( dir, steps, oppositeDay ) {
    var str = this.target;
    var newStr = [];
    var pos;

    if (oppositeDay) {
      if (dir === "left") {
        dir = "right";
      } else {
        dir = "left";
      }
    }

    for (var i = 0; i < str.length; i++) {
      if (dir === "left") {
        pos = (i + steps + 2*str.length) % str.length;
      } else {
        pos = (i - steps + 2*str.length) % str.length;
      }
      newStr.push( str[pos] );
    }
    this.target = newStr.join("");
  }

  /**
   * "rotate based on position of letter X"
   *    means that the whole string should be rotated to the right based on the index of letter X (counting from 0) as determined before this instruction does any rotations. Once the index is determined, rotate the string to the right one time, plus a number of times equal to that index, plus one additional time if the index was at least 4.
   */
  // wtf guys?
  // rotate based on position of letter d
  // xxxxD => Dxxxx  (4+2)
  // xxxDx => xxDxx  (3+1)
  // xxDxx => Dxxxx  (2+1)
  // xDxxx => xxxDx  (1+1)
  // Dxxxx => xDxxx  (0+1)

  // abdec => ecabd  (rot right 2)  "b"
  // ecabd un=> abdec (rot left 2)

  // ecabd => decab (rot right 6)  "d"
  // decab un=> ecabd (rot left 6 or 1)

  // index = 0 => reverse 1 or 3 (6) (right 4 or 2)
  // index = 1 => reverse 1 (right 4)
  // index = 2 => reverse 4 (right 1)
  // index = 3 => reverse 4 (right )
  // index = 4 => NA


  rotateBasedOnPositionOfLetter( letter, oppositeDay ) {
    var index = this.positionOfLetter( this.target, letter );

    if (oppositeDay) {
      // rotate back left based on where the letter used to be. how?
      if (index === 0) {
        index = 1;
      } else if (index === 1) {
        index = 1;
      } else {
        index = 4;
      }
      this.rotateSteps("left", index );

    } else {
      if (index >= 4) {
        index++;
      }
      index++;
      this.rotateSteps("right", index );
    }
  }

  positionOfLetter( str, letter ) {
    for (var i=0; i < str.length; i++) {
      if (str[i] === letter) {
        return i;
      }
    }
    return -1;
  }

  /**
   * "reverse positions X through Y" means that the span of letters at
   * indexes X through Y (including the letters at X and Y) should be reversed in order.
   */
  // reverse positions 3 through 5
  reverse( x, y, oppositeDay ) {
    // this one is symmetric, don't need oppositeDay
    var str = this.target;
    var newStr = [];
    var pos;

    for (var i = 0; i < str.length; i++) {

      if (i < x) {
        newStr.push( str[i] );
      } else if (i > y) {
        newStr.push( str[i] );
      } else {
        for (var j=0; j <= y-x; j++, i++) {
          newStr.push( str[y-j] );
        }
        i--;  // counteract outer loop
      }
    }
    this.target = newStr.join("");
  }

  /**
   * "move position X to position Y" means that the letter which is at index X should be removed from the string, then inserted such that it ends up at index Y.
   */
  // move position 1 to position 4   aBcde => acdBe => aBcde
  move( x, y, oppositeDay ) {
    var str = this.target;
    var newStr = [];
    var pos;
    var movee;

    if (oppositeDay) {
      [x,y]=[y,x];
    }

    for (var i = 0; i < str.length; i++) {
      if (i === x) {
        movee = str[i];
      } else {
        newStr.push( str[i] );
      }
    }

    str = newStr.join("");
    newStr = [];

    // now insert movee into str at index Y
    for (var i = 0; i < this.target.length; i++) {
      if (i === y) {
        newStr.push( movee );
        if (str[i]) {
          newStr.push( str[i] );
        }
      } else {
        newStr.push( str[i] );
      }
    }

    this.target = newStr.join("");
  }


}



function run( data ) {
  var testPass = "abcde";
  var pass = "abcdefgh";

  var testRules = [
    "swap position 4 with position 0",
    "swap letter d with letter b",
    "reverse positions 0 through 4",
    "rotate left 1 step",
    "move position 1 to position 4",
    "move position 3 to position 0",
    "rotate based on position of letter b",
    "rotate based on position of letter d"
  ];

  // var password = new Password( pass );
  // password.parseRules( data );
  // password.scramble();

  var password = new Password( testRules );

  console.log("Scrambled abcde => " + password.scramble("abcde"));
  console.log("Unscrambled decab => " + password.unscramble("decab"));

  $("#answer1").text( password.scramble("abcde"));
  $("#answer2").text( password.unscramble("decab"));

  // $("#answer1").text( password.scramble("abcdefgh"));
  // $("#answer2").text( password.unscramble("fbgdceah"));

  // $("#answer1").append( $("<div/>").text( password.rulesExecuted + " rules executed"));
  // $("#answer1").append( $("<div/>").text( password.rulesExecuted + " rules executed"));
}


function waitForButton() {
  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day21").then( data => run( data ));
    }
  });
}

$( waitForButton );
