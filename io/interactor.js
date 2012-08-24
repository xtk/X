/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

goog.provide('X.interactor');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.event.HoverEvent');
goog.require('X.event.HoverEndEvent');
goog.require('X.event.RotateEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.ResetViewEvent');
goog.require('X.event.ZoomEvent');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math.Vec2');



/**
 * Create an interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.base
 */
X.interactor = function(element) {

  // check if we have a valid element
  if (!goog.isDefAndNotNull(element) || !(element instanceof Element)) {
    
    throw new Error('Could not add interactor to the given element.');
    
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
  this._classname = 'interactor';
  
  /**
   * The observed DOM element of this interactor.
   * 
   * @type {!Element}
   * @protected
   */
  this._element = element;
  
  /**
   * The listener id for mouse wheel observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseWheelListener = null;
  
  /**
   * The listener id for mouse down observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseDownListener = null;
  
  /**
   * The listener id for mouse up observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseUpListener = null;
  
  /**
   * The listener id for mouse move observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseMoveListener = null;
  
  /**
   * The listener id for mouse out observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseOutListener = null;
  
  /**
   * The browser independent mouse wheel handler.
   * 
   * @type {?goog.events.MouseWheelHandler}
   * @protected
   */
  this._mouseWheelHandler = null;
  
  /**
   * Indicates if the mouse is inside the element.
   * 
   * @type {boolean}
   * @protected
   */
  this._mouseInside = true;
  
  /**
   * Indicates if the left mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._leftButtonDown = false;
  
  /**
   * Indicates if the middle mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._middleButtonDown = false;
  
  /**
   * Indicates if the right mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._rightButtonDown = false;
  
  /**
   * The current mouse position.
   * 
   * @type {!Array}
   * @protected
   */
  this._mousePosition = [0, 0];
  
  /**
   * The previous mouse position.
   * 
   * @type {!goog.math.Vec2}
   * @protected
   */
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  /**
   * The configuration of this interactor.
   * 
   * @enum {boolean}
   */
  this._config = {
    'MOUSEWHEEL_ENABLED': true,
    'MOUSECLICKS_ENABLED': true,
    'KEYBOARD_ENABLED': true,
    'HOVERING_ENABLED': true,
    'CONTEXTMENU_ENABLED': false
  };
  
};
// inherit from X.base
goog.inherits(X.interactor, X.base);


/**
 * Access the configuration of this interactor. Possible settings and there
 * default values are:
 * 
 * <pre>
 *  config.MOUSEWHEEL_ENABLED: true
 *  config.MOUSECLICKS_ENABLED: true
 *  config.KEYBOARD_ENABLED: true
 *  config.HOVERING_ENABLED: true
 *  config.CONTEXTMENU_ENABLED: false 
 * </pre>
 * 
 * @return {Object} The configuration.
 */
X.interactor.prototype.__defineGetter__('config', function() {

  return this._config;
  
});


/**
 * Get the state of the left mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('leftButtonDown', function() {

  return this._leftButtonDown;
  
});


/**
 * Get the state of the middle mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('middleButtonDown', function() {

  return this._middleButtonDown;
  
});


/**
 * Get the state of the right mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('rightButtonDown', function() {

  return this._rightButtonDown;
  
});


/**
 * Observe mouse wheel interaction on the associated DOM element.
 */
X.interactor.prototype.init = function() {

  if (this._config['MOUSEWHEEL_ENABLED']) {
    
    // we use the goog.events.MouseWheelHandler for a browser-independent
    // implementation
    this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);
    
    this._mouseWheelListener = goog.events.listen(this._mouseWheelHandler,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel_
            .bind(this));
    
  } else {
    
    // remove all mouse wheel observers, if they exist..
    goog.events.unlistenByKey(this._mouseWheelListener);
    
    this._mouseWheelHandler = null;
    
  }
  
  if (this._config['MOUSECLICKS_ENABLED']) {
    
    // mouse down
    this._mouseDownListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEDOWN, this.onMouseDown_.bind(this));
    
    // mouse up
    this._mouseUpListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEUP, this.onMouseUp_.bind(this));
    
  } else {
    
    // remove the observer, if it exists..
    // goog.events.unlisten(this._element, goog.events.EventType.MOUSEDOWN);
    goog.events.unlistenByKey(this._mouseDownListener);
    
    // remove the observer, if it exists..
    goog.events.unlistenByKey(this._mouseUpListener);
    
  }
  
  if (!this._config['CONTEXTMENU_ENABLED']) {
    
    // deactivate right-click context menu
    // found no way to use goog.events for that? tried everything..
    // according to http://help.dottoro.com/ljhwjsss.php, this method is
    // compatible with all browsers but opera
    this._element.oncontextmenu = function() {

      return false;
      
    };
    
  } else {
    
    // re-activate right-click context menu
    this._element.oncontextmenu = null;
  }
  
  if (this._config['KEYBOARD_ENABLED']) {
    
    // the google closure way did not work, so let's do it this way..
    window.onkeydown = this.onKey_.bind(this);
    
  } else {
    
    // remove the keyboard observer
    window.onkeydown = null;
    
  }
  
  //
  // we always listen to mouse move events since they are essential for the
  // other events
  // we do make sure, we add them only once
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseMoveListener);
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseOutListener);
  
  // mouse movement inside the element
  this._mouseMoveListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEMOVE, this.onMouseMovementInside_.bind(this));
  
  // mouse movement outside the element
  this._mouseOutListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEOUT, this.onMouseMovementOutside_.bind(this));
  
};


/**
 * Callback for mouse down events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseDown_ = function(event) {

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
  
  eval("this.onMouseDown(" + this._leftButtonDown + "," +
      this._middleButtonDown + "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse down (button press).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseDown = function(left, middle, right) {

  // do nothing
  
};


/**
 * Callback for mouse up events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseUp_ = function(event) {

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
  
  eval("this.onMouseUp(" + this._leftButtonDown + "," + this._middleButtonDown +
      "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Get the current mouse position (offsetX, offsetY) relative to the viewport.
 * 
 * @return {!Array} The mouse position as an array [x,y].
 */
X.interactor.prototype.__defineGetter__('mousePosition', function() {

  return this._mousePosition;
  
});


/**
 * Overload this function to execute code on mouse up (button release).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseUp = function(left, middle, right) {

  // do nothing
  
};


/**
 * Callback for mouse movement events outside the associated DOM element. This
 * resets all internal interactor flags.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseMovementOutside_ = function(event) {

  // reset the click flags
  this._mouseInside = false;
  if (this._config['KEYBOARD_ENABLED']) {
    
    // if we observe the keyboard, remove the observer here
    // this is necessary if there are more than one renderer in the document
    window.onkeydown = null;
    
  }
  
  this._leftButtonDown = false;
  this._middleButtonDown = false;
  this._rightButtonDown = false;
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse movement.
 * 
 * @param {Event} event The browser fired mousemove event.
 */
X.interactor.prototype.onMouseMove = function(event) {

  // do nothing
  
};


/**
 * Callback for mouse movement events inside the associated DOM element. This
 * distinguishes by pressed mouse buttons, key accelerators etc. and fires
 * proper X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseMovementInside_ = function(event) {

  this['mousemoveEvent'] = event; // we need to buffer the event to run eval in
  // advanced compilation
  eval("this.onMouseMove(this['mousemoveEvent'])");
  
  this._mouseInside = true;
  
  if (this._config['KEYBOARD_ENABLED'] && window.onkeydown == null) {
    
    // we re-gained the focus, enable the keyboard observer again!
    window.onkeydown = this.onKey_.bind(this);
    

  }
  
  // prevent any other actions by the browser (f.e. scrolling, selection..)
  event.preventDefault();
  
  // is shift down?
  var shiftDown = event.shiftKey;
  
  // grab the current mouse position
  this._mousePosition = [event.offsetX, event.offsetY];
  var currentMousePosition = new goog.math.Vec2(this._mousePosition[0],
      this._mousePosition[1]);
  
  // get the distance in terms of the last mouse move event
  var distance = this._lastMousePosition.subtract(currentMousePosition);
  
  // save the current mouse position as the last one
  this._lastMousePosition = currentMousePosition.clone();
  
  // 
  // hovering, if enabled..
  //
  if (this._config['HOVERING_ENABLED']) {
    
    if (Math.abs(distance.x) > 0 || Math.abs(distance.y) > 0 ||
        this._middleButtonDown || this._leftButtonDown || this._rightButtonDown) {
      
      // there was some mouse movement, let's cancel the hovering countdown
      this.hoverEnd_();
      
    }
    
    // start the hovering countdown
    // if the mouse does not move for 2 secs, fire the HoverEvent to initiate
    // picking etc.
    this.hoverTrigger = setTimeout(function() {

      this.hoverEnd_();
      
      var e = new X.event.HoverEvent();
      e._x = currentMousePosition.x;
      e._y = currentMousePosition.y;
      
      this.dispatchEvent(e);
      
      // reset the trigger
      this.hoverTrigger = null;
      
    }.bind(this), 300);
    
  }
  
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
    
    // create a new rotate event
    var e = new X.event.RotateEvent();
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._middleButtonDown || (this._leftButtonDown && shiftDown)) {
    //
    // MIDDLE MOUSE BUTTON DOWN or LEFT MOUSE BUTTON AND SHIFT DOWN
    //
    
    // create a new pan event
    var e = new X.event.PanEvent();
    
    // panning in general moves pretty fast, so we threshold the distance
    // additionally
    if (distance.x > 5) {
      
      distance.x = 5;
      
    } else if (distance.x < -5) {
      
      distance.x = -5;
      
    }
    if (distance.y > 5) {
      
      distance.y = 5;
      
    } else if (distance.y < -5) {
      
      distance.y = -5;
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._rightButtonDown) {
    //
    // RIGHT MOUSE BUTTON DOWN
    //
    
    // create a new zoom event
    var e = new X.event.ZoomEvent();
    
    // set the zoom direction
    // true if zooming in, false if zooming out
    e._in = (distance.y > 0);
    
    // with the right click, the zoom will happen rather
    // fine than fast
    e._fast = false;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  }
  
};


/**
 * Stop the hover countdown and fire a X.event.HoverEndEvent.
 *
 * @protected
 */
X.interactor.prototype.hoverEnd_ = function() {

  if (this.hoverTrigger) {
    clearTimeout(this.hoverTrigger);
  }
  
  var e = new X.event.HoverEndEvent();
  this.dispatchEvent(e);
  
};


/**
 * Overload this function to execute code on mouse wheel events.
 * 
 * @param {Event} event The browser fired mousewheel event.
 */
X.interactor.prototype.onMouseWheel = function(event) {

  // do nothing
  
};


/**
 * Internal callback for mouse wheel events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseWheel_ = function(event) {

  this['mouseWheelEvent'] = event;
  eval("this.onMouseWheel(this['mouseWheelEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent any other action (like scrolling..)
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.interactor.prototype.onKey = function(event) {

  // do nothing
  
};


/**
 * Callback for keyboard events on the associated DOM element. This fires proper
 * X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onKey_ = function(event) {

  // only listen to key events if the mouse is inside our element
  // this f.e. enables key event listening for multiple renderers
  if (!this._mouseInside) {
    
    return;
    
  }
  
  this['keyEvent'] = event; // buffering..
  eval("this.onKey(this['keyEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // observe the control keys (shift, alt, ..)
  var alt = event.altKey;
  var ctrl = event.ctrlKey;
  var meta = event.metaKey; // this is f.e. the windows or apple key
  var shift = event.shiftKey;
  
  // get the keyCode
  var keyCode = event.keyCode;
  
  if (keyCode == 82 && !alt && !ctrl && !meta && !shift) {
    
    // 'r' but without any other control keys since we do not want to limit the
    // user to press for example CTRL+R to reload the page
    
    // prevent any other actions..
    event.preventDefault();
    
    // fire the ResetViewEvent
    var e = new X.event.ResetViewEvent();
    this.dispatchEvent(e);
    
  } else if (keyCode >= 37 && keyCode <= 40) {
    
    // keyCode <= 37 and >= 40 means the arrow keys
    
    // prevent any other actions..
    event.preventDefault();
    
    var e = null;
    
    if (shift) {
      
      // create a new pan event
      e = new X.event.PanEvent();
      
    } else if (alt) {
      
      // create a new zoom event
      e = new X.event.ZoomEvent();
      
    } else {
      // create a new rotate event for 3D or a new scroll event for 2D
      e = new X.event.RotateEvent();
      if (this instanceof X.interactor2D) {
        e = new X.event.ScrollEvent();
      }
      
    }
    
    if (!e) {
      
      // should not happen but you never know with key interaction
      return;
      
    }
    
    // create a distance vector
    var distance = new goog.math.Vec2(0, 0);
    
    if (keyCode == 37) {
      // '<-' LEFT
      distance.x = 5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._up = true;
        e._in = true;
        e._fast = false;
      }
      
    } else if (keyCode == 39) {
      // '->' RIGHT
      distance.x = -5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = false;
      }
      
    } else if (keyCode == 38) {
      // '^-' TOP
      distance.y = 5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = true;
        e._fast = true;
      }
      
    } else if (keyCode == 40) {
      // '-v' BOTTOM
      distance.y = -5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = true;
      }
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    
  }
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.interactor', X.interactor);
goog.exportSymbol('X.interactor.prototype.init', X.interactor.prototype.init);
goog.exportSymbol('X.interactor.prototype.onMouseDown',
    X.interactor.prototype.onMouseDown);
goog.exportSymbol('X.interactor.prototype.onMouseUp',
    X.interactor.prototype.onMouseUp);
goog.exportSymbol('X.interactor.prototype.onMouseMove',
    X.interactor.prototype.onMouseMove);
goog.exportSymbol('X.interactor.prototype.onMouseWheel',
    X.interactor.prototype.onMouseWheel);
goog.exportSymbol('X.interactor.prototype.onKey', X.interactor.prototype.onKey);
