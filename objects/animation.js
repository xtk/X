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
goog.provide('X.animation');

// requires
goog.require('X.object');



/**
 * Create an animation container. Animations can hold different X.objects and
 * can run using a specified speed.
 * 
 * @constructor
 * @extends X.object
 */
X.animation = function() {

  //
  // call the standard constructor of X.object
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'animation';

  /**
   * The speed of the animation in FPS.
   * 
   * @type {!number}
   * @protected
   */
  this._speed = 100;
  
  /**
   * The flag indicating a running or paused animation.
   * 
   * @type {!boolean}
   */
  this._active = true;
  
};
// inherit from X.object
goog.inherits(X.animation, X.object);


/**
 * Add an X.object (or X.volume, X.mesh, X.fibers)
 * to this animation.
 * 
 * @param {!X.object} object The object to add.
 * @public
 */
X.animation.prototype.add = function(object) {
  
  this._children.push(object);
  
};


X.animation.prototype.animate_ = function() {
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.animation', X.animation);
goog.exportSymbol('X.animation.prototype.add', X.animation.prototype.add);
