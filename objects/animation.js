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
goog.require('X.renderer3D');



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
   * @protected
   */
  this._active = true;
  
  /**
   * The internal index of the currently shown object.
   * 
   * @type {!number}
   * @protected
   */
  this._currentObject = 0;
  
  /**
   * The number of painted frames.
   * 
   * @type {!number}
   * @protected
   */
  this._framecount = 0;
  
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


/**
 * Perform the animation by showing/hiding
 * the attached objects sequentially.
 * 
 * @param {!X.renderer3D} renderer3d The 3D renderer holding the animation.
 * @protected
 */
X.animation.prototype.animate = function(renderer3d) {
  
  this._framecount++;  
  
  // check if we hit the speed threshold
  if (this._framecount == this._speed) {
    
    // if yes, do the animation (show/hide)
    // but only if we are active here
    if (!this._active) {
      
      // inactive, so jump out
      return;
      
    }
    
    if (this._currentObject >= 1) {
      
      // hide the previous object
      this._children[this._currentObject - 1].Ha = false;
      
    }
    
    // start from the beginning if the animation loop is completed
    if (this._currentObject > this._children.length - 1) {
      
      this._currentObject = 0;
      
    }
    
    var _object = this._children[this._currentObject]; 
    
    // but first check if we have to re-orient a X.volume
    if (_object instanceof X.volume) {
      
      // this is a X.volume so re-orient it
      renderer3d.orientVolume_(_object);
      
    }
    
    // show the current object
    _object._visible = true;
    
    // increase the internal index
    this._currentObject++;
    
    // reset the frame counter
    this._framecount = 0;
    
  }
    
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.animation', X.animation);
goog.exportSymbol('X.animation.prototype.add', X.animation.prototype.add);
