/*
 * Zhizhong Liu <zhizhong.liu@loni.ucla.edu>
 * UCLA Laboratory of Neuro Imaging
 * http://www.loni.ucla.edu
 * 
 * Under MIT License: http://www.opensource.org/licenses/mit-license.php
 */

// provides
goog.provide('X.parserDX');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the .DX format.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserDX = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserDX';
  
};
// inherit from X.parser
goog.inherits(X.parserDX, X.parser);


/**
 * @inheritDoc
 */
X.parserDX.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  this._data = data;
  
  var _data = this.scan('uchar', data.byteLength);
  
  // the number of triangles
  var _size = 0;
  
  var _points = new X.triplets(data.byteLength);
  var _triangles = new X.triplets(data.byteLength);
  
  // store the beginning of a byte range
  var _rangeStart = 0;
  var i = 0;
  while (i < _data.length) {
  	
    if (_data[i] == 10) {
    	// line break
    	
        var line = String.fromCharCode.apply(null, _data.subarray(
            _rangeStart, i));
        
        if (!line) {
        	i++;
        	_rangeStart = i;
        	continue;
        }
        
        line = line.replace(/^\s+|\s+$/g, '');
        
        var lineFields = line.split(' ');
	    if (lineFields[0] == 'object') {
	  	   this.parseObject(_points, _triangles, _data, _rangeStart, i);
	    }
        
        _rangeStart = i + 1;
    	
    }
    
    i++;
  }
  
  // window.console.log("points=" + _points.count + " triangles=" + _triangles.count);

  var p = object._points = new X.triplets(data.byteLength);
  var n = object._normals = new X.triplets(data.byteLength);
  
  for (i = 0; i < _triangles.count; i++) {
  	var tri = _triangles.get(i);
  	var p1 = _points.get(tri[0]);
  	var p2 = _points.get(tri[1]);
  	var p3 = _points.get(tri[2]);
  	p.add(p1[0], p1[1], p1[2]);
  	p.add(p2[0], p2[1], p2[2]);
  	p.add(p3[0], p3[1], p3[2]);
  	
  	// find normal
  	var ux = p2[0] - p1[0];
  	var uy = p2[1] - p1[1];
  	var uz = p2[2] - p1[2];
  	var vx = p3[0] - p1[0];
  	var vy = p3[1] - p1[1];
  	var vz = p3[2] - p1[2];
  	var cx = uy*vz - uz*vy;
  	var cy = uz*vx - ux*vz;
  	var cz = ux*vy - uy*vx;
  	var dist = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2) + Math.pow(cz, 2));
  	var nx = cx/dist;
  	var ny = cy/dist;
  	var nz = cz/dist;
  	n.add(nx, ny, nz);
  	n.add(nx, ny, nz);
  	n.add(nx, ny, nz);
  }
  
  X.TIMERSTOP(this._classname + '.parse');
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Parses a line of .DX data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!Uint8Array} data The data to parse.
 * @param {!number} rangeStart The start of current range 
 * @param {!number} index The index of the current line.
 * @protected
 */
X.parserDX.prototype.parseObject = function(p, t, data, rangeStart, index) {

  // grab the current line
  var line = String.fromCharCode.apply(null, data.subarray(rangeStart, index))
  	.replace(/^\s+|\s+$/g, '');
        
  // read first line
  var lineFields = line.split(' ');
  var size = 0;
  var type = null;
  
  for (var i = 0; i < lineFields.length; i++) {
  	var field = lineFields[i];
  	if (field == 'type') {
  		i++;
  		type = lineFields[i];
  	} else if (field == 'items') {
  		i++;
  		size = parseInt(lineFields[i]);
  	} else if (field == 'shape') {
  		i++;
  		var value = lineFields[i];
  		if (value != '3')  {
  			return;
  		}
  	}
  }
  
  if (size == 0 || type == null) {
  	return;
  }
  
  var objectArray = new X.triplets(size * 3);
  
  index ++;
  rangeStart = index;
  // read contents
  var count = 0;
  while (index < data.length) {
  	if (data[index] == 10) {
    	// line break
    	
        line = String.fromCharCode.apply(null, data.subarray(rangeStart, index));
        
        if (!line) {
        	index++;
        	rangeStart = i;
        	continue;
        }
        
        line = line.replace(/^\s+|\s+$/g, '');
        lineFields = line.split(' ');
	    
	 	if (type == 'float') {
		    var x = parseFloat(lineFields[0]);
		    var y = parseFloat(lineFields[1]);
		    var z = parseFloat(lineFields[2]);
	 		var id = objectArray.add(x, y, z);
	 	} else if (type == 'int') {
		    var x = parseInt(lineFields[0]);
		    var y = parseInt(lineFields[1]);
		    var z = parseInt(lineFields[2]);
	 		var id = objectArray.add(x, y, z);
	 	}
	 	count++;
        rangeStart = index + 1;
    }
    index++;
    if (count >= size) {
    	// finished all contents
    	break;
    }
  }
  
  // read footers
  while (index < data.length) {
  	if (data[index] == 10) {
    	
        line = String.fromCharCode.apply(null, data.subarray(rangeStart, index));
        
        if (!line) {
        	index++;
        	rangeStart = i;
        	return;
        }
        
        line = line.replace(/^\s+|\s+$/g, '');
        if (line.indexOf("\"dep\"") != -1 && line.indexOf("\"positions\"") != -1) {
		  	// points
		   for (var i = 0; i < objectArray.count; i++) {
		     var arr = objectArray.get(i);
		     p.add(arr[0], arr[1], arr[2]);
		   }
           index++;
           rangeStart = i;
		   return;
		} else if (line.indexOf("\"dep\"") != -1 && line.indexOf("\"connections\"") != -1) {
		  	// triangles
		  	for (var i = 0; i < objectArray.count; i++) {
		  	  var arr = objectArray.get(i);
		  	  t.add(arr[0], arr[1], arr[2]);
		  	}
        	index++;
        	rangeStart = i;
		  	return;
		}
        rangeStart = index + 1;
     }
     
     index++;
  }
  
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserDX', X.parserDX);
goog.exportSymbol('X.parserDX.prototype.parse', X.parserDX.prototype.parse);
