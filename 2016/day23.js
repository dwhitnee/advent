/*global $, WorkerThread, getData */

"use strict";

/**
 * Write an assembly language processor
 */
class Assembler {
  /**
   */
  constructor( program ) {
    this.registers = {
      a: 12,
      b: 0,
      c: 0,
      d: 0
    };
    this.pc = 0;  // program counter
    this.program = program;
    this.linesExecuted = 0;
  }

  executeNextLine() {
    this.linesExecuted++;
    this.processInstruction( this.program[this.pc] );
    this.pc++;
  }

  run() {
    while (!this.programDone) {
      this.executeNextLine();
    }
  }
  currentLine() {
    return this.program[this.pc];
  }

  programDone() {
    return this.pc >= this.program.length;
  }

  processInstruction( instr ) {
    if (!instr) {
      return;
    }

    var tokens = instr.split(" ");
    if (tokens[0] == "cpy") {
      this.copy( tokens[1], tokens[2] );
    } else if (tokens[0] == "inc") {
      this.add( tokens[1], 1 );
    } else if (tokens[0] == "dec") {
      this.add( tokens[1], -1 );
    } else if (tokens[0] == "jnz") {
      this.jumpNotZero( tokens[1], tokens[2] );
    } else if (tokens[0] == "tgl") {
      this.toggleInstruction( tokens[1] );
    }
  }

  getValue( valueOrRegister ) {
    var value = this.registers[valueOrRegister];
    if (value === undefined) {
      value = valueOrRegister;
    }
    return parseInt( value );
  }


  // cpy 41 a
  copy( valueOrRegister, register ) {
    var value = this.getValue( valueOrRegister );

    if (register.match(/[a-z]/i)) {
      this.registers[register] = value;
    }
  }

  // "inc a" or "dec b"
  add( register, value ) {
    if (value > 0) {
      this.registers[register] *= 2;
    } else {
      this.registers[register] += value;
    }
  }

  // jnz a 2
  jumpNotZero( valueOrRegister, numLinesToJump ) {
    var value = this.getValue( valueOrRegister );
    numLinesToJump = this.getValue( numLinesToJump );
    if (value) {
      this.pc += parseInt( numLinesToJump ) - 1;
    }
  }

  // toggle c
  /* tgl x toggles the instruction x away (pointing at instructions
   * like jnz does: positive means forward; negative means backward):

   For one-argument instructions, inc becomes dec, and all other one-argument instructions become inc.
For two-argument instructions, jnz becomes cpy, and all other two-instructions become jnz.
The arguments of a toggled instruction are not affected.
If an attempt is made to toggle an instruction outside the program, nothing happens.
If toggling produces an invalid instruction (like cpy 1 2) and an attempt is later made to execute that instruction, skip it instead.
If tgl toggles itself (for example, if a is 0, tgl a would target itself and become inc a), the resulting instruction is not executed until the next time it is reached.
*/
  toggleInstruction( register ) {
    var offset = this.registers[register];

    if ((this.pc + offset) >= this.program.length) {
      return;
    }

    var instr = this.program[this.pc + offset];
    if (!instr) {
      return;
    }

    // change line to something else
    var tokens = instr.split(" ");
    if (tokens[0] == "cpy") {
      tokens[0] = "jnz";  // check for bad args FIXME
    } else if (tokens[0] == "inc") {
      tokens[0] = "dec";
    } else if (tokens[0] == "dec") {
      tokens[0] = "inc";
    } else if (tokens[0] == "jnz") {
      tokens[0] = "cpy";  // check for bad args FIXME
    } else if (tokens[0] == "tgl") {
      tokens[0] = "inc";
    }

    this.program[this.pc + offset] = tokens.join(" ");
  }
}


/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   */
  constructor( canvasId, cpu ) {
    var c = document.getElementById( canvasId );
    this.cpu = cpu;

    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );
  }

  progress( pct ) {
//     $("#output").append( $("<div/>").text( this.cpu.currentLine() ));

    $(".registers #a").text( this.cpu.registers.a );
    $(".registers #b").text( this.cpu.registers.b );
    $(".registers #c").text( this.cpu.registers.c );
    $(".registers #d").text( this.cpu.registers.d );
    $(".registers #pc").text( this.cpu.pc );
    $(".registers #instruction").text( this.cpu.currentLine() );

    $("progress").attr("value", 100 * this.cpu.pc / this.cpu.program.length );
  }
}


// @return a promise to do the work
function runProgram( program ) {
  var cpu = new Assembler( program );
  var gfx = new Graphics("canvas1", cpu );
  console.log("Starting worker");

  // worker function
  function doWork( i ) {
    cpu.executeNextLine();
    return !cpu.programDone();
  }

  return new Promise(
    function( resolve, reject ) {
      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( cpu );
        },
        {
          progressFn: (pct) => {
            gfx.progress( pct );
          },
          chunkSize: 10000
          // totalWorkUnits: data.length,
          // totalTime: 5000
        });
      worker.start();
    });
}


function run( program ) {
  console.log("Running program " + program.length);

  runProgram( program ).then(
    cpu => {
      console.log("Done");
      console.log( cpu.registers.a );
      // $("#answer1").text( cpu.registers.a );
      // $("#answer1").append( $("<div/>").text( cpu.linesExecuted + " lines executed"));
    });

}


function waitForButton() {
  var testdata = [
    "cpy 2 a",
    "tgl a",
    "tgl a",
    "tgl a",
    "cpy 1 a",
    "dec a",
    "dec a"
  ];

  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day23").then( data => run( data ));
    }
  });
}

if (typeof $ !== 'undefined' ) {

  $( waitForButton );

} else {

  // var WorkerThread = require("lib/workerThread.js");

  var $ = function() {
    return { text: str => { console.log( str ); }};
  };

  function getData( filename ) {
    return new Promise(
      function( resolve, reject ) {
        var fs = require("fs");
        resolve( fs.readFileSync( filename, 'utf8'));
      });
  }
  getData("input/day23").then( data => run( data.split(/\n/) ));
}
