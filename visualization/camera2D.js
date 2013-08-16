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
goog.provide('X.camera2D');

// requires
goog.require('X.camera');
goog.require('X.event.WindowLevelEvent');


/**
 * Create a 2D camera.
 * 
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends X.camera
 */
X.camera2D = function(width, height) {

  //
  // call the standard constructor of X.base
  goog.base(this, width, height);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'camera2D';
  
};
// inherit from X.base
goog.inherits(X.camera2D, X.camera);


/**
 * @inheritDoc
 */
X.camera2D.prototype.rotate = function(distance) {

  // call the superclass
  distance = goog.base(this, 'rotate', distance);
  
  // create a new event
  var _e = new X.event.WindowLevelEvent();
  
  if (distance.x > 0) {
    
    // shrink window
    _e._window--;
    
  } else if (distance.x < 0) {
    
    // expand window
    _e._window++;
    
  }
  
  if (distance.y > 0) {
    
    // increase level
    _e._level++;
    
  } else if (distance.y < 0) {
    
    // decrease level
    _e._level--;
    
  }
  
  // fire it up
  this.dispatchEvent(_e);
  
};

/**
 * @inheritDoc
 */
X.camera2D.prototype.zoomIn = function(fast) {

  var zoomStep = 20;

  if (goog.isDefAndNotNull(fast) && !fast) {

  zoomStep = .02;

  }

  this._view[14] += zoomStep;

};


/**
 * @inheritDoc
 */
X.camera2D.prototype.zoomOut = function(fast) {

  var zoomStep = 20;

  if (goog.isDefAndNotNull(fast) && !fast) {

    zoomStep = .02;

  }

  this._view[14] -= zoomStep;

};

/**
 * @inheritDoc
 */
X.camera2D.prototype.pan = function(distance) {

  if (goog.isArray(distance) && (distance.length == 2)) {

    distance = new X.vector(distance[0], distance[1], 0);

  } else if (!(distance instanceof X.vector)) {

    throw new Error('Invalid distance vector for pan operation.');

  }

  // take spacing into account?
  this._view[12] -= distance.x/this._view[14];
  this._view[13] += distance.y/this._view[14];

};