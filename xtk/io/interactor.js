/*
 * ${HEADER}
 */

// provides
goog.provide('X.interactor');

// requires
goog.require('X.base');
goog.require('X.camera');
goog.require('X.exception');
goog.require('X.renderer');
goog.require('goog.dom');



/**
 * Create an interactor.
 * 
 * @constructor
 * @extends {X.base}
 */
X.interactor = function(renderer) {

  // call the standard constructor of X.base
  goog.base(this);
  
  // check if we have a valid renderer
  if (!goog.isDefAndNotNull(renderer) || !(renderer instanceof X.renderer)) {
    
    throw new X.exception('Fatal: Could not add interactor to renderer.');
    
  }
  
  // check if the renderer has a valid camera
  if (!goog.isDefAndNotNull(renderer.camera())
      || !(renderer.camera() instanceof X.camera)) {
    
    throw new X.exception('Fatal: Could not find a valid camera.');
    
  }
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'interactor';
  
  this._renderer = renderer;
  
  this._camera = renderer.camera();
  
  this._leftButtonDown = false;
  
  this._rightButtonDown = false;
  
  this._lastMovementY = 0;
  
};
// inherit from X.base
goog.inherits(X.interactor, X.base);

X.interactor.prototype.observeMouseWheel = function() {

  this._renderer.container().addEventListener('mousewheel',
      this.onMouseWheel.bind(this), false);
  
};

X.interactor.prototype.observeMouseDown = function() {

  this._renderer.container().addEventListener('mousedown',
      this.onMouseDown.bind(this), false);
  
  // deactivate right-click context menu
  this._renderer.container().oncontextmenu = this.onContextMenu;
  
};

X.interactor.prototype.onContextMenu = function() {

  return false;
  
};

X.interactor.prototype.observeMouseMove = function() {

  this._renderer.container().addEventListener('mousemove',
      this.onMouseMove.bind(this), false);
  this._renderer.container().addEventListener('mouseout',
      this.onMouseOut.bind(this), false);
  
};

X.interactor.prototype.observeMouseUp = function() {

  this._renderer.container().addEventListener('mouseup',
      this.onMouseUp.bind(this), false);
  
};

X.interactor.prototype.onMouseOut = function(event) {

  // reset the click flags
  this._leftButtonDown = false;
  this._rightButtonDown = false;
  this._lastMovementY = 0;
  
};

X.interactor.prototype.onMouseDown = function(event) {

  // reset the lastMovement
  this._lastMovementY = 0;
  
  if (event.button == 0) {
    
    // left button click
    this._leftButtonDown = true;
    
  } else if (event.button == 2) {
    
    // right button click
    this._rightButtonDown = true;
    
  }
  
  event.preventDefault();
  
};

X.interactor.prototype.onMouseUp = function(event) {

  if (event.button == 0) {
    
    // left button click
    this._leftButtonDown = false;
    
  } else if (event.button == 2) {
    
    // right button click
    this._rightButtonDown = false;
    
  }
  
  event.preventDefault();
  
};

X.interactor.prototype.onMouseMove = function(event) {

  if (this._leftButtonDown) {
    var v = new goog.math.Vec2(event.layerX, event.layerY);
    
    var vec3d = this._renderer.viewportToNormalizedViewport(v);
    
    console.log(vec3d.x, vec3d.y, vec3d.z);
    
  }
  
  if (this._rightButtonDown) {
    
    var currentY = event.layerY;
    
    var delta = this._lastMovementY - currentY;
    
    if (delta < 0) {
      
      // zoom in fine mode
      this._camera.zoomIn(true);
      
    } else {
      
      // zoom out in fine mode
      this._camera.zoomOut(true);
      
    }
    
    this._lastMovementY = currentY;
    
  }
  
  event.preventDefault();
  
};

X.interactor.prototype.onMouseWheel = function(event) {

  // TODO event handling is browser dependent.. need to add some more calls
  
  var delta = event.wheelDeltaY;
  
  if (delta < 0) {
    
    // zoom in
    this._camera.zoomIn();
    
  } else {
    
    // zoom out
    this._camera.zoomOut();
    
  }
  
  event.preventDefault();
  
};
