/*global postMessage */

// busy wait, hard to do setTimeout in a recursive function
function spin( times ) {
  for (var stupid=0; stupid < times; stupid++ ) {
    console.warn(stupid);
  }
}


/**
 * All walls are
 */
class Maze {
  /**
   */
  constructor( favoriteNumber ) {
    this.favoriteNumber = favoriteNumber|0;
    this.beenThere = {};
    this.path = {};
  }

  setStart( x, y ) {
    this.start = { x:x, y:y };
  }
  setGoal( x, y ) {
    this.goal = { x:x, y:y };
    this.width = x + 10;
    this.height = y + 10;
  }
  setWasHere(x, y) {
    this.beenThere[x+":"+y] = true;
  }
  wasHere(x, y) {
    return this.beenThere[x+":"+y];
  }
  setPath(x, y) {
    this.path[x+":"+y] = true;
  }
  isPath(x, y) {
    return this.path[x+":"+y];
  }

  solve() {
    this.beenThere = {};
    this.path = {};
    this.recursiveSolve( this.start.x, this.start.y );
    postMessage( this );  // update boss of out state
  }

  // follow a wall until we find our goal
  recursiveSolve(x, y) {
    if (x === this.goal.x && y === this.goal.y) return true;   // Done!

    if (this.isWall(x, y) || this.wasHere(x, y)) return false;   // can't get there from here

    // If you are on a wall or already were here
    this.setWasHere(x, y);
    postMessage( this );  // update boss of out state

    spin( 1000 );

    if (x != 0) {  // Checks if not on left edge
      if (this.recursiveSolve(x-1, y)) { // Recalls method one to the left
        this.setPath(x, y);
        return true;
      }
    }
//  if (x != width - 1) { // Checks if not on right edge (there is no right edge)
      if (this.recursiveSolve(x+1, y)) { // Recalls method one to the right
        this.setPath(x, y);
        return true;
      }
//  }
//  if (y != height- 1) { // Checks if not on bottom edge (there is no bottom edge)
      if (this.recursiveSolve(x, y+1)) { // Recalls method one down
        this.setPath(x, y);
        return true;
      }
//  }
    if (y != 0) {  // Checks if not on top edge
      if (this.recursiveSolve(x, y-1)) { // Recalls method one up
        this.setPath(x, y);
        return true;
      }
    }
    return false;
  }

  print() {
    for (var y=0; y < this.height; y++) {
      var str = "";
      for (var x=0; x < this.width; x++) {
        if ((x === this.goal.x) &&
            (y === this.goal.y))
        {
          str += "G";
        } else if ((x === this.start.x) &&
                   (y === this.start.y))
        {
          str += "S";
        } else {
          if (this.isWall(x,y)) str += "|";
          else if (this.isPath(x,y)) str += "O";
          else str += ".";
        }
      }
      console.log( str );
    }
  }

  /**
   * @returns true if odd sum of bits of x2+3x+2xy+y+y2 + favoriteNumber
   */
  isWall( x, y ) {
    x = x|0;  // convert to int
    y = y|0;

    var outWall = 0;
    var value = x*x + 3*x + 2*x*y +y + y*y + this.favoriteNumber;
    var bits = (value >>> 0).toString(2);
    for (var i=0; i < bits.length; i++) {
      outWall += parseInt( bits.charAt(i) );
    }
    return outWall % 2;
  }
}



// worker stuff
// get messages
// publish updates

console.log("Worker starting!");

// got request to do work (worker is "self" I guess)
self.addEventListener('message', function(e) {
  var maze = e.data;
  if (maze.favoriteNumber) {
    maze.__proto__ = Maze.prototype;  // cheat and re-objectify
    console.log("Worker: Message received maze");
    maze.solve();
    console.log("Worker: Bye!");
    self.close();  // terminate worker
  } else {
    console.log("Worker recieved weird event: " + e.data);
  }
});
