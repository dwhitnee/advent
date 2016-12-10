/*global $, getData */

"use strict";

var getData = getData ||
      // same syntax as ajax version
      function getData( filename ) {
        return new Promise(
          function( resolve, reject ) {
            var fs = require("fs");
            resolve( fs.readFileSync( filename, 'utf8').toString().split("\n") );
          });
      };


function print( msg ) {
  console.log( msg );
  $(".output").append( $("<div/>").text( msg ));
}


class Bot {
  // Ex:
  // bot 2 gives low to bot 1 and high to bot 0
  // bot 1 gives low to output 1 and high to bot 0
  constructor( instruction ) {
    this.chips = [];

    var match = instruction.match(
        /bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)/);

    this.id   = match[1] |0;
    this.low  = match[3] |0;
    this.high = match[5] |0;
    this.lowToOutput  = (match[2] === "output");
    this.highToOutput = (match[4] === "output");
  }

  giveChip( value, chipper ) {
    print("Bot " + this.id + " got chip " + value);
    this.chips.push( value|0 );

    if (this.chips.length > 1) {
      var chips = this.chips.sort((a,b) => a-b);
      print("Bot " + this.id + " is resonsible for comparing value-" + chips[0] +
            " chips with value-" + chips[1] + " chips");

      if (this.lowToOutput) {
        print("Bot " + this.id + " put chip " + chips[0] + " in output " + this.low );
        chipper.outputChip( chips[0], this.low );
      } else {
        print("Bot " + this.id + " gave chip " + chips[0] + " to Bot " + this.low );
        chipper.giveChip( chips[0], this.low );
      }

      if (this.highToOutput) {
        print("Bot " + this.id + " put chip " + chips[1] + " in output " + this.high );
        chipper.outputChip( chips[1], this.high );
      } else {
        print("Bot " + this.id + " gave chip " + chips[1] + " to Bot " + this.high );
        chipper.giveChip( chips[1], this.high );
      }

      this.chips = [];
    }
  }
}

class Chipper {
  constructor() {
    this.bots = [];
    this.outputs = [];
  }

  addBot( bot ) {
    this.bots[bot.id] = bot;
  }

  giveChip( value, botId ) {
    this.bots[botId].giveChip( value, this );
  }

  outputChip( value, outputId ) {
    this.outputs[outputId] = this.outputs[outputId] || [];
    this.outputs[outputId].push( value );
  }

  // Ex: "value 2 goes to bot 6"
  giveChipByCommand( cmd ) {
    if (!cmd) {
      return;
    }
    var match = cmd.match(/value (\d+) goes to bot (\d+)/);
    this.giveChip( match[1], match[2] );
  }
}


function runTest() {
  var data =[
    "bot 0 gives low to output 2 and high to output 0",
    "bot 1 gives low to output 1 and high to bot 0",
    "bot 2 gives low to bot 1 and high to bot 0",
    "value 2 goes to bot 2",
    "value 3 goes to bot 1",
    "value 5 goes to bot 2",
  ];

  var chipper = new Chipper();
  for (var i=0; i < data.length; i++) {
    if ("bot" === data[i].slice(0, 3)) {
      chipper.addBot( new Bot( data[i] ));
    } else {
      chipper.giveChipByCommand( data[i] );
    }
  }

  print( JSON.stringify( chipper.outputs ));
//  $("#answer"+(i+1)).text( output.length + " " + output );
}

function run(){
  var chipper = new Chipper();

  getData("input/day10").then(
    function( data ) {
      for (var i=0; i < data.length; i++) {
        if ("bot" === data[i].slice(0, 3)) {
          chipper.addBot( new Bot( data[i] ));
        } else {
          chipper.giveChipByCommand( data[i] );
        }
      }

      print( JSON.stringify( chipper.outputs ));
      print( chipper.outputs[0] * chipper.outputs[1] * chipper.outputs[2]);
      print("Done");

      // var output = rle.decompress( data );
      // $("#answer1").text( output.length );
    });
};



if (typeof $ !== 'undefined' ) {

  $( run );

} else {

  var $ = function() {
    return { text: str => { console.log( str ); }};
  };

  run();
}
