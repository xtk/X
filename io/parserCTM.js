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
goog.provide('X.parserCTM');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the .CTM format
 * 
 * @constructor
 * @extends X.parser
 */
X.parserCTM = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserCTM';
  
};
// inherit from X.parser
goog.inherits(X.parserCTM, X.parser);


/**
 * @inheritDoc
 */
X.parserCTM.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var stream = new X.parserCTM.Stream(data);
  var file = new X.parserCTM.File(stream);
  var numberOfTriangles = file.header.triangleCount;
  var numberOfVertices = file.header.vertexCount;
  var indexCounter = new Uint32Array(numberOfVertices);
  var _indices = file.body.indices;
  var _vertices = file.body.vertices;
    // we count the appearance of indices to be able to average the normals
  var indexCounter = new Uint32Array(numberOfVertices);
  
  // buffer the normals since we need to calculate them in a second loop
  var normals = new Float32Array(numberOfTriangles * 9);

  object._points = new X.triplets(numberOfTriangles*9);
  object._normals = new X.triplets(numberOfTriangles*9);
  object._triangleCount = numberOfTriangles;

  var p = object._points
  var n = object._normals
  var ind = object._pointIndices;

  var has_normals = false;
  if (file.body.normals) {
    has_normals = true;
    object._normals = n;
  }
  object._points = file.body.vertices;
  object._pointIndices = file.body.indices;
  var i = 0;
  if (has_normals) {
    for (i = 0; i < (numberOfTriangles*9-2); i+= 3) {
      n.add(file.body.normals[i], file.body.normals[i+1], file.body.normals[i+2]);
      p.add(file.body.vertices[i], file.body.vertices[i+1], file.body.vertices[i+2]);
    }
  } else {
    // first loop through the indices
    var t;
    for (t = 0; t < numberOfTriangles; t++) {
      
      var i = t * 3;
      
      // grab the three indices which define a triangle
      var index1 = _indices[i];
      var index2 = _indices[i + 1];
      var index3 = _indices[i + 2];
      
      // store the ordered vertex indices
      ind.push(index1);
      ind.push(index2);
      ind.push(index3);
      
      // count the use of the indices
      indexCounter[index1] += 1;
      indexCounter[index2] += 1;
      indexCounter[index3] += 1;
      
      // grab the 3 corresponding vertices with each x,y,z coordinates
      var _index1 = index1 * 3;
      var _index2 = index2 * 3;
      var _index3 = index3 * 3;
      var v1x = _vertices[_index1];
      var v1y = _vertices[_index1 + 1];
      var v1z = _vertices[_index1 + 2];
      var v2x = _vertices[_index2];
      var v2y = _vertices[_index2 + 1];
      var v2z = _vertices[_index2 + 2];
      var v3x = _vertices[_index3];
      var v3y = _vertices[_index3 + 1];
      var v3z = _vertices[_index3 + 2];
      
      // add the points
      p.add(v1x, v1y, v1z);
      p.add(v2x, v2y, v2z);
      p.add(v3x, v3y, v3z);
      
      //
      // compute the normals
      var v1v = new goog.math.Vec3(v1x, v1y, v1z);
      var v2v = new goog.math.Vec3(v2x, v2y, v2z);
      var v3v = new goog.math.Vec3(v3x, v3y, v3z);
      
      var n1 = v2v.clone().subtract(v1v);
      var n2 = v3v.clone().subtract(v1v);
      
      var normal = goog.math.Vec3.cross(n1, n2).normalize();
      
      // store them
      normals[_index1] += normal.x;
      normals[_index1 + 1] += normal.y;
      normals[_index1 + 2] += normal.z;
      normals[_index2] += normal.x;
      normals[_index2 + 1] += normal.y;
      normals[_index2 + 2] += normal.z;
      normals[_index3] += normal.x;
      normals[_index3 + 1] += normal.y;
      normals[_index3 + 2] += normal.z;
      
    }
  }

  object._points = p;
  if (has_normals) {
    object._normals = n;
  } else {
    // second loop through the indices
    // this loop is required since we need to average the normals and only now
    // know how often an index was used
    for (t = 0; t < numberOfTriangles; t++) {
      
      var i = t * 3;
      
      // grab the three indices which define a triangle
      var index1 = _indices[i];
      var index2 = _indices[i + 1];
      var index3 = _indices[i + 2];
      
      // grab the normals for this triangle
      var _index1 = index1 * 3;
      var _index2 = index2 * 3;
      var _index3 = index3 * 3;
      
      var n1x = normals[_index1];
      var n1y = normals[_index1 + 1];
      var n1z = normals[_index1 + 2];
      
      var n2x = normals[_index2];
      var n2y = normals[_index2 + 1];
      var n2z = normals[_index2 + 2];
      
      var n3x = normals[_index3];
      var n3y = normals[_index3 + 1];
      var n3z = normals[_index3 + 2];
      
      // convert the normals to vectors
      var n1v = new goog.math.Vec3(n1x, n1y, n1z);
      var n2v = new goog.math.Vec3(n2x, n2y, n2z);
      var n3v = new goog.math.Vec3(n3x, n3y, n3z);
      
      // transform triangle normals to vertex normals
      var normal1 = n1v.scale(1 / indexCounter[index1]).normalize();
      var normal2 = n2v.scale(1 / indexCounter[index2]).normalize();
      var normal3 = n3v.scale(1 / indexCounter[index3]).normalize();
      
      // .. add'em
      n.add(normal1.x, normal1.y, normal1.z);
      n.add(normal2.x, normal2.y, normal2.z);
      n.add(normal3.x, normal3.y, normal3.z);
      
    }
  }
  
  // .. and set the objectType to triangles
  object._type = X.displayable.types.TRIANGLES;

  object._pointIndices = ind;

  X.TIMERSTOP(this._classname + '.parse');
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

/**
 * Parses .CTM data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!number} triangleCount The number of triangles.
 */


var CTM = CTM || {};

X.parserCTM.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

X.parserCTM.Flags = {
  NORMALS: 0x00000001
};

X.parserCTM.File = function(stream){
  this.load(stream);
};

X.parserCTM.File.prototype.load = function(stream){
  this.header = new X.parserCTM.FileHeader(stream);

  this.body = new X.parserCTM.FileBody(this.header);
  
  this.getReader().read(stream, this.body);
};

X.parserCTM.File.prototype.getReader = function(){
  var reader;

  switch(this.header.compressionMethod){
    case X.parserCTM.CompressionMethod.RAW:
      reader = new X.parserCTM.ReaderRAW();
      break;
    case X.parserCTM.CompressionMethod.MG1:
      reader = new X.parserCTM.ReaderMG1();
      break;
    case X.parserCTM.CompressionMethod.MG2:
      reader = new X.parserCTM.ReaderMG2();
      break;
  }

  return reader;
};

X.parserCTM.FileHeader = function(stream){
  stream.readInt32(); //magic "OCTM"
  this.fileFormat = stream.readInt32();
  this.compressionMethod = stream.readInt32();
  this.vertexCount = stream.readInt32();
  this.triangleCount = stream.readInt32();
  this.uvMapCount = stream.readInt32();
  this.attrMapCount = stream.readInt32();
  this.flags = stream.readInt32();
  this.comment = stream.readString();
};

X.parserCTM.FileHeader.prototype.hasNormals = function(){
  return this.flags & X.parserCTM.Flags.NORMALS;
};

X.parserCTM.FileBody = function(header){
  var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals()? header.vertexCount * 3: 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

  var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

  this.indices = new Uint32Array(data, 0, i);

  this.vertices = new Float32Array(data, i * 4, v);

  if ( header.hasNormals() ){
    this.normals = new Float32Array(data, (i + v) * 4, n);
  }
  
  if (header.uvMapCount){
    this.uvMaps = [];
    for (j = 0; j < header.uvMapCount; ++ j){
      this.uvMaps[j] = {uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
    }
  }
  
  if (header.attrMapCount){
    this.attrMaps = [];
    for (j = 0; j < header.attrMapCount; ++ j){
      this.attrMaps[j] = {attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
    }
  }
};

X.parserCTM.FileMG2Header = function(stream){
  stream.readInt32(); //magic "MG2H"
  this.vertexPrecision = stream.readFloat32();
  this.normalPrecision = stream.readFloat32();
  this.lowerBoundx = stream.readFloat32();
  this.lowerBoundy = stream.readFloat32();
  this.lowerBoundz = stream.readFloat32();
  this.higherBoundx = stream.readFloat32();
  this.higherBoundy = stream.readFloat32();
  this.higherBoundz = stream.readFloat32();
  this.divx = stream.readInt32();
  this.divy = stream.readInt32();
  this.divz = stream.readInt32();
  
  this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
  this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
  this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

X.parserCTM.ReaderRAW = function(){
};

X.parserCTM.ReaderRAW.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);
  
  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

X.parserCTM.ReaderRAW.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readArrayInt32(indices);
};

X.parserCTM.ReaderRAW.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readArrayFloat32(vertices);
};

X.parserCTM.ReaderRAW.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readArrayFloat32(normals);
};

X.parserCTM.ReaderRAW.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    stream.readArrayFloat32(uvMaps[i].uv);
  }
};

X.parserCTM.ReaderRAW.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    stream.readArrayFloat32(attrMaps[i].attr);
  }
};

X.parserCTM.ReaderMG1 = function(){
};

X.parserCTM.ReaderMG1.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);
  
  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

X.parserCTM.ReaderMG1.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size
  
  var interleaved = new X.parserCTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  X.parserCTM.restoreIndices(indices, indices.length);
};

X.parserCTM.ReaderMG1.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size
  
  var interleaved = new X.parserCTM.InterleavedStream(vertices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

X.parserCTM.ReaderMG1.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new X.parserCTM.InterleavedStream(normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

X.parserCTM.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new X.parserCTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

X.parserCTM.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new X.parserCTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

X.parserCTM.ReaderMG2 = function(){
};

X.parserCTM.ReaderMG2.prototype.read = function(stream, body){
  this.MG2Header = new X.parserCTM.FileMG2Header(stream);
  
  this.readVertices(stream, body.vertices);
  this.readIndices(stream, body.indices);
  
  if (body.normals){
    this.readNormals(stream, body);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

X.parserCTM.ReaderMG2.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size

  var interleaved = new X.parserCTM.InterleavedStream(vertices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
  var gridIndices = this.readGridIndices(stream, vertices);
  
  X.parserCTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

X.parserCTM.ReaderMG2.prototype.readGridIndices = function(stream, vertices){
  stream.readInt32(); //magic "GIDX"
  stream.readInt32(); //packed size
  
  var gridIndices = new Uint32Array(vertices.length / 3);
  
  var interleaved = new X.parserCTM.InterleavedStream(gridIndices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
  X.parserCTM.restoreGridIndices(gridIndices, gridIndices.length);
  
  return gridIndices;
};

X.parserCTM.ReaderMG2.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size

  var interleaved = new X.parserCTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  X.parserCTM.restoreIndices(indices, indices.length);
};

X.parserCTM.ReaderMG2.prototype.readNormals = function(stream, body){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new X.parserCTM.InterleavedStream(body.normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  var smooth = X.parserCTM.calcSmoothNormals(body.indices, body.vertices);

  X.parserCTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

X.parserCTM.ReaderMG2.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    
    var precision = stream.readFloat32();
    
    stream.readInt32(); //packed size

    var interleaved = new X.parserCTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
    X.parserCTM.restoreMap(uvMaps[i].uv, 2, precision);
  }
};

X.parserCTM.ReaderMG2.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    
    var precision = stream.readFloat32();
    
    stream.readInt32(); //packed size

    var interleaved = new X.parserCTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
    X.parserCTM.restoreMap(attrMaps[i].attr, 4, precision);
  }
};

X.parserCTM.restoreIndices = function(indices, len){
  var i = 3;
  if (len > 0){
    indices[2] += indices[0];
  }
  for (; i < len; i += 3){
    indices[i] += indices[i - 3];
    
    if (indices[i] === indices[i - 3]){
      indices[i + 1] += indices[i - 2];
    }else{
      indices[i + 1] += indices[i];
    }

    indices[i + 2] += indices[i];
  }
};

X.parserCTM.restoreGridIndices = function(gridIndices, len){
  var i = 1;
  for (; i < len; ++ i){
    gridIndices[i] += gridIndices[i - 1];
  }
};

X.parserCTM.restoreVertices = function(vertices, grid, gridIndices, precision){
  var gridIdx, delta, x, y, z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx, zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff, prevDelta = 0,
      i = 0, j = 0, len = gridIndices.length;

  for (; i < len; j += 3){
    x = gridIdx = gridIndices[i ++];
    
    z = ~~(x / zdiv);
    x -= ~~(z * zdiv);
    y = ~~(x / ydiv);
    x -= ~~(y * ydiv);

    delta = intVertices[j];
    if (gridIdx === prevGridIdx){
      delta += prevDelta;
    }

    vertices[j]     = grid.lowerBoundx +
      x * grid.sizex + precision * delta;
    vertices[j + 1] = grid.lowerBoundy +
      y * grid.sizey + precision * intVertices[j + 1];
    vertices[j + 2] = grid.lowerBoundz +
      z * grid.sizez + precision * intVertices[j + 2];

    prevGridIdx = gridIdx;
    prevDelta = delta;
  }
};

X.parserCTM.restoreNormals = function(normals, smooth, precision){
  var ro, phi, theta, sinPhi,
      nx, ny, nz, by, bz, len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0, k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

  for (; i < k; i += 3){
    ro = intNormals[i] * precision;
    phi = intNormals[i + 1];

    if (phi === 0){
      normals[i]     = smooth[i]     * ro;
      normals[i + 1] = smooth[i + 1] * ro;
      normals[i + 2] = smooth[i + 2] * ro;
    }else{
      
      if (phi <= 4){
        theta = (intNormals[i + 2] - 2) * PI_DIV_2;
      }else{
        theta = ( (intNormals[i + 2] * 4 / phi) - 2) * PI_DIV_2;
      }
      
      phi *= precision * PI_DIV_2;
      sinPhi = ro * Math.sin(phi);

      nx = sinPhi * Math.cos(theta);
      ny = sinPhi * Math.sin(theta);
      nz = ro * Math.cos(phi);

      bz = smooth[i + 1];
      by = smooth[i] - smooth[i + 2];

      len = Math.sqrt(2 * bz * bz + by * by);
      if (len > 1e-20){
        by /= len;
        bz /= len;
      }

      normals[i]     = smooth[i]     * nz +
        (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
      normals[i + 1] = smooth[i + 1] * nz -
        (smooth[i + 2]      + smooth[i]   ) * bz  * ny + by * nx;
      normals[i + 2] = smooth[i + 2] * nz +
        (smooth[i]     * by + smooth[i + 1] * bz) * ny + bz * nx;
    }
  }
};

X.parserCTM.restoreMap = function(map, count, precision){
  var delta, value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0, j, len = map.length;

  for (; i < count; ++ i){
    delta = 0;

    for (j = i; j < len; j += count){
      value = intMap[j];
      
      delta += value & 1? -( (value + 1) >> 1): value >> 1;
      
      map[j] = delta * precision;
    }
  }
};

X.parserCTM.calcSmoothNormals = function(indices, vertices){
  var smooth = new Float32Array(vertices.length),
      indx, indy, indz, nx, ny, nz,
      v1x, v1y, v1z, v2x, v2y, v2z, len,
      i, k;

  for (i = 0, k = indices.length; i < k;){
    indx = indices[i ++] * 3;
    indy = indices[i ++] * 3;
    indz = indices[i ++] * 3;

    v1x = vertices[indy]     - vertices[indx];
    v2x = vertices[indz]     - vertices[indx];
    v1y = vertices[indy + 1] - vertices[indx + 1];
    v2y = vertices[indz + 1] - vertices[indx + 1];
    v1z = vertices[indy + 2] - vertices[indx + 2];
    v2z = vertices[indz + 2] - vertices[indx + 2];
    
    nx = v1y * v2z - v1z * v2y;
    ny = v1z * v2x - v1x * v2z;
    nz = v1x * v2y - v1y * v2x;
    
    len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-10){
      nx /= len;
      ny /= len;
      nz /= len;
    }
    
    smooth[indx]     += nx;
    smooth[indx + 1] += ny;
    smooth[indx + 2] += nz;
    smooth[indy]     += nx;
    smooth[indy + 1] += ny;
    smooth[indy + 2] += nz;
    smooth[indz]     += nx;
    smooth[indz + 1] += ny;
    smooth[indz + 2] += nz;
  }

  for (i = 0, k = smooth.length; i < k; i += 3){
    len = Math.sqrt(smooth[i] * smooth[i] + 
      smooth[i + 1] * smooth[i + 1] +
      smooth[i + 2] * smooth[i + 2]);

    if(len > 1e-10){
      smooth[i]     /= len;
      smooth[i + 1] /= len;
      smooth[i + 2] /= len;
    }
  }

  return smooth;
};

X.parserCTM.isLittleEndian = (function(){
  var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

  bytes[0] = 1;

  return ints[0] === 1;
}());

X.parserCTM.InterleavedStream = function(data, count){
  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  this.offset = X.parserCTM.isLittleEndian? 3: 0;
  this.count = count * 4;
  this.len = this.data.length;
};

X.parserCTM.InterleavedStream.prototype.writeByte = function(value){
  this.data[this.offset] = value;
  
  this.offset += this.count;
  if (this.offset >= this.len){
  
    this.offset -= this.len - 4;
    if (this.offset >= this.count){
    
      this.offset -= this.count + (X.parserCTM.isLittleEndian? 1: -1);
    }
  }
};

X.parserCTM.Stream = function(data){
  this.data = data;
  this.offset = 0;
};

X.parserCTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

X.parserCTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

X.parserCTM.Stream.prototype.readByte = function(){
  return this.data.charCodeAt(this.offset ++) & 0xff;
};

X.parserCTM.Stream.prototype.readInt32 = function(){
  var i = this.readByte();
  i |= this.readByte() << 8;
  i |= this.readByte() << 16;
  return i | (this.readByte() << 24);
};

X.parserCTM.Stream.prototype.readFloat32 = function(){
  var m = this.readByte();
  m += this.readByte() << 8;

  var b1 = this.readByte();
  var b2 = this.readByte();

  m += (b1 & 0x7f) << 16; 
  var e = ( (b2 & 0x7f) << 1) | ( (b1 & 0x80) >>> 7);
  var s = b2 & 0x80? -1: 1;

  if (e === 255){
    return m !== 0? NaN: s * Infinity;
  }
  if (e > 0){
    return s * (1 + (m * this.TWO_POW_MINUS23) ) * Math.pow(2, e - 127);
  }
  if (m !== 0){
    return s * m * this.TWO_POW_MINUS126;
  }
  return s * 0;
};

X.parserCTM.Stream.prototype.readString = function(){
  var len = this.readInt32();

  this.offset += len;

  return this.data.substr(this.offset - len, len);
};

X.parserCTM.Stream.prototype.readArrayInt32 = function(array){
  var i = 0, len = array.length;
  
  while(i < len){
    array[i ++] = this.readInt32();
  }

  return array;
};

X.parserCTM.Stream.prototype.readArrayFloat32 = function(array){
  var i = 0, len = array.length;

  while(i < len){
    array[i ++] = this.readFloat32();
  }

  return array;
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCTM', X.parserCTM);
goog.exportSymbol('X.parserCTM.prototype.parse', X.parserCTM.prototype.parse);
