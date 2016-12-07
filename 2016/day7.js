/*global $, WorkerThread */

function getData( url ) {
  return new Promise(
    function( resolve, reject ) {
      $.get( url )
        .done( function( input ) {
          resolve( input.split( /\s+/ ));
        })
        .fail( function( err ) {
          reject( err );
        });
    });
}



/**
 *
 */
class IPV7Address {
  constructor( address ) {
    this.address = address;
    this._parsed = false;
    this.hasGoodABBA = false;
    this.hasBadABBA = false;

    this.hasGoodABBA = false;
    this.hasBadABBA = false;
}

  // transport-layer snooping
  // @true if a good ABBA is present (outside brackets), but no bad ABBA's (inside brackets)
  supportsTLS() {
    this.parseSubnets();
    return this.hasGoodABBA && !this.hasBadABBA;
  }

  // Super Secret Listening
  // @true if an ABA is present outside brackets and a BAB inside brackets
  supportsSSL() {
    return this._supportsSSL;
  }

  checkSSLSupport( aba, bab ) {
    for (var a=0; a < aba.length; a++) {
      for (var b=0; b < bab.length; b++) {
        this._supportsSSL = (aba[a].charAt(0) === bab[b].charAt(1));
      }
    }
  }

  // search for abba and aba-like strings in an address of this format: str[str]str[str]str
  parseSubnets() {
    if (this._parsed) {
      return;
    }

    var addr = this.address.slice(0);
    var match;
    var aba = [], bab = [];

    do {
      // xyyx[gffg]abc[def]poop
      // 1 will be outside backets, 2 will be inside brackets
      match = addr.match( /(.*?)\[(.*?)\](.*)/ );

      if (!match || match.length < 3) {
        break;
      }
      this.hasGoodABBA |= this.hasABBA( match[1] );  // "xyyx" then "abc"
      this.hasBadABBA  |= this.hasABBA( match[2] );  // "gffg" then "def"

      // collect ABA's and BAB's
      // TBD

      if (this.getABA( match[1] )) {
        aba.push( this.getABA( match[1] ));
      }

      if (this.getBAB( match[2] )) {
        bab.push( this.getBAB( match[2] ));
      }

      addr = match[3];  // remainder
    } while ((match.length > 3) && addr.match(/\[/))

    // check trailing part, too
    this.hasGoodABBA |= this.hasABBA( addr );    // "poop"

    if (this.getABA( addr )) {
      aba.push( this.getABA( addr ));
    }

    this.checkSSLSupport(aba, bab);

    this._parsed = true;
  }

  // @return true if any 4-char sequence matches ABBA pattern
  hasABBA( str ) {
    if (str.length < 4) {
      return false;
    }
    var found = false;

    for (var i=0; i <= str.length-4; i++) {
      found |= ((str.charAt(i) === str.charAt(i+3)) &&
                  (str.charAt(i+1) === str.charAt(i+2)) &&
                  (str.charAt(i) !== str.charAt(i+1)));
    }
    return found;
  }

  // @return true if any 3-char sequence matches ABA pattern
  getABA( str ) {
    var aba;

    if (str.length < 3) {
      return aba;
    }

    for (var i=0; i <= str.length-3; i++) {
      if ((str.charAt(i) === str.charAt(i+2)) &&
          (str.charAt(i) !== str.charAt(i+1)))
      {
        aba = str.substr( i, 3 );
      }
    }
    return aba;
  }

  // @return true if any 3-char sequence matches BAB pattern
  getBAB( str ) {
    var bab;

    if (str.length < 3) {
      return bab;
    }

    for (var i=0; i <= str.length-3; i++) {
      if ((str.charAt(i) === str.charAt(i+2)) &&
          (str.charAt(i) !== str.charAt(i+1)))
      {
        bab = str.substr( i, 3 );
      }
    }
    return bab;
  }
}



// show each address in green or not
function displayProgress( addr ) {
  var newAddr = $("<div/>").text( addr.address );
  if (addr.supportsTLS()) {
    newAddr.addClass("hasTLS");
  }
  if (addr.supportsSSL()) {
    newAddr.addClass("hasSSL");
  }

  $("#ipAddrs").append( newAddr );
}


// @return a promise to do the work
function checkAllAddrsForTLS( data ) {

  var totalTLSAddrs = 0;
  var totalSSLAddrs = 0;

  // worker function
  function doWork( i ) {

    var line = data[i];
    if (!line) {
      return false;
    }
    var addr = new IPV7Address( line );

    if (addr.supportsTLS()) {
      totalTLSAddrs++;
    }
    if (addr.supportsSSL()) {
      totalSSLAddrs++;
    }

    displayProgress( addr );
    // console.log( i + ": " + totalTLSAddrs );

    return i < data.length;
  }

  return new Promise(
    function( resolve, reject ) {

      var worker = new WorkerThread(
        doWork,
        () =>  {
          resolve( [totalTLSAddrs, totalSSLAddrs] );
        },
        {
          // chunkSize: 10000,
          // progressFn: (addr) => {
          //   displayProgress( addr );
          // }
        });
      worker.start();
    });
}


//----------------------------------------------------------------------
function readAddresses( data ) {
  var start = Date.now();

  checkAllAddrsForTLS( data ).then( function( result ) {
    $("#answer1").text( result[0] );
    $("#answer2").text( result[1] );
    $("#timing1").text( (Date.now() - start)  / 1000);

    // start = Date.now();
    // checkAllAddrsForTLS( data ).then( function() {
    //   $("#timing2").text( (Date.now() - start)  / 1000);
    // });
  });
}

function run() {
  getData("input/day7").then( data => { readAddresses( data ); });

  var testdata = [
    "abba[mnop]qrst",
    "abcd[bddb]xyyx",
    "aaaa[qwer]tyui",
    "ioxxoj[asdfgh]zxcvbn"
  ];

  testdata = [
    "aba[bab]xyz",
    "xyx[xyx]xyx",
    "aaa[kek]eke",
    "zbzaz[bzb]cdb"
  ];

//  readAddresses( testdata );
}

$( run );
