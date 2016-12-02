//----------------------------------------------------------------------
//  geometry for an Amazon yellow cube, plus update logic to spin it.

//----------------------------------------------------------------------
class SpinningCube {

  /**
   * @param 
   */
  constructor() {
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

  setRPM( rpm ) {
    this.angularSpeed = rpm/60;
  }

  rotateDelta( dx, dy, dz) {
    this.model.rotation.x += dx||0;
    this.model.rotation.y += dy||0;
    this.model.rotation.z += dz||0;
  }

  update() {
    var time = new Date().getTime();
    var timeDiff = time - this.lastTime;
    this.lastTime = time;
    
    var angleChange = this.angularSpeed * 2*Math.PI * timeDiff/1000;
    this.rotateDelta( angleChange, 4*angleChange );
  }
}

