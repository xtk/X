/*
 * ${HEADER}
 */

// provides
goog.provide('X.interactor');

// requires
goog.require('X.base');
goog.require('X.camera');
goog.require('X.camera.PanEvent');
goog.require('X.camera.RotateEvent');
goog.require('X.camera.ZoomEvent');
goog.require('X.exception');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');



/**
 * Create an interactor for a given element in the DOM tree.
 *
 * @constructor
 * @extends {X.base}
 */
X.interactor = function(element) {

  // call the standard constructor of X.base
  goog.base(this);

  // check if we have a valid element
  if (!goog.isDefAndNotNull(element) || !(element instanceof Element)) {

    throw new X.exception(
        'Fatal: Could not add interactor to the given element.');

  }

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._className = 'interactor';

  this._element = element;

  this._mouseWheelHandler = null;

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
  this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);

  goog.events.listen(this._mouseWheelHandler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel
          .bind(this));

};

X.interactor.prototype.observeMouseDown = function() {

  goog.events.listen(this._element, goog.events.EventType.MOUSEDOWN,
      this.onMouseDown.bind(this));

  // deactivate right-click context menu
  // found no way to use goog.events for that? tried everything..
  // according to http://help.dottoro.com/ljhwjsss.php, this method is
  // compatible with all browsers but opera
  this._element.oncontextmenu = function() {

    return false;

  };

};

X.interactor.prototype.observeMouseMove = function() {

  goog.events.listen(this._element, goog.events.EventType.MOUSEMOVE,
      this.onMouseMove.bind(this));
  goog.events.listen(this._element, goog.events.EventType.MOUSEOUT,
      this.onMouseOut.bind(this));

};

X.interactor.prototype.observeMouseUp = function() {

  goog.events.listen(this._element, goog.events.EventType.MOUSEUP,
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

  this.dispatchEvent('mouseup');

  // prevent any other actions by the browser (f.e. scrolling, selection..)
  event.preventDefault();

  // grab the current mouse position
  var currentMousePosition = new goog.math.Vec2(event.clientX, event.clientY);

  // get the distance in terms of the last mouse move event
  var distance = this._lastMousePosition.subtract(currentMousePosition);

  // save the current mouse position as the last one
  this._lastMousePosition = currentMousePosition.clone();

  // threshold the distance to avoid 'irregular' movement
  if (Math.abs(distance.x) < 2) {

    distance.x = 0;

  }
  if (Math.abs(distance.y) < 2) {

    distance.y = 0;

  }

  // jump out if the distance is 0 to avoid unnecessary events
  if (distance.magnitude() == 0) {

    return;

  }


  //
  // check which mouse buttons or keys are pressed
  //
  if (this._leftButtonDown && !event.shiftKey) {
    //
    // LEFT MOUSE BUTTON DOWN AND NOT SHIFT DOWN
    //

    // create a new pan event
    var e = new X.camera.RotateEvent();

    // attach the distance vector
    e._distance = distance;

    // attach the angle in degrees
    e._angle = 0;

    // .. fire the event
    this.dispatchEvent(e);


  } else if (this._middleButtonDown || (this._leftButtonDown && event.shiftKey)) {
    //
    // MIDDLE MOUSE BUTTON DOWN or LEFT MOUSE BUTTON AND SHIFT DOWN
    //

    // create a new pan event
    var e = new X.camera.PanEvent();

    // attach the distance vector
    e._distance = distance;

    // .. fire the event
    this.dispatchEvent(e);


  } else if (this._rightButtonDown) {
    //
    // RIGHT MOUSE BUTTON DOWN
    //

    // create a new zoom event
    var e = new X.camera.ZoomEvent();

    // set the zoom direction
    // true if zooming in, false if zooming out
    e._in = (distance.y < 0);

    // with the right click, the zoom will happen rather
    // fine than fast
    e._fast = false;

    // .. fire the event
    this.dispatchEvent(e);


  }

};


/**
 *
 */
X.interactor.prototype.onMouseWheel = function(event) {

  // prevent any other action (like scrolling..)
  event.preventDefault();

  // create a new zoom event
  var e = new X.camera.ZoomEvent();

  // set the zoom direction
  // true if zooming in, false if zooming out
  // delta is here given by the event
  e._in = (event.deltaY > 0);

  // with the mouseWheel, the zoom will happen rather
  // fast than fine
  e._fast = true;

  // .. fire the event
  this.dispatchEvent(e);

};
