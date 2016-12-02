//----------------------------------------------------------------------
// mouse watcher that updates a listener with deltas in mouse position.
// var myWatcher = new Dragger({
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


class Dragger {
  constructor( callback ) {
    this.callback = callback;
  }
  
  notifyStart( ev ) {
    if (this.callback.start) {
      this.callback.start.call( this.callback.context, ev );
    }
  }

  notifyUpdate( dx, dy ) {
    if (this.callback.update) {
      this.callback.update.call( this.callback.context, dx, dy );
    }
  }

  notifyStop() {
    if (this.callback.stop) {
      this.callback.stop.call( this.callback.context );
    }
  }

  start( ev ) {
    var self = this;
    var lastX = ev.clientX;
    var lastY = ev.clientY;
    
    this.notifyStart( ev );
    
    // on every mouse move, call the update() callback
    // ".Dragger" is just a tag we can later use to search for in off()
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
  }

  stop() {
    $(document.body).off(".Dragger");
    this.notifyStop();
  }

}
