/*global $, GraphicsWorld, SpinningCube, Dragger */

function run() {
  var el = $("#world");

  var world = new GraphicsWorld( el.width(), el.height() );
  el.append( $(world.element));

//   el.on("click", function( ev ) { world.toggleAnimation(); });
  el.on("click", function( ev ) { ev.preventDefault(); });

  var cube = new SpinningCube();
  cube.setRPM( 6 );

  world.scene.add( cube.model );

  // cube animation (cube.update())
  world.addUpdateCallback({
    update: function() { this.update(); },
    context: cube
  });

  attachCubeRotator( el, world, cube );
//  attachCubeDragger( el, world );

  world.loop();}


$( run );


//----------------------------------------
// mouse drag moves cube (requires position: relative)
//----------------------------------------
function attachCubeDragger( glElement, world ) {
  var el;
  var cubeDragger = new Dragger(
    {
      context: this,
      start: function(ev) {  // ev is from mouse click event
        world.setAnimation( false );
        el = $(ev.currentTarget);

      },

      // mouse moved
      update: function( dx, dy ) {
        var x = parseInt( el.css("left"), 10);  // expensive? cache it
        var y = parseInt( el.css("top"), 10);

        el.css("left", x + dx);
        el.css("top",  y + dy);
      },
      stop: function() {
        world.setAnimation( true );
      }
    }
  );

  $(glElement).on("mousedown",
                  function( ev ) { cubeDragger.start( ev ); });
};


//----------------------------------------
// mouse drag rotates cube
//----------------------------------------
function attachCubeRotator( glElement, world, cube ) {
  var cubeRotator = new Dragger(
    {
      context: this,
      start: function( ev ) {
        world.setAnimation( false );
      },
      update: function( dx, dy ) {
        cube.rotateDelta( dy/100, dx/100, 0 );
        world.draw();
      },
      stop: function() {
        world.setAnimation( true );
      }
    }
  );
  $(glElement).on("mousedown",
                  function( ev ) { cubeRotator.start( ev ); });
};
