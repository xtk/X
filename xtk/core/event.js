/*
 * ${HEADER}
 */

// provides
goog.provide('X.event');
goog.provide('X.event.events');

// functions provided
goog.provide('X.event.ZoomEvent');
goog.provide('X.event.RotateEvent');
goog.provide('X.event.PanEvent');
goog.provide('X.event.RenderEvent');

// requires
goog.require('X');
goog.require('goog.events');
goog.require('goog.events.Event');



/**
 * The superclass class for all events in XTK.
 *
 * @constructor
 * @param {string} type A type identifier for this event.
 * @extends {goog.events.Event}
 */
X.event = function(type) {

  //
  // call the default event constructor
  goog.base(this, type);

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

  // update the renderer
  RENDER: X.event.uniqueId('render')
};

/**
 * The pan event to initiate moving the event and the focus.
 *
 * @constructor
 * @extends {X.event}
 */
X.event.PanEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.PAN);

  /**
   * The distance to pan in screen space.
   *
   * @type {?goog.math.Vec2}
   * @protected
   */
  this._distance = null;

};
// inherit from goog.events.Event
goog.inherits(X.event.PanEvent, X.event);

/**
 * The rotate event to initiate moving the event around the focus.
 *
 * @constructor
 * @extends {X.event}
 */
X.event.RotateEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.ROTATE);

  /**
   * The distance to pan in screen space.
   *
   * @type {?goog.math.Vec2}
   * @protected
   */
  this._distance = null;

  /**
   * The angle in degrees to pan around the last mouse position in screen space.
   *
   * @type {!number}
   * @protected
   */
  this._angle = 0;

};
// inherit from goog.events.Event
goog.inherits(X.event.RotateEvent, X.event);

/**
 * The zoom event to initiate zoom in or zoom out.
 *
 * @constructor
 * @extends {X.event}
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
 * The render event to update renderer.
 *
 * @constructor
 * @extends {X.event}
 */
X.event.RenderEvent = function() {

  // call the default event constructor
  goog.base(this, X.event.events.RENDER);
  
  /**
   * The timestamp of this render event.
   *
   * @type {!number}
   */
  this._timestamp = Date.now();
};
// inherit from goog.events.Event
goog.inherits(X.event.RenderEvent, X.event);

// export symbols (required for advanced compilation)
goog.exportSymbol('X.event', X.event);
goog.exportSymbol('X.event.events', X.event.events);
goog.exportSymbol('X.event.uniqueId', X.event.uniqueId);

// events
goog.exportSymbol('X.event.prototype.PanEvent', X.event.prototype.PanEvent);
goog.exportSymbol('X.event.prototype.RotateEvent', X.event.prototype.RotateEvent);
goog.exportSymbol('X.event.prototype.ZoomEvent', X.event.prototype.ZoomEvent);
goog.exportSymbol('X.event.prototype.RenderEvent', X.event.prototype.RenderEvent);
