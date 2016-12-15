/*global postMessage */

// busy wait, hard to do setTimeout in a recursive function
function spin( times ) {
  for (var stupid=0; stupid < times; stupid++ ) {
    console.warn(stupid);
  }
}


var YA_CANT_GET_THERE_FROM_HERE = -1;

/**
 * Find the shortest path between a given source cell to a destination cell.
 * http://www.geeksforgeeks.org/shortest-path-in-a-binary-maze/
 */
class Maze {

  constructor( favoriteNumber ) {
    this.favoriteNumber = favoriteNumber|0;
    this.beenThere = {};
    this.path = {};
    this.nearby = {};
  }

  setStart( x, y ) {
    this.start = { x:x, y:y };
  }
  setGoal( x, y ) {
    this.goal = { x:x, y:y };
    this.width = x + 20;
    this.height = y + 20;
  }
  setWasHere( x, y ) {
    this.beenThere[x+":"+y] = true;
  }
  wasHere( x, y ) {
    return this.beenThere[x+":"+y];
  }
  setPath( x, y ) {
    this.path[x+":"+y] = true;
  }
  isPath( x, y ) {
    return this.path[x+":"+y];
  }
  isNearby( x, y ) {
    return this.nearby[x+":"+y];
  }

  solve() {
    this.distance = this.findShortestPathWithBreadthFirstSearch( this.start, this.goal );
  }

  // @return check whether given cell (row, col) is a valid cell or not.
  isValid( x, y ) {
    // return true if row number and column number is in range
    return (x >= 0) && (y >= 0);
      // && (y < this.height) && (x < this.width);
  }

  /* function to find the shortest path between a given source cell to a destination cell.
   * @param src {x,y}
   * @param dest {x,y}
   * @return distance travelled
   */
  // 0 = wall, 1 = clear
  findShortestPathWithBreadthFirstSearch( src, dest ) {

    this.beenThere = {};
    this.path = {};
    this.nearby = {};
    this.nearby[src.x+":"+src.y] = true;

    var neighbors = [
      {x:0,y:-1},
      {x:-1,y:0},
      {x:1,y:0},
      {x:0,y:1}
    ];

    if (this.isWall( src.x, src.y) || this.isWall( dest.x, dest.y )) {
      return YA_CANT_GET_THERE_FROM_HERE;
    }

    this.setWasHere( src.x, src.y );

    var q = [];  // Create a queue for BFSearch

    // distance of source cell is 0
    var srcNode = { x: src.x, y: src.y, dist: 0 };
    q.push( srcNode );  // head of the queue

    // Do a BFS starting from source cell until we find the goal
    while (q.length > 0) {  // go until empty

      // update boss of our state
      var curr = q[0];

      // Yippee! We are done
      if ((curr.x === dest.x) && (curr.y === dest.y)) {
        console.log( JSON.stringify(this.nearby));
        return curr.dist;
      }

      // Otherwise remove the first cell in the queue and enqueue its adjacent cells
      q.shift();

      for (var i = 0; i < 4; i++) {
        var x = curr.x + neighbors[i].x;
        var y = curr.y + neighbors[i].y;

        // if adjacent cell is valid, has path and not visited yet, enqueue it.
        if (this.isValid( x,y ) && !this.isWall( x,y ) && !this.wasHere( x,y)) {
          // mark cell as visited and enqueue it
          this.setWasHere( x,y );
          var adjacent = { x: x,
                           y: y,
                           dist: curr.dist + 1 };
          q.push( adjacent );

          // places within 50 steps, hack
          if (curr.dist < 50) {
            this.nearby[x+":"+y] = true;
          }

          postMessage({ msg: "update", maze: this });
          spin( 1000 );
        }
      }
    }

    // d'oh, we never found the goal
    return YA_CANT_GET_THERE_FROM_HERE;
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
    postMessage({ msg: "done", maze: maze });

    // commit suicide
    console.log("Worker: Bye!");
    self.close();
  } else {
    console.log("Worker recieved weird event: " + e.data);
  }
});
