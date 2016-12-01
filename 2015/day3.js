// http://adventofcode.com/day/3
// Calculate Santa's path
// 2016 David Whitney

var Santa = (function()
{
  function Santa() {
    this.pos = { x:0, y:0 };
    this.houses = {};
    this.leavePresent();
  }

  Santa.prototype = {
    move: function( cmd ) {
      if (cmd === "<") {
        this.pos.x--;
      } else if (cmd === ">") {
        this.pos.x++;
      } else if (cmd === "^") {
        this.pos.y++;
      } else if (cmd === "v") {
        this.pos.y--;
      } else {
        console.error("invalid command for Santa! " + cmd);
      }
      this.leavePresent();
    },

    /**
     * leave a present at the hosue we are at (ex: house["46x89"])
     */
    leavePresent: function() {
      var key = "X"+this.pos.x+"x"+this.pos.y;
      this.houses[key] = this.houses[key] || 1;
      // console.log("Visited " + this.pos.x + ", " + this.pos.y + " (" +
      //             this.getNumHouses() + " houses) " + key);
    },

    getNumHouses: function() {
      return Object.keys( this.houses ).length;
    },

    /**
     * merge the list of houses that santa and roboSanta visited
     */
    mergeSantas: function( santa ) {
      for (var key in santa.houses) {
        this.houses[key] = 1;
      }
    }

  };
  return Santa;
})();



var santa = new Santa();
var roboSanta = new Santa();

// read Santa's direction Ex: "^^<<v<<v><v^^<><"
function processLine( line ) {

  for (var i = 0; i < line.length; i++) {
    if (i%2) {
      santa.move( line[i] );
    } else {
      roboSanta.move( line[i] );
    }
  }
}


//----------------------------------------------------------------------
//----------------------------------------------------------------------
var filename = process.argv[2];
console.log("Reading input from " + filename );

var dataReader = require('readline').createInterface({
  input: require('fs').createReadStream( filename )
});


dataReader.on('line', processLine );

dataReader.on('close', function() {
                console.log("Santa visited " + santa.getNumHouses() + " houses.");
                console.log("RoboSanta visited " + roboSanta.getNumHouses() + " houses.");
                santa.mergeSantas( roboSanta );
                console.log("Santas visited " + santa.getNumHouses() + " houses.");
              });
