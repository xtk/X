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
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math.Vec2');



/**
 * Create an interactor for a given element in the DOM tree.
 *
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends {X.base}
 */
X.interactor = function(element) {

  // check if we have a valid element
  if (!goog.isDefAndNotNull(element) || !(element instanceof Element)) {

    throw new X.exception(
        'Fatal: Could not add interactor to the given element.');

  }

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._className = 'interactor';

  /**
   * The observed DOM element of this interactor.
   *
   * @type {!Element}
   * @protected
   */
  this._element = element;

  /**
   * The browser independent mousewheel handler.
   *
   * @type {?goog.events.MouseWheelHandler}
   * @protected
   */
  this._mouseWheelHandler = null;

  /**
   * Indicatates if the left mouse button is pressed.
   *
   * @type {boolean}
   * @protected
   */
  this._leftButtonDown = false;

  /**
   * Indicatates if the middle mouse button is pressed.
   *
   * @type {boolean}
   * @protected
   */
  this._middleButtonDown = false;

  /**
   * Indicatates if the right mouse button is pressed.
   *
   * @type {boolean}
   * @protected
   */
  this._rightButtonDown = false;

  /**
   * The previous mouse position.
   *
   * @type {!goog.math.Vec2}
   * @protected
   */
  this._lastMousePosition = new goog.math.Vec2(0, 0);

};
// inherit from X.base
goog.inherits(X.interactor, X.base);


/**
 * Observe mouse wheel interaction on the associated DOM element.
 */
X.interactor.prototype.observeMouseWheel = function() {

  // we use the goog.events.MouseWheelHandler for a browser-independent
  // implementation
  this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);

  goog.events.listen(this._mouseWheelHandler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel
          .bind(this));

};


/**
 * Observe mouse clicks on the associated DOM element. This function also blocks
 * the context menu on right clicks in a browser independent fashion.
 */
X.interactor.prototype.observeMouseClicks = function() {

  // mouse down
  goog.events.listen(this._element, goog.events.EventType.MOUSEDOWN,
      this.onMouseDown.bind(this));

  // mouse up
  goog.events.listen(this._element, goog.events.EventType.MOUSEUP,
      this.onMouseUp.bind(this));

  // deactivate right-click context menu
  // found no way to use goog.events for that? tried everything..
  // according to http://help.dottoro.com/ljhwjsss.php, this method is
  // compatible with all browsers but opera
  this._element.oncontextmenu = function() {

    return false;

  };

};


/**
 * Observe mouse movement on the associated DOM element.
 */
X.interactor.prototype.observeMouseMovement = function() {

  // mouse movement inside the element
  goog.events.listen(this._element, goog.events.EventType.MOUSEMOVE,
      this.onMouseMovementInside.bind(this));

  // mouse movement outside the element
  goog.events.listen(this._element, goog.events.EventType.MOUSEOUT,
      this.onMouseMovementOutside.bind(this));

};


/**
 * Callback for mouse down events on the associated DOM element.
 *
 * @param {Event} event The browser fired event.
 */
X.interactor.prototype.onMouseDown = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {

    // left button click
    this._leftButtonDown = true;

  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {

    // middle button click
    this._middleButtonDown = true;

  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {

    // right button click
    this._rightButtonDown = true;

  }

  // prevent further handling by the browser
  event.preventDefault();

};


/**
 * Callback for mouse up events on the associated DOM element.
 *
 * @param {Event} event The browser fired event.
 */
X.interactor.prototype.onMouseUp = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {

    // left button click
    this._leftButtonDown = false;

  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {

    // middle button click
    this._middleButtonDown = false;

  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {

    // right button click
    this._rightButtonDown = false;

  }

  // prevent further handling by the browser
  event.preventDefault();

};


/**
 * Callback for mouse movement events outside the associated DOM element. This
 * resets all internal interactor flags.
 *
 * @param {Event} event The browser fired event.
 */
X.interactor.prototype.onMouseMovementOutside = function(event) {

  // reset the click flags
  this._leftButtonDown = false;
  this._middleButtonDown = false;
  this._rightButtonDown = false;
  this._lastMousePosition.x = 0;
  this._lastMousePosition.y = 0;

  // prevent further handling by the browser
  event.preventDefault();

};


/**
 * Callback for mouse movement events inside the associated DOM element. This
 * distinguishes by pressed mouse buttons, key accelerators etc. and fires
 * proper X.camera events.
 *
 * @param {Event} event The browser fired event.
 */
X.interactor.prototype.onMouseMovementInside = function(event) {

  // TODO this needs to be more generalized
  this.dispatchEvent('mouseup');

  // prevent any other actions by the browser (f.e. scrolling, selection..)
  event.preventDefault();

  // is shift down?
  var shiftDown = event.shiftKey;

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
  if (this._leftButtonDown && !shiftDown) {
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


  } else if (this._middleButtonDown || (this._leftButtonDown && shiftDown)) {
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
 * Callback for mouse wheel events on the associated DOM element. This fires
 * proper X.camera events.
 *
 * @param {Event} event The browser fired event.
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

// export symbols (required for advanced compilation)
goog.exportSymbol('X.interactor', X.interactor);
goog.exportSymbol('X.interactor.prototype.observeMouseWheel',
    X.interactor.prototype.observeMouseWheel);
goog.exportSymbol('X.interactor.prototype.observeMouseClicks',
    X.interactor.prototype.observeMouseClicks);
goog.exportSymbol('X.interactor.prototype.observeMouseMovement',
    X.interactor.prototype.observeMouseMovement);
goog.exportSymbol('X.interactor.prototype.onMouseDown',
    X.interactor.prototype.onMouseDown);
goog.exportSymbol('X.interactor.prototype.onMouseUp',
    X.interactor.prototype.onMouseUp);
goog.exportSymbol('X.interactor.prototype.onMouseMovementOutside',
    X.interactor.prototype.onMouseMovementOutside);
goog.exportSymbol('X.interactor.prototype.onMouseMovementInside',
    X.interactor.prototype.onMouseMovementInside);
goog.exportSymbol('X.interactor.prototype.onMouseWheel',
    X.interactor.prototype.onMouseWheel);
