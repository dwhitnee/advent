//----------------------------------------------------------------------
//  A simple WebGL Scene Graph using Three.js
//  An infinite udate()/draw() loop occurs using requestAnimationFrame
//  update() is a list of callbacks.
//  setAnimation( callback ) is a like update, but can be toggled on and off
//
/*
  var el = $("#world");
  var world = new GraphicsWorld( el.width(), el.height() );
  el.append( $(world.element));
*/
//----------------------------------------------------------------------
class GraphicsWorld {

  /**
   *  @param width, height - dimensions of window (in pixels or world space?)
   */
  constructor( width, height ) {
    this.scene = new THREE.Scene();
    this.updateCallbacks = [];

    this.doAnimation = true;

    // perspective (deg), aspect, near, far)
    this.camera = new THREE.PerspectiveCamera( 35, width / height, 1, 1000);
    this.camera.position.set(0,0,900);
    this.camera.lookAt( this.scene.position );

    this.renderer = new THREE.WebGLRenderer();
    this.resize( width, height );

    var spot = new THREE.PointLight( 0xFF9900 );
    spot.position.set( 0, 0, 1000 );

    var ambient = new THREE.AmbientLight( 0x333333 );

    this.scene.add( spot );
    this.scene.add( ambient );
  }

  /**
   * @return the element to add to the web page
   */
  get element() {
    return this.renderer.domElement;
  }

  /**
   * @param update - function to call on every draw cycle 
   * @param context - "this" to bind in the above function
   * world.addUpdateCallback({
      update: function() { this.rotate(); },
      context: myCube
    });
   */
  addUpdateCallback( callback ) {
    this.updateCallbacks.push( callback );
  }

  /**
   * Activity to be run on every draw cycle depending on this.toggleAnimation
   * @param doAnimation function to run on every frame
   */
  setAnimation( doAnimation ) {
    this.doAnimation = doAnimation;
    if (this.doAnimation) {
      this.loop();  // restart event loop
    }
  }

  resize( width, height ) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( width, height );
  }


  toggleAnimation() {
    this.setAnimation( !this.doAnimation );
  }

  // tell objects in graph to change, if necessary
  update() {
    for (var i=0; i < this.updateCallbacks.length; i++) {
      var callback = this.updateCallbacks[i];
      callback.update.call( callback.context, callback.data );
    }
  }

  draw() {
    this.renderer.render( this.scene, this.camera );
  }

  // app, cull, draw forever
  loop() {
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
}




