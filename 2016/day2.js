/*global $ */

// var data = "R8, R4, R4, R8";


function run() {
  var el = $("#world");

  var world = new GraphicsWorld( el.width(), el.height() );
  el.append( $(world.element));

  el.on("click", function( ev ) { world.toggleAnimation(); });
//  el.on("click", function( ev ) { ev.preventDefault(); });

  var cube = new SpinningCube();
  cube.setRPM( 6 );

  world.scene.add( cube.model );

  // cube animation
  world.addUpdateCallback(
    {
      update: function() { this.update(); },
      context: cube
    });

  world.loop();}


$( run );



