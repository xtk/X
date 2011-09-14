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
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');



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
  
  this._mouseWheelHandler = null;
  
  this._renderer = renderer;
  
  this._camera = renderer.camera();
  
  this._leftButtonDown = false;
  
  this._middleButtonDown = false;
  
  this._rightButtonDown = false;
  
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
};
// inherit from X.base
goog.inherits(X.interactor, X.base);

X.interactor.prototype.observeMouseWheel = function() {

  // we use the goog.events.MouseWheelHandler for a browser-independent
  // implementation
  this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._renderer
      .canvas());
  
  goog.events.listen(this._mouseWheelHandler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel
          .bind(this));
  
};

X.interactor.prototype.observeMouseDown = function() {

  goog.events.listen(this._renderer.canvas(), goog.events.EventType.MOUSEDOWN,
      this.onMouseDown.bind(this));
  
  // deactivate right-click context menu
  this._renderer.container().oncontextmenu = function() {

    return false;
    
  };
  
};

X.interactor.prototype.observeMouseMove = function() {

  goog.events.listen(this._renderer.canvas(), goog.events.EventType.MOUSEMOVE,
      this.onMouseMove.bind(this));
  goog.events.listen(this._renderer.canvas(), goog.events.EventType.MOUSEOUT,
      this.onMouseOut.bind(this));
  
};

X.interactor.prototype.observeMouseUp = function() {

  goog.events.listen(this._renderer.canvas(), goog.events.EventType.MOUSEUP,
      this.onMouseUp.bind(this));
  
};

X.interactor.prototype.onMouseOut = function(event) {

  // reset the click flags
  this._leftButtonDown = false;
  this._middleButtonDown = false;
  this._rightButtonDown = false;
  this._lastMousePosition.x = 0;
  this._lastMousePosition.y = 0;
  
};

X.interactor.prototype.onMouseDown = function(event) {

  console.log(this);
  
  // reset the lastMovement
  this._lastMovementY = 0;
  
  if (event.button == 0) {
    
    // left button click
    this._leftButtonDown = true;
    
  } else if (event.button == 1) {
    
    // middle button click
    this._middleButtonDown = true;
    
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
    
  } else if (event.button == 1) {
    
    // middle button click
    this._middleButtonDown = false;
    
  } else if (event.button == 2) {
    
    // right button click
    this._rightButtonDown = false;
    
  }
  
  event.preventDefault();
  
};

X.interactor.prototype.onMouseMove = function(event) {

  var currentMousePosition = new goog.math.Vec2(event.clientX, event.clientY);
  
  if (this._leftButtonDown && !event.shiftKey) {
    
    var distance = this._lastMousePosition.subtract(currentMousePosition);
    
    if (Math.abs(distance.x) < 2) {
      
      distance.x = 0;
      
    }
    if (Math.abs(distance.y) < 2) {
      
      distance.y = 0;
      
    }
    
    this._camera._position.x = this._camera._position.x + distance.x;
    this._camera._position.y = this._camera._position.y - distance.y;
    // this._camera._focus.x = this._camera._focus.x + distance.x;
    // this._camera._focus.y = this._camera._focus.y - distance.y;
    
    this._camera._view = this._camera.lookAt_(this._camera._position,
        this._camera._focus);
    
    this._renderer.render();
    
  }
  
  if (this._middleButtonDown || (this._leftButtonDown && event.shiftKey)) {
    
    var distance = this._lastMousePosition.subtract(currentMousePosition);
    
    if (Math.abs(distance.x) < 2) {
      
      distance.x = 0;
      
    }
    if (Math.abs(distance.y) < 2) {
      
      distance.y = 0;
      
    }
    
    this._camera._position.x = this._camera._position.x + distance.x;
    this._camera._position.y = this._camera._position.y - distance.y;
    this._camera._focus.x = this._camera._focus.x + distance.x;
    this._camera._focus.y = this._camera._focus.y - distance.y;
    
    this._camera._view = this._camera.lookAt_(this._camera._position,
        this._camera._focus);
    
    this._renderer.render();
    
  }
  
  if (this._rightButtonDown) {
    
    var delta = this._lastMousePosition.y - currentMousePosition.y;
    
    if (delta < 0) {
      
      // zoom in fine mode
      this._camera.zoomIn(true);
      
    } else {
      
      // zoom out in fine mode
      this._camera.zoomOut(true);
      
    }
    
  }
  
  this._lastMousePosition = currentMousePosition.clone();
  
  event.preventDefault();
  
};

X.interactor.prototype.onMouseWheel = function(event) {

  var delta = event.deltaY;
  
  if (delta > 0) {
    
    // zoom in
    this._camera.zoomIn();
    
  } else {
    
    // zoom out
    this._camera.zoomOut();
    
  }
  
  event.preventDefault();
  
};
