/*global $ */

// return array of lines of data
function getData( url ) {
  return new Promise(
    function( resolve, reject ) {
      $.get( url )
        .done( function( input ) {
          resolve( input.split( /\n/ ));
        })
        .fail( function( err ) {
          reject( err );
        });
    });
}
