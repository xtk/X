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

// provides
goog.provide('X.event');
goog.provide('X.event.events');

// events provided
goog.provide('X.event.ComputingEvent');
goog.provide('X.event.ComputingProgressEvent');
goog.provide('X.event.ComputingEndEvent');
goog.provide('X.event.HoverEvent');
goog.provide('X.event.HoverEndEvent');
goog.provide('X.event.ModifiedEvent');
goog.provide('X.event.PanEvent');
goog.provide('X.event.ProgressEvent');
goog.provide('X.event.RenderEvent');
goog.provide('X.event.ResetViewEvent');
goog.provide('X.event.RotateEvent');
goog.provide('X.event.ScrollEvent');
goog.provide('X.event.WindowLevelEvent');
goog.provide('X.event.ZoomEvent');

// requires
goog.require('X');
goog.require('X.object');
goog.require('X.vector');
goog.require('goog.events');
goog.require('goog.events.Event');



/**
 * The super class for all events in XTK.
 * 
 * @constructor
 * @param {string} type A type identifier for this event.
 * @extends goog.events.Event
 */
X.event = function(type) {

  //
  // call the default event constructor
  goog.base(this, type);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._classname = 'event';
  
};
// inherit from goog.events.Event
goog.inherits(X.event, goog.events.Event);


/**
 * Creates a unique event id.
 * 
 * @param {string} id The id.
 * @return {string} A unique id.
 */
X.event.uniqueId = function(id) {

  return goog.events.getUniqueId(id);
  
};

/**
 * The events of this class.
 * 
 * @enum {string}
 */
X.event.events = {
  // the pan event, where the event and focus get moved accordingly
  PAN: X.event.uniqueId('pan'),
  
  // the rotate event, where only the event gets moved
  ROTATE: X.event.uniqueId('rotate'),
  
  // the zoom event, where the event Z coordinate changes
  ZOOM: X.event.uniqueId('zoom'),
  
  // the scroll event
  SCROLL: X.event.uniqueId('scroll'),
  
  // the render event
  RENDER: X.event.uniqueId('render'),
  
  // the reset view event
  RESETVIEW: X.event.uniqueId('resetview'),
  
  // window_level modification event
  WINDOWLEVEL: X.event.uniqueId('windowlevel'),
  
  // the object modified event
  MODIFIED: X.event.uniqueId('modified'),

  // the object remove event
  REMOVE: X.event.uniqueId('remove'),
  
  // the loading progress event
  PROGRESS: X.event.uniqueId('progress'),
  
  // the hover event
  HOVER: X.event.uniqueId('hover'),
  
  // the hover end event
  HOVER_END: X.event.uniqueId('hover_end'),

  // the computing event
  COMPUTING: X.event.uniqueId('computing'),

  // the computing end event
  COMPUTING_END: X.event.uniqueId('computing_end'),

  // the computing progress event
  COMPUTING_PROGRESS: X.event.uniqueId('computing_progress')

};


/**
 * The window/level event to initiate updating a volume's window/level settings.
 * 
 * @constructor
 * @extends X.event
 */
X.event.WindowLevelEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.WINDOWLEVEL);
  
  /**
   * The flag to increase or decrease the window. + to increase, - to decrease.
   * 
   * @type {!number}
   * @protected
   */
  this._window = 0;
  
  /**
   * The flag to increase or decrease the level. + to increase, - to decrease.
   * 
   * @type {!number}
   * @protected
   */
  this._level = 0;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.WindowLevelEvent, X.event);


/**
 * The pan event to initiate moving the event and the focus.
 * 
 * @constructor
 * @extends X.event
 */
X.event.PanEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.PAN);
  
  /**
   * The distance to pan in screen space.
   * 
   * @type {!X.vector}
   * @protected
   */
  this._distance = new X.vector(0, 0, 0);
  
};
// inherit from goog.events.Event
goog.inherits(X.event.PanEvent, X.event);


/**
 * The rotate event to initiate moving the event around the focus.
 * 
 * @constructor
 * @extends X.event
 */
X.event.RotateEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.ROTATE);
  
  /**
   * The distance to pan in screen space.
   * 
   * @type {!X.vector}
   * @protected
   */
  this._distance = new X.vector(0, 0, 0);
  
};
// inherit from goog.events.Event
goog.inherits(X.event.RotateEvent, X.event);


/**
 * The zoom event to initiate zoom in or zoom out.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ZoomEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.ZOOM);
  
  /**
   * The flag for the zooming direction. If TRUE, the zoom operation will move
   * the objects closer to the event. If FALSE, further away from the event.
   * 
   * @type {!boolean}
   * @protected
   */
  this._in = false;
  
  /**
   * The flag for the zooming speed. If TRUE, the zoom operation will happen
   * fast. If FALSE, there will be a fine zoom operation.
   * 
   * @type {!boolean}
   * @protected
   */
  this._fast = false;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ZoomEvent, X.event);


/**
 * The scroll event to initiate scrolling.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ScrollEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.SCROLL);
  
  /**
   * The flag for the scrolling direction. If TRUE, the scroll operation is up.
   * If FALSE, it is down.
   * 
   * @type {!boolean}
   * @protected
   */
  this._up = false;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ScrollEvent, X.event);


/**
 * The render event to update renderer.
 * 
 * @constructor
 * @extends X.event
 */
X.event.RenderEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.RENDER);
  
};
// inherit from goog.events.Event
goog.inherits(X.event.RenderEvent, X.event);


/**
 * The hover event, indicating mouse-over on an X.object.
 * 
 * @constructor
 * @extends X.event
 */
X.event.HoverEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.HOVER);
  
  /**
   * The x coordinate.
   * 
   * @type {!number}
   * @protected
   */
  this._x = 0;
  
  /**
   * The y coordinate.
   * 
   * @type {!number}
   * @protected
   */
  this._y = 0;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.HoverEvent, X.event);


/**
 * The hover end event, indicating the end of the hovering state.
 * 
 * @constructor
 * @extends X.event
 */
X.event.HoverEndEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.HOVER_END);
  
};
// inherit from goog.events.Event
goog.inherits(X.event.HoverEndEvent, X.event);


/**
 * The render event to update renderer.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ResetViewEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.RESETVIEW);
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ResetViewEvent, X.event);


/**
 * The modified event to flag an object as 'dirty'.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ModifiedEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.MODIFIED);
  
  /**
   * The object which was modified.
   * 
   * @type {?X.object}
   * @protected
   */
  this._object = null;
  
  /**
   * A container for an X.base derived instance.
   * 
   * @type{?X.base}
   * @protected
   */
  this._container = null;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ModifiedEvent, X.event);

/**
 * The remove event to flag an object as 'dirty'.
 * 
 * @constructor
 * @extends X.event
 */
X.event.RemoveEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.REMOVE);
  
  /**
   * The object which will bele deleted.
   * 
   * @type {?X.object}
   * @protected
   */
  this._object = null;
  
  /**
   * A container for an X.base derived instance.
   * 
   * @type{?X.base}
   * @protected
   */
  this._container = null;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.RemoveEvent, X.event);


/**
 * This event indicates progress during loading.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ProgressEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.PROGRESS);
  
  /**
   * The progress value.
   * 
   * @type {!number}
   * @protected
   */
  this._value = 0;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ProgressEvent, X.event);


/**
 * This event indicates computing for volume rendering.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ComputingEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.COMPUTING);

  /**
   * The object which is computed.
   * 
   * @type {?X.object}
   * @protected
   */
  this._object = null;
  
};
// inherit from goog.events.Event
goog.inherits(X.event.ComputingEvent, X.event);


/**
 * This event indicates computing progress for volume rendering.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ComputingProgressEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.COMPUTING_PROGRESS);
  
  /**
   * The progress in percent
   * 
   * @type {!number}
   * @protected
   */
  this._value = 0;

};
// inherit from goog.events.Event
goog.inherits(X.event.ComputingProgressEvent, X.event);


/**
 * This event indicates the end of computing for volume rendering.
 * 
 * @constructor
 * @extends X.event
 */
X.event.ComputingEndEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.COMPUTING_END);
  
  /**
   * The object which is computed.
   * 
   * @type {?X.object}
   * @protected
   */
  this._object = null;

};
// inherit from goog.events.Event
goog.inherits(X.event.ComputingEndEvent, X.event);

goog.exportSymbol('X.event.events.PAN', X.event.events.PAN);
goog.exportSymbol('X.event.events.ROTATE', X.event.events.ROTATE);
goog.exportSymbol('X.event.events.ZOOM', X.event.events.ZOOM);
goog.exportSymbol('X.event.events.SCROLL', X.event.events.SCROLL);