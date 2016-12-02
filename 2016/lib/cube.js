
//----------------------------------------------------------------------
//  Build scene graph and start animating
//----------------------------------------------------------------------
$(document).ready( function()
{
  // hijack nav logo
  var el = $("#nav-logo");
  el.css("background", "none");
  el.css("position", "relative");
  el.css("height", "30px");
  el.css("width",  "30px");
  el.css("z-index", "1000");
  el.css("left", "-10px");
  el.css("top",  "-5px");

  el.on("click", function( ev ) { ev.preventDefault(); });

  var world = new Duplo.World( el.width(), el.height() );
  el.append( $(world.renderer.domElement));

  var cube = new Duplo.SpinningCube();
  cube.setRPM( 6 );


  // wrap drag handler in one happy closure of variables.
  var attachCubeDragger = function( glContainer ) {
     var el;
     var cubeDragger = new Duplo.Dragger(
       {
         context: this,
         start: function(ev) {
           world.setAnimation( false );
           el = $(ev.currentTarget);
         },
         update: function( dx, dy ) {
           // do something on mouse update
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

    $(glContainer).on("mousedown",
       function( ev ) {
         cubeDragger.start( ev );
       });
   };

  // wrap cube rotate handler in one happy closure of variables.
  var attachCubeRotator = function( glContainer ) {
     var cubeRotator = new Duplo.Dragger(
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
    $(glContainer).on("mousedown",
       function( ev ) {
         cubeRotator.start( ev );
       });
   };

  attachCubeRotator("#nav-logo");
  attachCubeDragger("#nav-logo");

  world.scene.add( cube.model );

  // cube animation
  world.addUpdateCallback(
    {
      update: function() { this.update(); },
      context: cube
    });

  world.loop();
});

var Duplo = window.Duplo || {};

//----------------------------------------------------------------------
//  A simple WebGL Scene Graph using Three.js
//  An infinite udate()/draw() loop occurs using requestAnimationFrame
//  update() is a list of callbacks.
//----------------------------------------------------------------------
Duplo.World = (function()
{
  function World( width, height ) {
    this.scene = new THREE.Scene();
    this.updateCallbacks = [];

    this.doAnimation = true;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( width, height );

    // perspective (deg), aspect, near, far)
    this.camera = new THREE.PerspectiveCamera( 35, width / height, 1, 1000);
    this.camera.position.set(0,0,900);
    this.camera.lookAt( this.scene.position );

    var spot = new THREE.PointLight( 0xFF9900 );
    spot.position.set( 0, 0, 1000 );

    var ambient = new THREE.AmbientLight( 0x333333 );

    this.scene.add( spot );
    this.scene.add( ambient );
  }

  World.prototype = {
    addUpdateCallback: function( callback ) {
      this.updateCallbacks.push( callback );
    },

    setAnimation: function( doAnimation ) {
      this.doAnimation = doAnimation;
      if (this.doAnimation) {
        this.loop();  // restart event loop
      }
    },

    toggleAnimation: function() {
      this.setAnimation( !this.doAnimation );
    },

    // tell objects in graph to change, if necessary
    update: function() {
      for (var i=0; i < this.updateCallbacks.length; i++) {
        var callback = this.updateCallbacks[i];
        callback.update.call( callback.context, callback.data );
      }

    },
    draw: function() {
      this.renderer.render( this.scene, this.camera );
    },

    // app, cull, draw forever
    loop: function() {
      this.update();
      this.draw();

      if (this.doAnimation) {
        var self = this;
        window.requestAnimationFrame(    // rinse. repeat.
          function() {
            self.loop();
          });
      }
    }
  };

  return World;
})();

//----------------------------------------------------------------------
//  geometry for an Amazon yellow cube, plus update logic to spin it.
//----------------------------------------------------------------------
Duplo.SpinningCube = (function()
{
  function SpinningCube( scene ) {

    this.lastTime = (new Date()).getTime();

    var geometry = new THREE.CubeGeometry( 300, 300, 300 );
    // Lambert shading (as opposed to Phong or none)
    var material = new THREE.MeshLambertMaterial( { color: 0xFF9900,
                                                    transparent: true } );
    // material.opacity = .6;
    // material.ambient = 0xFF9900;

    this.model = new THREE.Mesh( geometry, material);

    this.model.overdraw = true;  // ???
  }

  SpinningCube.prototype = {

    setRPM: function( rpm ) {
      this.angularSpeed = rpm/60;
    },

    rotateDelta: function( dx, dy, dz) {
      this.model.rotation.x += dx||0;
      this.model.rotation.y += dy||0;
      this.model.rotation.z += dz||0;
    },

    update: function() {
      var time = new Date().getTime();
      var timeDiff = time - this.lastTime;
      this.lastTime = time;

      var angleChange = this.angularSpeed * 2*Math.PI * timeDiff/1000;
      this.rotateDelta( angleChange, 4*angleChange );
     }
  };

  return SpinningCube;
})();


//----------------------------------------------------------------------
// mouse watcher that updates a listener with deltas in mouse position.
// var myWatcher = new Duplo.Dragger({
//     context: this,
//     start: function( ev ) {  // jquery event obj on mousedown
//     },
//     update: function( dx, dy ) {
//       cube.rotateDelta( dx, dy, 0 );
//       world.draw();
//     },
//     stop: function() {
//       // continue life
//     }
//   }
// );
//----------------------------------------------------------------------
Duplo.Dragger = (function()
{
  function Dragger( callback ) {
    this.callback = callback;
  }
  Dragger.prototype = {

    notifyStart: function( ev ) {
      if (this.callback.start) {
        this.callback.start.call( this.callback.context, ev );
      }
    },
    notifyUpdate: function( dx, dy ) {
      if (this.callback.update) {
        this.callback.update.call( this.callback.context, dx, dy );
      }
    },
    notifyStop: function() {
      if (this.callback.stop) {
        this.callback.stop.call( this.callback.context );
      }
    },

    start: function( ev ) {
      var self = this;
      var lastX = ev.clientX;
      var lastY = ev.clientY;

      this.notifyStart( ev );

      $(document.body).on(
        {
          "mousemove.Dragger": function( ev ) {
            self.notifyUpdate( ev.clientX-lastX, ev.clientY-lastY );
            lastX = ev.clientX;
            lastY = ev.clientY;
          },
          "mouseup.Dragger": function( ev ) {
            self.stop();
          }
        });
    },
    stop: function() {
      $(document.body).off(".Dragger");
      this.notifyStop();
    }
  };
  return Dragger;
})();
