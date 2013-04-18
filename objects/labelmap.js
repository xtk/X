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

  /**
   * The pointer to the associated volume.
   *
   * @type {!X.volume}
   * @protected
   */
  this._volume = volume;

  /**
   * The only color to show.
   *
   * @type {!Float32Array}
   * @protected
   */
  this._showOnlyColor = new Float32Array([-255, -255, -255, -255]);

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


/**
 * Show only the label with the given value or color (RGBA 0..1). If null is passed,
 * show all labels.
 *
 * @param {?Array|number} label The label value or label color to show.
 * @throws {Error} If anything goes wrong.
 * @public
 */
X.labelmap.prototype.__defineSetter__('showOnly', function(label) {

  var _color = [-1, -1, -1, -1];

  if (goog.isDefAndNotNull(label)) {

    if (goog.isArray(label) && label.length == 4) {

      // a color was passed, just use it
      _color = label;

    } else {

      // a label value was passed, convert it to a color
      if (!this._colortable) {

        // we do need a colortable
        throw new Error('No colortable assigned.');

      }

      // grab the RGBA color
      _color = this._colortable._map.get(label).slice(1,5);

    }

  }

  // the showOnlyColor is always an integer in the range 0..255 or -255 if no valid color
  this._showOnlyColor = new Float32Array([Math.floor(_color[0]*255),Math.floor(_color[1]*255),Math.floor(_color[2]*255),Math.floor(_color[3]*255)]);

});


// export symbols (required for advanced compilation and in particular the copy
// constructors with duck typing)
goog.exportSymbol('X.labelmap', X.labelmap);
