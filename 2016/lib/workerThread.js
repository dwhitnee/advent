/**
 * A worker fakes a thread that calls doWork until done, but yields (setTimeout)
 * after each unit is complete (and calls doProgress)
 *
 * Even setTimeout(0) allows us to yield to the browser renderer.
 */
class WorkerThread {
  /**
   * @param doWork - callback to perform one unit of work
   * @param doneFn - callback called when worker retires

   * @param config - contains any of the following fields
   * @param progressFn - callback called with pct of work complete
   * @param totalWorkUnits - expected number of work units (for progress)
   * @param totalTime - How much time whole job should take (causes a pause between units)
   * @param chunkSize - number of work units to do before yielding (speed up processing)
   */
  constructor( workFn, doneFn, config ) {
    this.workFn =  workFn;
    this.doneFn = doneFn;

    config = config || {};
    this.progressFn = config.progressFn;
    this.totalWorkUnits = config.totalWorkUnits;
    this.chunkSize = config.chunkSize || 1;  // 10,000 seems to be the same as "infinite"

    console.log("Chunk size " + this.chunkSize);
    this.delay = 0;
    if (config.totalTime && this.totalWorkUnits)  {
      this.delay = config.totalTime / this.totalWorkUnits;
    }
  }

  updateProgress( i ) {
    if (this.progressFn) {
      this.progressFn.call( {}, 100 * i / this.totalWorkUnits, i );
    }
  }

  start() {
    this.doWork( 0 );
  }

  /**
   * Do "chunkSize" units of work.  When done with the chunk, yield to the browser.
   * Larger chunk sizes hog the CPU and can impact the browser, but they also finish
   * many orders of magnitude faster (10,000 size chunks can run 100,000x faster)
   */
  doWork( index ) {
    var first = index;
    var last = first + this.chunkSize;    // do a bunch of work units before yielding
    var moreWork = true;

    for (var i=first; moreWork && i < last; i++ ) {
      moreWork = this.workFn.call( {}, i );
    }
    this.updateProgress( last );

    if (!moreWork) {
      this.doneFn.call();
    } else {
      setTimeout( () => {
        this.doWork( last );  // pick up work where we left off last
      }, this.delay );
    }
  };
}
