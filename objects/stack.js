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
goog.provide('X.stack');

// requires
goog.require('X.volume');



/**
 * Stack representation based on an X.volume.
 * 
 * @constructor
 * @extends X.volume
 */
X.stack = function(volume) {

  //
  // call the standard constructor of X.volume
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'stack';
  
  this._rLowerThreshold = 0.0;
  this._gLowerThreshold = 0.0;
  this._bLowerThreshold = 0.0;
  this._rUpperThreshold = 1.0;
  this._gUpperThreshold = 1.0;
  this._bUpperThreshold = 1.0;
  
};
// inherit from X.volume
goog.inherits(X.stack, X.volume);

/**
 * Set the lower red channel threshold of this stack.
 * 
 * @param {!number} rLowerThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('rLowerThreshold',
    function(rLowerThreshold) {

      this._rLowerThreshold = rLowerThreshold;
      
    });


/**
 * Get the lower red channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('rLowerThreshold', function() {

  return this._rLowerThreshold;
  
});

/**
 * Set the lower green channel threshold of this stack.
 * 
 * @param {!number} gLowerThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('gLowerThreshold',
    function(gLowerThreshold) {

      this._gLowerThreshold = gLowerThreshold;
      
    });


/**
 * Get the lower green channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('gLowerThreshold', function() {

  return this._gLowerThreshold;
  
});

/**
 * Set the lower blue channel threshold of this stack.
 * 
 * @param {!number} bLowerThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('bLowerThreshold',
    function(bLowerThreshold) {

      this._bLowerThreshold = bLowerThreshold;
      
    });


/**
 * Get the lower blue channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('bLowerThreshold', function() {

  return this._bLowerThreshold;
  
});


/**
 * Set the upper red channel threshold of this stack.
 * 
 * @param {!number} rUpperThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('rUpperThreshold',
    function(rUpperThreshold) {

      this._rUpperThreshold = rUpperThreshold;
      
    });


/**
 * Get the upper red channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('rUpperThreshold', function() {

  return this._rUpperThreshold;
  
});

/**
 * Set the upper green channel threshold of this stack.
 * 
 * @param {!number} gUpperThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('gUpperThreshold',
    function(gUpperThreshold) {

      this._gUpperThreshold = gUpperThreshold;
      
    });


/**
 * Get the upper green channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('gUpperThreshold', function() {

  return this._gUpperThreshold;
  
});

/**
 * Set the upper blue channel threshold of this stack.
 * 
 * @param {!number} bUpperThreshold The threshold.
 * @public
 */
X.stack.prototype.__defineSetter__('bUpperThreshold',
    function(bUpperThreshold) {

      this._bUpperThreshold = bUpperThreshold;
      
    });


/**
 * Get the upper blue channel threshold of this stack.
 * 
 * @public
 */
X.stack.prototype.__defineGetter__('bUpperThreshold', function() {

  return this._bUpperThreshold;
  
});

// export symbols (required for advanced compilation and in particular the copy
// constructors with duck typing)
goog.exportSymbol('X.stack', X.stack);
