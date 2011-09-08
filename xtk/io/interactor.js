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
  
  this._mouseDown = false;
  
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
  
};

X.interactor.prototype.observeMouseMove = function() {

  this._renderer.container().addEventListener('mousemove',
      this.onMouseMove.bind(this), false);
  
};

X.interactor.prototype.observeMouseUp = function() {

  this._renderer.container().addEventListener('mouseup',
      this.onMouseUp.bind(this), false);
  
};

X.interactor.prototype.onMouseDown = function(event) {

  this._mouseDown = true;
  
};

X.interactor.prototype.onMouseUp = function(event) {

  this._mouseDown = false;
  
};

X.interactor.prototype.onMouseMove = function(event) {

  

  if (this._mouseDown) {
    var v = new goog.math.Vec2(event.layerX, event.layerY);
    
    var vec3d = this._renderer.convertDisplayToWorldCoordinates(v);
    
    console.log(vec3d.x, vec3d.y, vec3d.z);
    
  }
  
};

X.interactor.prototype.onMouseWheel = function(event) {

  // var fov = this._camera.fieldOfView();
  
  var delta = event.wheelDeltaY;
  
  if (delta < 0) {
    
    this._camera._position.z = this._camera._position.z - 30;
    
  } else {
    
    this._camera._position.z = this._camera._position.z + 30;
    
  }
  
  this._camera._view = this._camera.lookAt_(this._camera._position,
      this._camera._focus);
  
  this._renderer.render();
  
  event.preventDefault();
  
};
