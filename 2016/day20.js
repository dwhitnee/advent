/*global $, WorkerThread, getData, md5 */

/**
 *
 */
class Firewall {
  constructor( rules ) {
    this.ranges = [];
    this.highestIP = 0;
    this.floor = 0;

    this.parseRules( rules );
  }

  // parse blocked IP ranges (ex "128-232")
  parseRules( data ) {
    for (var i=0; i < data.length; i++) {
      var match = data[i].match(/(\d+)-(\d+)/);

      // find continuous ranges
      if (match) {
        this.addRange( parseInt( match[1] ), parseInt( match[2] ));
      }
    }
  }

  addRange( low, high ) {
    // if new range overlaps old range, extend it
    // if new range discrete, add it
    for (var i=0; i < this.ranges.length; i++) {
      var range = this.ranges[i];

      // extend a bit to catch adjacent ranges
      var rlow = range.low - 1;
      var rhigh = range.high + 1;

      if ((low <= rlow) && (high >= rhigh)) {         // overlaps entirely
        rlow = low;
        rhigh = high;
        return true;
      } else if ((low >= rlow) && (high <= rhigh)) {         // contained entirely
        // do nothing, we already have this range
        return true;
      } else if ((low <= rlow) &&                         // overlaps on low end
                 (rlow <= high ) && (high <= rhigh))
      {
        range.low = low;
        return true;
      } else if ((high >= rhigh) &&
                 (rlow <= low) && (low <= rhigh)) {      // overlaps on high end
        range.high = high;
        return true;
      }
    }
    this.ranges.push({ low: low, high: high });
    return false;
  }

  findLowestValidIP() {
    return this.ranges[0].high+1;
  }

  findAllowed() {
    var total = 0;
    var lastValid = this.ranges[0].high+1;
    for (var i=1; i < this.ranges.length; i++) {
      total += (this.ranges[i].low - lastValid);
      lastValid = this.ranges[i].high + 1;
    }
    return total;
  }
}


function run( data ) {
  var firewall = new Firewall( data );
  $("#answer1").text( firewall.findLowestValidIP() );
  $("#answer2").text( firewall.findAllowed() );
}

function waitForButton() {
  var testdata = ["0-2","4-7","5-8"];

  $("button").on("click", function() {
    var input = $("textarea").val();
    if (input) {
      run( input.split( /\n/ ));
    } else {
      getData("input/day20").then( data => run( data ));
    }
  });
}

$( waitForButton );
