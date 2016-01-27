// http://adventofcode.com/day/4
// Mine SantaCoins
// 2016 David Whitney

// startsWith polyfill
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}


const crypto = require('crypto');

/**
 * A valid SantaCoin has an MD5 hash that starts with at least 5 zeroes
 */
function isValidSantaCoin ( secret, value ) {
  var hash = crypto.createHash("MD5");
  hash.update( secret+value );
  var md5 = hash.digest('hex');
  // console.log( md5 );
  return md5.startsWith("000000");
}

var secretKey = "ckczppom";

// Start mining!
while (true) {
  if (isValidSantaCoin( secretKey, i )) {
    console.log("Valid SantaCoin: " + i );
    break;
  }
}
