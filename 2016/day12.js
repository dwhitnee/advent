/*global $, WorkerThread, getData */

/**
 * Write an assembly language processor
 */
class Assembler {
  /**
   */
  constructor( program ) {
    this.registers = {
      a: 0,
      b: 0,
      c: 1,
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
    this.registers[register] = value;
  }

  // "inc a" or "dec b"
  add( register, value ) {
    this.registers[register] += value;
  }

  // jnz a 2
  jumpNotZero( valueOrRegister, numLinesToJump ) {
    var value = this.getValue( valueOrRegister );
    if (value) {
      this.pc += parseInt( numLinesToJump ) - 1;
    }
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


function run() {
  var testdata = [
    "cpy 41 a",
    "inc a",
    "inc a",
    "dec a",
    "jnz a 2",
    "dec a"
  ];

  // var cpu = new AssemblyLanguageProcessor();
  // cpu.run( testdata );
  // console.log("Register A = " + cpu.registers.a );

  getData("input/day12").then(
    program => {
      runProgram( program ).then(
        cpu => {
          $("#answer1").text( cpu.registers.a );
          $("#answer1").append( $("<div/>").text( cpu.linesExecuted + " lines executed"));
        });
    });
}

$( run );
