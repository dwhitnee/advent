/*global postMessage */


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

  // @return bool, given cell is a valid cell (non-negative coords)
  isValid( x, y ) {
    return (x >= 0) && (y >= 0);
     // && (x < this.width) && (y < this.height);  // we're "infinite"
  }

  solve() {
    return this.findShortestPathWithBreadthFirstSearch( this.start, this.goal );
  }


  /*
   * function to find the shortest path between a given source cell to a destination cell.
   * @param src {x,y}
   * @param dest {x,y}
   * @return distance travelled
   */
  findShortestPathWithBreadthFirstSearch( src, dest ) {
    this.beenThere = {};
    this.path = {};
    this.nearby = {};
    this.nearby[src.x+":"+src.y] = true;
    this.distance = YA_CANT_GET_THERE_FROM_HERE;

    return new Promise(
      (resolve, reject) => {
        // precondition
        if (this.isWall( src.x, src.y) || this.isWall( dest.x, dest.y )) {
          reject();
          return;
        }

        this.setWasHere( src.x, src.y );

        this.queue = [];  // Create a queue of searchable cells

        // start at source, distance of source cell is 0
        this.queue.push( { x: src.x, y: src.y, dist: 0 });

        var self = this;
        function queueWalker() {
          var distance = self.walkQueue( dest );

          if (distance > 0) {
            self.distance = distance;
            resolve();                        // done!
            return;
          }

          if (self.queue.length > 0) {
            setTimeout( () => { queueWalker(); }, 20);       // keep walking
          } else {
            reject();                        // d'oh, we never found the goal
            return;
          }
        }

        queueWalker();   // start walking
      });
  }

  /**
   * Process one cell in the breadth-first search queue
   * @return positive distance to destination OR
   *  -1 if the queue walk was unsuccessful (no path to dest) OR
   *  0 if more quue to walk
   */
  walkQueue( dest ) {
    if (!this.queue.length) {
      return YA_CANT_GET_THERE_FROM_HERE;
    }

    // let's examine the first cell in the queue (only once)
    var curr = this.queue.shift();

    // Yippee! We are done
    if ((curr.x === dest.x) && (curr.y === dest.y)) {
      return curr.dist;
    }

    var neighbors = [
      { x: 0, y:-1 },
      { x:-1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ];

    // enqueue the adjacent 4 cells if they are accessible
    for (var i = 0; i < 4; i++) {
      var x = curr.x + neighbors[i].x;
      var y = curr.y + neighbors[i].y;

      if (this.isValid( x,y ) && !this.isWall( x,y ) && !this.wasHere( x,y)) {
        // mark cell as visited and enqueue it
        this.setWasHere( x,y );
        var adjacent = { x: x,
                         y: y,
                         dist: curr.dist + 1 };
        this.queue.push( adjacent );

        // places within 50 steps, hack
        if (curr.dist < 50) {
          this.nearby[x+":"+y] = true;
        }

        // update boss of our state
        postMessage({ msg: "update", maze: this });
      }
    }
    return 0;
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

    maze.solve()
      .then(
        function() {
          postMessage({ msg: "done", maze: maze });
          console.log("Worker: Bye!");
          self.close();        // commit suicide
        })
      .catch(
        function() {
          postMessage({ msg: "error", maze: maze });
          console.log("Worker: Bye!");
          self.close();        // commit suicide
        });

  } else {
    console.log("Worker recieved weird event: " + e.data);
  }
});
