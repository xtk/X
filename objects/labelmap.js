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
goog.provide('X.labelmap');

// requires
goog.require('X.volume');



/**
 * Pseudo-class for a X.labelmap which derives from X.volume and is used to
 * distinguish between a volume and a label map. An X.labelmap will never be
 * rendered separately - but an X.volume object can be used to display solely a
 * label map.
 * 
 * @constructor
 * @extends X.volume
 */
X.labelmap = function(volume) {

  //
  // call the standard constructor of X.volume
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'labelmap';
  
  this._volume = volume;
  
};
// inherit from X.volume
goog.inherits(X.labelmap, X.volume);


/**
 * Re-show the slices or re-activate the volume rendering for this volume.
 * 
 * @inheritDoc
 */
X.labelmap.prototype.modified = function() {

  // .. and fire our own modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = this;
  this.dispatchEvent(modifiedEvent);
  
  // call the X.volumes' modified method
  this._volume.modified();
  
};


// export symbols (required for advanced compilation and in particular the copy
// constructors with duck typing)
goog.exportSymbol('X.labelmap', X.labelmap);
