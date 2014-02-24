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
goog.provide('X.parserOFF');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the .OFF format.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserOFF = function() {

    //
    // call the standard constructor of X.base
    goog.base(this);

    //
    // class attributes

    /**
     * @inheritDoc
     * @const
     */
    this._classname = 'parserOFF';

};
// inherit from X.parser
goog.inherits(X.parserOFF, X.parser);


/**
 * @inheritDoc
 */
X.parserOFF.prototype.parse = function(container, object, data, flag) {

    X.TIMER(this._classname + '.parse');

    this._data = data;
    var _length = data.byteLength;
    var byteData = this.scan('uchar', _length);

    // allocate memory using a good guess
    var _pts = [];
    object._points = new X.triplets(_length);
    object._normals = new X.triplets(_length);
    var p = object._points;
    var n = object._normals;

    var _position = 0;
    var _self = this;
    function readLine() {
        if (_position === _length) {
            throw new Error("End of file reached unexpectedly.")
        }
        for (var i = _position; i < _length; ++i) {
            if (byteData[i] === 10) { // line break
                var line = _self.parseChars(byteData, _position, i);
                _position = i + 1;
                return line;
            }
        }
        _position = _length;
        return _self.parseChars(byteData, _position, _length - 1);
    }

    var _firstLine = readLine();
    var _numbersLine = _firstLine === "OFF" ? readLine() : _firstLine;
    var _split = _numbersLine.split(' ');
    var _nVertices = _split[0];
    var _nFaces = _split[1];

    while (_nVertices--) {
        var line = readLine();
        var coords = line.split(' ');
        // grab the x, y, z coordinates
        var x = parseFloat(coords[0]);
        var y = parseFloat(coords[1]);
        var z = parseFloat(coords[2]);
        _pts.push([x, y, z]);
    }

    while (_nFaces--) {
        var line = readLine();
        var coords = line.split(' ');

        // assumes all points have been read
        var p1 = _pts[parseInt(coords[1], 10)];
        var p2 = _pts[parseInt(coords[2], 10)];
        var p3 = _pts[parseInt(coords[3], 10)];

        p.add(p1[0], p1[1], p1[2]);
        p.add(p2[0], p2[1], p2[2]);
        p.add(p3[0], p3[1], p3[2]);

        // calculate normal
        var v1 = new goog.math.Vec3(p1[0], p1[1], p1[2]);
        var v2 = new goog.math.Vec3(p2[0], p2[1], p2[2]);
        var v3 = new goog.math.Vec3(p3[0], p3[1], p3[2]);
        var norm = goog.math.Vec3.cross(v2.subtract(v1), v3.subtract(v1));
        norm.normalize();
        n.add(norm.x, norm.y, norm.z);
        n.add(norm.x, norm.y, norm.z);
        n.add(norm.x, norm.y, norm.z);
    }

    X.TIMERSTOP(this._classname + '.parse');

    // the object should be set up here, so let's fire a modified event
    var modifiedEvent = new X.event.ModifiedEvent();
    modifiedEvent._object = object;
    modifiedEvent._container = container;
    this.dispatchEvent(modifiedEvent);

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserOFF', X.parserOFF);
goog.exportSymbol('X.parserOFF.prototype.parse', X.parserOFF.prototype.parse);
