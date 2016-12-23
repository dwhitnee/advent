/*global $, WorkerThread, getData, md5 */

//----------------------------------------
class CircularLinkedList {
  constructor() {
    this.size = 0;
  }

  append( id ) {
    var node = {
      id: id,
      presents: 1,
      prev: this.head,
      next: this.head
    };

    this.size++;

    if (!this.size) {
      this.head = node;
      this.tail = node;
      node.prev = this.head;
      node.next = this.head;
    }
  }

  delete( node ) {
    if (this.head === node) {
      this.head = node.next;
    }
    node.prev = node.next;
    node.next.prev = node.prev;

    this.size--;
  }

  find( id ) {
    var node = this.head;
    do {
      if (node.id === id) {
        return node;
      }
      node = node.next;
    } while (node !== node.head);

    return undefined;
  }
}


/**
 * White Elephant party where each elf steals the next elf's presents.
 */
class WhiteElephantParty {
  /**
   */
  constructor( numElves ) {
    this.elves = new CircularLinkedList();
    for (var i=0; i < numElves; i++) {
      this.elves.append( i );
    }
  }

  // party until only one elf has presents
  start() {
    var startTime = Date.now();
    var partyElf = this.elves.head;
    var exchangeOccuredInThisLoop = false;

    while (true) {
      // var nextElf = this.nextPartyingElf( partyElf );
      var nextElf = this.oppositePartyingElf( partyElf );

      // steal next elf's presents
      partyElf.presents += nextElf.presents;
      this.elves.delete( nextElf );

      if (this.elves.size === 1) {
        this.winner = partyElf.id;
        break;
      }

      partyElf = this.nextPartyingElf( partyElf );

      if (!(this.elves.size % 10000)) {
        console.log( this.partiers + " left. Time = " + (Date.now() - startTime));
        startTime = Date.now();
      }
    }
  }

  // @return elf across from startingElf
  oppositePartyingElf( startingElf ) {
    var nextElf = startingElf;
    for (var i=0; i < Math.floor( this.partiers / 2); i++) {
      nextElf = this.nextPartyingElf( nextElf );
    }
    return nextElf;
  }

  // find next elf with presents
  nextPartyingElf( startingElf ) {
    var nextElf = startingElf;

    do {
      nextElf++;
      if (nextElf === this.elves.length) {
        nextElf = 0;
      }
    } while (!this.elves[nextElf] && (nextElf !== startingElf))

    if (nextElf === startingElf) {
      return -1;
    } else {
      return nextElf;
    }
  }

  print() {
    console.log( this.elves );
    // for (var i=0; i < this.rows.length; i++) {
    //   console.log( this.rows[i] );
    //   $("#room").append($("<p/>").text( this.rows[i] ));
    // }
  }
}


/**
 *  Canvas drawing routines for keypad buttons and some text
 */
class Graphics {
  /**
   * @param canvasId   HTML canvas element id
   */
  constructor( canvasId, maze ) {
    var c = document.getElementById( canvasId );
    this.maze = maze;

    this.gfx = c.getContext("2d");
    this.gfx.translate( 50, 50 );
    this.gfx.scale( 3, 3 );
  }

  progress( pct ) {
    $("progress").attr("value", pct );
  }
}


function run( numElves ) {

  var party = new WhiteElephantParty( numElves );
  party.start();
  $("#answer1").text( party.winner + 1);

  // room = new TrapRoom( firstRow[0], 400000 );
  // $("#answer2").text( room.safeTiles );
}


function waitForButton() {
  var firstRow = ".^^.^.^^^^";
  var numElves = 3001330;

  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input );
    } else {
      run( numElves );
    }
  });
}

$( waitForButton );
