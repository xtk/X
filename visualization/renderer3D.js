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
goog.provide('X.renderer3D');

// requires
goog.require('X.buffer');
goog.require('X.caption');
goog.require('X.matrix');
goog.require('X.renderer');
goog.require('X.shaders');
goog.require('X.triplets');
goog.require('X.vector');
goog.require('goog.structs.Map');
goog.require('goog.style');



/**
 * Create a 3D renderer inside a given DOM Element.
 *
 * @constructor
 * @extends X.renderer
 */
X.renderer3D = function() {

  //
  // call the standard constructor of X.renderer
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'renderer3D';

  /**
   * The shader pair for this renderer.
   *
   * @type {?X.shaders}
   * @protected
   */
  this._shaders = null;

  /**
   * The compiled shader program of this renderer.
   *
   * @type {?Object}
   * @protected
   */
  this._shaderProgram = null;

  /**
   * The minimum X value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._minX = null;

  /**
   * The maximum X value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._maxX = null;

  /**
   * The minimum Y value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._minY = null;

  /**
   * The maximum Y value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._maxY = null;

  /**
   * The minimum Z value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._minZ = null;

  /**
   * The maximum Z value of the global bounding box.
   *
   * @type {?number}
   * @protected
   */
  this._maxZ = null;

  /**
   * The center of the global bounding box in 3D space.
   *
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The background color.
   *
   * @type {!Array}
   * @protected
   */
  this._bgColor = [0, 0, 0];

  /**
   * The frame buffer which is used for picking.
   *
   * @type {Object}
   * @protected
   */
  this._pickFrameBuffer = null;

  /**
   * A hash map of shader attribute pointers.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._attributePointers = new goog.structs.Map();

  /**
   * A hash map of shader uniform locations.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._uniformLocations = new goog.structs.Map();

  /**
   * A hash map of vertex buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._vertexBuffers = new goog.structs.Map();

  /**
   * A hash map of normal buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._normalBuffers = new goog.structs.Map();

  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._colorBuffers = new goog.structs.Map();

  /**
   * A hash map of scalar buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._scalarBuffers = new goog.structs.Map();

  /**
   * A hash map of texture position buffers of this renderer. Each buffer is
   * associated with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._texturePositionBuffers = new goog.structs.Map();

  /**
   * A hash map of different textures assigned to this renderer. The maximum
   * number of textures is limited to 32 by WebGL.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._textures = new goog.structs.Map();

  /**
   * The configuration of this renderer.
   *
   * @enum {boolean}
   */
  this._config = {
    'PROGRESSBAR_ENABLED': true,
    'PICKING_ENABLED': true,
    'ORDERING_ENABLED': true,
    'STATISTICS_ENABLED': false,
    'INTERMEDIATE_RENDERING': false
  };

};
// inherit from X.renderer
goog.inherits(X.renderer3D, X.renderer);


/**
 * Access the configuration of this renderer. Possible settings and there
 * default values are:
 *
 * <pre>
 *  config.PROGRESSBAR_ENABLED: true
 *  config.PICKING_ENABLED: true
 *  config.ORDERING_ENABLED: true
 *  config.STATISTICS_ENABLED: false
 *  config.INTERMEDIATE_RENDERING: false
 * </pre>
 *
 * @return {Object} The configuration.
 */
X.renderer3D.prototype.__defineGetter__('config', function() {

  return this._config;

});


/**
 * Reset the global bounding box for all objects to undefined and reset the
 * center to 0,0,0. This can be useful before calling X.object.modified() on all
 * objects after transforms etc. which then re-calculates the global bounding
 * box.
 *
 * @public
 */
X.renderer3D.prototype.resetBoundingBox = function() {

  this._minX = null;
  this._maxX = null;
  this._minY = null;
  this._maxY = null;
  this._minZ = null;
  this._maxZ = null;

  this._center = [0, 0, 0];

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.onHover_ = function(event) {

  goog.base(this, 'onHover_', event);

  this.showCaption_(event._x, event._y);

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.init = function() {

  // call the superclass' init method
  goog.base(this, 'init', "experimental-webgl");

  //
  // Step2: Configure the context
  //
  try {

    this._context.viewport(0, 0, this._width, this._height);

    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the container color
    this._context.clearColor(this._bgColor[0], this._bgColor[1], this._bgColor[2], 0.0);
    
    // enable transparency
    this._context.enable(this._context.BLEND);
    this._context.blendEquation(this._context.FUNC_ADD);
    this._context.blendFunc(this._context.SRC_ALPHA,
        this._context.ONE_MINUS_SRC_ALPHA);
    // .. and depth test
    this._context.enable(this._context.DEPTH_TEST);
    // .. with perspective rendering
    this._context.depthFunc(this._context.LEQUAL);
    //


    // clear color and depth buffer
    this._context.clear(this._context.COLOR_BUFFER_BIT |
        this._context.DEPTH_BUFFER_BIT);

    if (this._config['PICKING_ENABLED']) {
      //
      // create a frame buffer for the picking functionality
      //
      // inspired by JAX https://github.com/sinisterchipmunk/jax/ and
      // http://dl.dropbox.com/u/5095342/WebGL/webgldemo3.js
      //
      // we basically render into an invisible framebuffer and use a unique
      // object
      // color to check which object is where (a simulated Z buffer since we can
      // not directly access the one from WebGL)
      var pickFrameBuffer = this._context.createFramebuffer();
      var pickRenderBuffer = this._context.createRenderbuffer();
      var pickTexture = this._context.createTexture();

      this._context.bindTexture(this._context.TEXTURE_2D, pickTexture);

      this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGB,
          this._width, this._height, 0, this._context.RGB,
          this._context.UNSIGNED_BYTE, null);

      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);

      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);

      this._context.bindFramebuffer(this._context.FRAMEBUFFER, pickFrameBuffer);
      this._context.bindRenderbuffer(this._context.RENDERBUFFER,
          pickRenderBuffer);
      this._context.renderbufferStorage(this._context.RENDERBUFFER,
          this._context.DEPTH_COMPONENT16, this._width, this._height);
      this._context.bindRenderbuffer(this._context.RENDERBUFFER, null);

      this._context.framebufferTexture2D(this._context.FRAMEBUFFER,
          this._context.COLOR_ATTACHMENT0, this._context.TEXTURE_2D,
          pickTexture, 0);
      this._context.framebufferRenderbuffer(this._context.FRAMEBUFFER,
          this._context.DEPTH_ATTACHMENT, this._context.RENDERBUFFER,
          pickRenderBuffer);
      this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);

      this._pickFrameBuffer = pickFrameBuffer;

    }

  } catch (e) {

    // this exception indicates if the browser supports WebGL
    throw new Error('Exception while accessing GL Context!\n' + e);

  }

  //
  // WebGL Viewport initialization done
  // --------------------------------------------------------------------------


  //
  // add default shaders to this renderer
  // it is possible to attach other custom shaders after this init call
  // also, this has to happen after this._canvas, this._context and
  // this._camera
  // were
  // attached to this renderer since we check for these
  var _defaultShaders = new X.shaders();
  this.addShaders(_defaultShaders);

};


/**
 * Add a pair of shaders to this renderer. The renderer has to be initialized
 * before adding the shaders.
 *
 * @param {!X.shaders} shaders The X.shaders pair to add to this renderer.
 * @public
 */
X.renderer3D.prototype.addShaders = function(shaders) {

  // check if the renderer is initialized properly
  if (!goog.isDefAndNotNull(this._canvas) ||
      !goog.isDefAndNotNull(this._context) ||
      !goog.isDefAndNotNull(this._camera)) {

    throw new Error('Renderer was not initialized properly.');

  }

  // check if the given shaders are valid
  if (!goog.isDefAndNotNull(shaders) || !(shaders instanceof X.shaders)) {

    throw new Error('Could not add shaders.');

  }

  // call the validate() method of the shader pair
  // this will cause an exception if the validation fails..
  shaders.validate();

  // compile the fragment and vertex shaders
  var _glFragmentShader = this._context
      .createShader(this._context.FRAGMENT_SHADER);
  var _glVertexShader = this._context.createShader(this._context.VERTEX_SHADER);

  // attach the sources, defined in the shaders pair
  this._context.shaderSource(_glFragmentShader, shaders.fragment());
  this._context.shaderSource(_glVertexShader, shaders.vertex());

  // start compilation
  this._context.compileShader(_glFragmentShader);
  this._context.compileShader(_glVertexShader);

  if (!this._context.getShaderParameter(_glFragmentShader,
      this._context.COMPILE_STATUS)) {

    throw new Error('Fragement Shader compilation failed!\n' +
        this._context.getShaderInfoLog(_glFragmentShader));

  }

  if (!this._context.getShaderParameter(_glVertexShader,
      this._context.COMPILE_STATUS)) {

    throw new Error('Vertex Shader compilation failed!\n' +
        this._context.getShaderInfoLog(_glVertexShader));

  }

  // create a shaderProgram, attach the shaders and link'em all together
  var _shaderProgram = this._context.createProgram();
  this._context.attachShader(_shaderProgram, _glVertexShader);
  this._context.attachShader(_shaderProgram, _glFragmentShader);
  this._context.linkProgram(_shaderProgram);

  if (!this._context.getProgramParameter(_shaderProgram,
      this._context.LINK_STATUS)) {

    throw new Error('Could not create shader program!\n' +
        this._context.getShaderInfoLog(_glFragmentShader) + '\n' +
        this._context.getShaderInfoLog(_glVertexShader) + '\n' +
        this._context.getProgramInfoLog(_shaderProgram));

  }

  // activate the new shaderProgram
  this._context.useProgram(_shaderProgram);

  // attach the shaderProgram to this renderer
  this._shaderProgram = _shaderProgram;

  // store the pointers to the shaders' attributes
  var _attributes = Object.keys(X.shaders.attributes);

  _attributes.forEach(function(a) {

    a = X.shaders.attributes[a];
    this._attributePointers.set(a, this._context.getAttribLocation(
        this._shaderProgram, a));
    this._context.enableVertexAttribArray(this._attributePointers.get(a));

  }.bind(this));

  // store the pointers to the shaders' uniforms
  var _uniforms = Object.keys(X.shaders.uniforms);

  _uniforms.forEach(function(u) {

    u = X.shaders.uniforms[u];
    this._uniformLocations.set(u, this._context.getUniformLocation(
        this._shaderProgram, u));

  }.bind(this));

  // finally, attach the shaders to this renderer
  this._shaders = shaders;

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);

  // check if object already existed..
  var existed = false;

  if(!goog.isDefAndNotNull(object)){
    return;
  }
  if (this.get(object._id)) {
    // this means, we are updating
    existed = true;

  }

  var id = object._id;
  var points = object._points;
  var normals = object._normals;
  var colors = object._colors;
  var texture = object._texture;
  var file = object._file;
  var transform = object._transform;
  var colortable = object._colortable;
  var labelmap = object._labelmap; // here we access directly since we do not
  // want to create one using the labelmap() singleton accessor
  var scalars = object._scalars; // same direct access policy

  //
  // LABEL MAP
  //
  if (goog.isDefAndNotNull(labelmap) && goog.isDefAndNotNull(labelmap._file) &&
      labelmap._file._dirty) {
    // a labelmap file is associated to this object and it is dirty..
    // background: we always want to parse label maps first

    // run the update_ function on the labelmap object
    this.update_(labelmap);

    // jump out
    return;

  }

  // check for a label map again
  // this case can happen whenever a label map was already parsed (maybe in a
  // different renderer) and does not need additional file loading but just the
  // gl texture setup
  if (goog.isDefAndNotNull(labelmap) && labelmap._dirty) {

    // run the update_ function on the labelmap object without jumping out
    this.update_(labelmap);

  }

  // here we check if additional loading is necessary
  // this would be the case if
  // a) the object has an external texture
  // b) the object is based on an external file (vtk, stl...)
  // in these cases, we do not directly update the object but activate the
  // X.loader to get the externals and then let it call the update method
  if (goog.isDefAndNotNull(colortable) &&
      goog.isDefAndNotNull(colortable._file) && colortable._file._dirty) {
    // a colortable file is associated to this object and it is dirty..

    // start loading
    this._loader.load(colortable, object);

    return;

  } else if (goog.isDefAndNotNull(texture) &&
      goog.isDefAndNotNull(texture._file) && texture._file._dirty) {
    // a texture file is associated to this object and it is dirty..

    // start loading..
    this._loader.load(texture, object);

    return;

  } else if (goog.isDefAndNotNull(file) && goog.isArray(file)) {
    // this object holds multiple files, a.k.a it is a DICOM series

    // check if we already loaded all the files
    if (!goog.isDefAndNotNull(object.MRI)) {

      // no files loaded at all, start the loading

      var _k = 0;
      var _len = file.length;
      for (_k = 0; _k < _len; _k++) {

        // start loading of each file..
        this._loader.load(file[_k], object);

      }

      return;

    } else if (object.MRI.loaded_files != file.length) {

      // still loading
      return;

    } else if (!object._dirty) {

      // already parsed the volume
      return;

    }

    // just continue

  } else if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..

    // start loading..
    this._loader.load(object, object);

    return;

  } else if (goog.isDefAndNotNull(scalars) &&
      goog.isDefAndNotNull(scalars._file) && scalars._file._dirty) {
    // a scalars container is associated to this object and it's associated file
    // is dirty

    // start loading
    this._loader.load(scalars, object);

    return;

  }

  // MULTI OBJECTS
  //
  // objects can have N child objects which again can have M child objects and
  // so on
  //
  // check if this object has children
  if (object._children.length > 0) {

    // loop through the children and recursively setup the object
    var children = object._children;
    var numberOfChildren = children.length;
    var c = 0;

    for (c = 0; c < numberOfChildren; c++) {

      this.update_(children[c]);

    }

  }

  // check if this is an empty object, if yes, jump out
  // empty objects can be used to group objects
  if (!points) {

    object._dirty = false;
    return;

  }


  // a simple locking mechanism to prevent multiple calls when using
  // asynchronous requests
  var counter = 0;
  while (this._locked) {

    // wait
    counter++;
    window.console.log('Possible thread lock avoided: ' + counter);

  }

  this._locked = true;

  //
  // LOCKED DOWN: ACTION!!
  //
  // This gets executed after all dynamic content has been loaded.

  // X.TIMER(this._classname + '.update');

  // check if this is an X.slice as part of a X.labelmap
  var isLabelMap = (object instanceof X.slice && object._volume instanceof X.labelmap);

  //
  // TEXTURE
  //

  if (existed && goog.isDefAndNotNull(texture) && texture._dirty) {

    // this means the object already existed and the texture is dirty
    // therefore, we delete the old gl buffers

    var oldTexturePositionBuffer = this._texturePositionBuffers.get(id);
    if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {

      if (this._context.isBuffer(oldTexturePositionBuffer._glBuffer)) {

        this._context.deleteBuffer(oldTexturePositionBuffer._glBuffer);

      }

    }
  }

  var texturePositionBuffer = null;
  if (goog.isDefAndNotNull(texture)) {
    // texture associated to this object

    if (!existed || texture._dirty) {

      // the object either did not exist or the texture is dirty, so we
      // re-create the gl buffers

      var textureCoordinateMap = object._textureCoordinateMap;

      // check if we have a valid texture-to-object's-coordinate map
      if (!goog.isDefAndNotNull(textureCoordinateMap)) {

        var m = 'Can not add an object and texture ';
        m += 'without valid coordinate mapping! Set the textureCoordinateMap!';
        throw new Error(m);

      }

      var _flipY = false;
      if (texture._rawData) {
        // use the standard webgl flip Y
        _flipY = true;
      }

      this._context.pixelStorei(this._context.UNPACK_FLIP_Y_WEBGL, _flipY);

      // setup the glTexture, at this point the image for the texture was
      // already
      // loaded thanks to X.loader
      var glTexture = this._context.createTexture();

      // connect the image and the glTexture
      glTexture.image = texture._image;

      //
      // activate the texture on the WebGL side
      this._textures.set(texture._id, glTexture);

      this._context.bindTexture(this._context.TEXTURE_2D, glTexture);
      if (texture._rawData) {

        var _texture_type = this._context.RGBA;
        
        if (texture._grayscale) {
          
          // one channel texture
          _texture_type = this._context.LUMINANCE;
          this._context.pixelStorei(this._context.UNPACK_ALIGNMENT, 1);
          
        }

        // use rawData rather than loading an imagefile
        this._context.texImage2D(this._context.TEXTURE_2D, 0,
            _texture_type, texture._rawDataWidth, texture._rawDataHeight,
            0, _texture_type, this._context.UNSIGNED_BYTE,
            texture._rawData);

      } else {

        // use an imageFile for the texture
        this._context.texImage2D(this._context.TEXTURE_2D, 0,
            this._context.RGBA, this._context.RGBA,
            this._context.UNSIGNED_BYTE, glTexture.image);

      }

      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
      this._context.texParameteri(this._context.TEXTURE_2D,
          this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);

      // for labelmaps, we use NEAREST NEIGHBOR filtering
      if (isLabelMap) {
        this._context.texParameteri(this._context.TEXTURE_2D,
            this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
        this._context.texParameteri(this._context.TEXTURE_2D,
            this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
      } else {
        this._context.texParameteri(this._context.TEXTURE_2D,
            this._context.TEXTURE_MAG_FILTER, this._context.LINEAR);
        this._context.texParameteri(this._context.TEXTURE_2D,
            this._context.TEXTURE_MIN_FILTER, this._context.LINEAR);
      }

      // release the texture binding to clear things
      this._context.bindTexture(this._context.TEXTURE_2D, null);

      // create texture buffer
      var glTexturePositionBuffer = this._context.createBuffer();

      // bind and fill with colors defined above
      this._context.bindBuffer(this._context.ARRAY_BUFFER,
          glTexturePositionBuffer);
      this._context.bufferData(this._context.ARRAY_BUFFER, new Float32Array(
          textureCoordinateMap), this._context.STATIC_DRAW);

      // create an X.buffer to store the texture-coordinate map
      texturePositionBuffer = new X.buffer(glTexturePositionBuffer,
          textureCoordinateMap.length, 2);

     this._texturePositionBuffers.set(id, texturePositionBuffer);

      texture._dirty = false;

    } else {

      // the texture is not dirty and the object already existed, so use the old
      // buffer
      texturePositionBuffer = this._texturePositionBuffers.get(id);

    }

    // dirty check

  } // check if object has a texture

  this._loader.addProgress(0.1);

  //
  // SPECIAL CASE: LABELMAPS
  //

  // since we now have labelmap support, we process the textures (which is the
  // only essential of labelmaps) first and ..

  // .. jump out if this is part of a labelmap
  if (isLabelMap) {

    this._locked = false; // we gotta unlock here already

    X.TIMERSTOP(this._classname + '.update');

    this._loader.addProgress(0.9); // add the missing progress

    return; // sayonara

    // this prevents storing of not required buffers, objects etc. since the
    // labelmaps are only pseudo X.objects and never rendered directly but
    // merged into an X.volume

  }


  //
  // BOUNDING BOX
  //
  // The global bounding incorporates all individual bounding boxes of the
  // objects. This bounding box only changes if either the points or the
  // transform are dirty.
  if (!existed || points._dirty || transform._dirty) {
    var transformationMatrix = transform._matrix;

    var tMin = X.matrix.multiplyByVector(transformationMatrix, points._minA, points._minB, points._minC);
    var tMax = X.matrix.multiplyByVector(transformationMatrix, points._maxA, points._maxB, points._maxC);

    if (goog.isNull(this._minX) || tMin.x < this._minX) {
      this._minX = tMin.x;
    }
    if (goog.isNull(this._maxX) || tMax.x > this._maxX) {
      this._maxX = tMax.x;
    }
    if (goog.isNull(this._minY) || tMin.y < this._minY) {
      this._minY = tMin.y;
    }
    if (goog.isNull(this._maxY) || tMax.y > this._maxY) {
      this._maxY = tMax.y;
    }
    if (goog.isNull(this._minZ) || tMin.z < this._minZ) {
      this._minZ = tMin.z;
    }
    if (goog.isNull(this._maxZ) || tMax.z > this._maxZ) {
      this._maxZ = tMax.z;
    }
    // we always keep track of the current center position
    this._center = [(this._minX + this._maxX) / 2,
                    (this._minY + this._maxY) / 2,
                    (this._minZ + this._maxZ) / 2];

    // only set the transform clean since we still need to look at the points
    transform._dirty = false;
  }


  //
  // VERTICES
  //

  if (existed && points._dirty) {

    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers

    // remove old vertex buffer
    var oldVertexBuffer = this._vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldVertexBuffer)) {

      if (this._context.isBuffer(oldVertexBuffer._glBuffer)) {

        this._context.deleteBuffer(oldVertexBuffer._glBuffer);

      }

    }

  }

  var vertexBuffer = null;

  if (!existed || points._dirty) {

    // the object either did not exist or the points are dirty, so we re-create
    // the gl buffers and reset the bounding box

    var glVertexBuffer = this._context.createBuffer();

    // bind and fill with vertices of current object

    // resize the dynamic array
    points.resize();

    this._context.bindBuffer(this._context.ARRAY_BUFFER, glVertexBuffer);

    this._context.bufferData(this._context.ARRAY_BUFFER, points._triplets,
        this._context.STATIC_DRAW);

    // create an X.buffer to store the vertices
    // every vertex consists of 3 items (x,y,z)
    vertexBuffer = new X.buffer(glVertexBuffer, points.count, 3);

    points._dirty = false;

  } else {

    // the points are not dirty and the object already existed, so use the old
    // buffer
    vertexBuffer = this._vertexBuffers.get(id);

  }

  this._loader.addProgress(0.3);


  //
  // NORMALS
  //

  if (existed && normals._dirty) {

    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers

    // remove old normals buffer
    var oldNormalBuffer = this._vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldNormalBuffer)) {

      if (this._context.isBuffer(oldNormalBuffer._glBuffer)) {

        this._context.deleteBuffer(oldNormalBuffer._glBuffer);

      }

    }

  }

  var normalBuffer = null;

  if (!existed || normals._dirty) {

    // the object either did not exist or the normals are dirty, so we re-create
    // the gl buffers

    var glNormalBuffer = this._context.createBuffer();

    // bind and fill with normals of current object

    // resize the dynamic array
    normals.resize();

    this._context.bindBuffer(this._context.ARRAY_BUFFER, glNormalBuffer);
    this._context.bufferData(this._context.ARRAY_BUFFER, normals._triplets,
        this._context.STATIC_DRAW);

    // create an X.buffer to store the normals
    // every normal consists of 3 items (x,y,z)
    normalBuffer = new X.buffer(glNormalBuffer, normals.count, 3);

    normals._dirty = false;

  } else {

    // the normals are not dirty and the object already existed, so use the old
    // buffer
    normalBuffer = this._normalBuffers.get(id);

  }

  // update progress
  this._loader.addProgress(0.3);


  //
  // COLORS
  //
  // Objects can have point colors which can be different for each fragment.
  // If no point colors are defined, the object has a solid color.

  // also check if colors is null
  if (existed && colors && colors._dirty) {

    // this means the object already existed and the colors are dirty
    // therefore, we delete the old gl buffers

    var oldColorBuffer = this._colorBuffers.get(id);
    if (goog.isDefAndNotNull(oldColorBuffer)) {

      if (this._context.isBuffer(oldColorBuffer._glBuffer)) {

        this._context.deleteBuffer(oldColorBuffer._glBuffer);

      }

    }
  }

  // check if we have point colors, then we need to setup the glBuffer and the
  // X.buffer
  var colorBuffer = null;

  if (colors) {

    // yes, there are point colors setup

    if (!existed || colors._dirty) {

      // the object either did not exist or the colors are dirty, so we
      // re-create the gl buffers

      // check if the point colors are valid, note that we use the length for
      // this
      // check which is slightly faster!
      if (colors.length != points.length) {

        // mismatch, this can not work
        throw new Error('Mismatch between points and point colors.');

      }
      var glColorBuffer = this._context.createBuffer();

      // bind and fill with colors defined above

      // resize the dynamic array
      colors.resize();
      this._context.bindBuffer(this._context.ARRAY_BUFFER, glColorBuffer);
      this._context.bufferData(this._context.ARRAY_BUFFER, colors._triplets,
          this._context.STATIC_DRAW);

      // create an X.buffer to store the colors
      // every color consists of 3 items (r,g,b)
      colorBuffer = new X.buffer(glColorBuffer, colors.count, 3);

      colors._dirty = false;

    } else {

      // the colors are not dirty and the object already existed, so use the old
      // buffer
      colorBuffer = this._colorBuffers.get(id);

    }

  }

  this._loader.addProgress(0.2);


  //
  // SCALARS
  //
  // Objects can have scalars attached to each vertex.

  if (existed && scalars && scalars._dirty) {

    // this means the object already existed and the scalars are dirty
    // therefore, we delete the old gl buffers

    var oldScalarBuffer = this._scalarBuffers.get(id);
    if (goog.isDefAndNotNull(oldScalarBuffer)) {

      if (this._context.isBuffer(oldScalarBuffer._glBuffer)) {

        this._context.deleteBuffer(oldScalarBuffer._glBuffer);

      }

    }
  }

  // check if we have scalars, then we need to setup the glBuffer and the
  // X.buffer
  var scalarBuffer = null;

  if (scalars) {

    // yes, there are scalars setup
    var scalarsArray = scalars._glArray;

    if (!existed || scalars._dirty) {

      // the object either did not exist or the scalars are dirty, so we
      // re-create the gl buffers

      // check if the scalars are valid - we must match the number of vertices
      // here
      if (scalarsArray.length != points.length) {

        // mismatch, this can not work
        throw new Error('Mismatch between points and scalars.');

      }
      var glScalarBuffer = this._context.createBuffer();

      // bind and fill with colors defined above
      this._context.bindBuffer(this._context.ARRAY_BUFFER, glScalarBuffer);
      this._context.bufferData(this._context.ARRAY_BUFFER, scalarsArray,
          this._context.STATIC_DRAW);

      // create an X.buffer to store the colors
      // every scalar consists of 1 item
      scalarBuffer = new X.buffer(glScalarBuffer, scalarsArray.length, 3);

      scalars._dirty = false;

    } else {

      // the colors are not dirty and the object already existed, so use the old
      // buffer
      scalarBuffer = this._scalarBuffers.get(id);

    }

  }

  this._loader.addProgress(0.1);


  //
  // FINAL STEPS
  //

  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!existed) {
    this._objects.add(object);
  }

  // add the buffers for the object to the internal hash maps
  // at this point the buffers are: either null (if possible), a newly generated
  // one or an old one
  this._vertexBuffers.set(id, vertexBuffer);
  this._normalBuffers.set(id, normalBuffer);
  this._colorBuffers.set(id, colorBuffer);
  this._texturePositionBuffers.set(id, texturePositionBuffer);
  this._scalarBuffers.set(id, scalarBuffer);

  // clean the object
  object._dirty = false;

  // X.TIMERSTOP(this._classname + '.update');

  // unlock
  this._locked = false;

};


/**
 * Show the caption of the X.object at viewport position x,y. This performs
 * object picking and shows a tooltip if an object with a caption exists at this
 * position.
 *
 * @param {number} x The x coordinate (viewport).
 * @param {number} y The y coordinate (viewport).
 */
X.renderer3D.prototype.showCaption_ = function(x, y) {

  var pickedId = this.pick(x, y);

  var object = this.get(pickedId);

  if (object) {

    var caption = object._caption;

    if (caption) {

			var pos = goog.style.getClientPosition(this._container);

      var t = new X.caption(this._container, pos.x + x +
          10, pos.y + y + 10, this._interactor);
      t.setHtml(caption);

    }

  }

};


/**
 * (Re-)configure the volume rendering orientation based on the current view
 * matrix of the camera. We always use the slices which are best oriented to
 * create the tiled textures of X.volumes.
 *
 * @param {X.volume} volume The X.volume to configure
 */
X.renderer3D.prototype.orientVolume_ = function(volume) {

  var realCentroidVector = X.matrix.multiplyByVector(this._camera._view, volume._RASCenter[0]+volume._childrenInfo[0]._sliceNormal[0],volume._RASCenter[1]+ volume._childrenInfo[0]._sliceNormal[1], volume._RASCenter[2]+volume._childrenInfo[0]._sliceNormal[2]);
  var realCentroidVector2 = X.matrix.multiplyByVector(this._camera._view,volume._RASCenter[0]-volume._childrenInfo[0]._sliceNormal[0], volume._RASCenter[1]-volume._childrenInfo[0]._sliceNormal[1], volume._RASCenter[2]-volume._childrenInfo[0]._sliceNormal[2]);
  var dX = Math.abs(realCentroidVector.z - realCentroidVector2.z);

  realCentroidVector = X.matrix.multiplyByVector(this._camera._view, volume._RASCenter[0]+volume._childrenInfo[1]._sliceNormal[0], volume._RASCenter[1]+volume._childrenInfo[1]._sliceNormal[1], volume._RASCenter[2]+volume._childrenInfo[1]._sliceNormal[2]);
  realCentroidVector2 = X.matrix.multiplyByVector(this._camera._view, volume._RASCenter[0]-volume._childrenInfo[1]._sliceNormal[0], volume._RASCenter[1]-volume._childrenInfo[1]._sliceNormal[1], volume._RASCenter[2] +-volume._childrenInfo[1]._sliceNormal[2]);
  var dY = Math.abs(realCentroidVector.z - realCentroidVector2.z);

  realCentroidVector = X.matrix.multiplyByVector(this._camera._view, volume._RASCenter[0]+volume._childrenInfo[2]._sliceNormal[0], volume._RASCenter[1]+volume._childrenInfo[2]._sliceNormal[1], volume._RASCenter[2]+volume._childrenInfo[2]._sliceNormal[2]);
  realCentroidVector2 = X.matrix.multiplyByVector(this._camera._view, volume._RASCenter[0]-volume._childrenInfo[2]._sliceNormal[0], volume._RASCenter[1]-volume._childrenInfo[2]._sliceNormal[1], volume._RASCenter[2]-volume._childrenInfo[2]._sliceNormal[2]);
  var dZ = Math.abs(realCentroidVector.z - realCentroidVector2.z);

  var maxDistance = Math.max(dX, dY, dZ);

  if (maxDistance == dX) {

    volume.volumeRendering_(0);

  } else if (maxDistance == dY) {

    volume.volumeRendering_(1);

  } else {
    
    volume.volumeRendering_(2);
  }

};


/**
 * Calculate the distance to the eye (camera) for one X.object.
 *
 * @param {!X.object} object The X.object to use for calculation.
 * @return {number} The distance to the eye.
 */
X.renderer3D.prototype.distanceToEye_ = function(object) {

  var centroid = object._points._centroid;
  var transformedCentroidVector = X.matrix.multiplyByVector(object._transform._matrix, centroid[0], centroid[1], centroid[2]);
  var realCentroidVector = X.matrix.multiplyByVector(this._camera._view, transformedCentroidVector.x, transformedCentroidVector.y, transformedCentroidVector.z);
  var distanceFromEye = X.vector.distance(this._camera._position,
      realCentroidVector);

  return Math.round(distanceFromEye * 1000) / 1000;

};


/**
 * Calculates the distance for each associated X.object and orders objects array
 * accordingly from back-to-front while fully opaque objects are drawn first.
 * Jumps out as early as possible if all objects are fully opaque.
 */
X.renderer3D.prototype.order_ = function() {

  // by default we do not want to update the rendering order
  var reSortRequired = false;

  var topLevelObjects = this._topLevelObjects;
  var numberOfTopLevelObjects = topLevelObjects.length;
  var t;
  t = numberOfTopLevelObjects - 1;
  do {

    var object = topLevelObjects[t];

    // special case for X.volumes in volumeRendering mode
    // a) we know the volumeRendering direction and the center of the volume
    // b) check if first or last slice is the closest an order slices accordingly
    if (object instanceof X.volume && object._volumeRendering && object._volumeRenderingDirection != -1) {

        var _slices = object._children[object._volumeRenderingDirection]._children;
        var numberOfSlices = _slices.length;

        // grab the first slice, attach the distance and opacity
        var firstSlice = _slices[0];

        var _targetChild = object._volumeRenderingDirection;
        var realCentroidVector = X.matrix.multiplyByVector(this._camera._view, object._RASCenter[0]+object._childrenInfo[_targetChild]._sliceDirection[0], object._RASCenter[1]+object._childrenInfo[_targetChild]._sliceDirection[1], object._RASCenter[2]+object._childrenInfo[_targetChild]._sliceDirection[2]);
        var realCentroidVector2 = X.matrix.multiplyByVector(this._camera._view,object._RASCenter[0]-object._childrenInfo[_targetChild]._sliceDirection[0], object._RASCenter[1]-object._childrenInfo[_targetChild]._sliceDirection[1], object._RASCenter[2]-object._childrenInfo[_targetChild]._sliceDirection[2]);
        var dX = realCentroidVector.z - realCentroidVector2.z;

         var _acquisitionDirection = Math.max(object._IJKToRAS[object._volumeRenderingDirection], Math.max(object._IJKToRAS[object._volumeRenderingDirection+4], object._IJKToRAS[object._volumeRenderingDirection+8])); 
         var _acquisitionDirection2 = Math.min(object._IJKToRAS[object._volumeRenderingDirection], Math.min(object._IJKToRAS[object._volumeRenderingDirection+4], object._IJKToRAS[object._volumeRenderingDirection+8])); 
         var _acquisitionSign = _acquisitionDirection + _acquisitionDirection2;

        if(dX*_acquisitionSign < 0) {

          var s = 0;
          for (s = 0; s < object._range[_targetChild] - 1; s++) {

            if (!_slices[s]) continue;

            _slices[s]._opacity = object._opacity;
            _slices[s]._distance =   object._childrenInfo[_targetChild]._sliceSpacing*s;

          }
        }
        else {

         var s = object._range[_targetChild] - 1;
         for (s = object._range[_targetChild] - 1; s >= 0; s--) {

            if (!_slices[s]) continue;

            _slices[s]._opacity = object._opacity;
            _slices[s]._distance =   (object._range[_targetChild]-1)*object._childrenInfo[_targetChild]._sliceSpacing -object._childrenInfo[_targetChild]._sliceSpacing*s;

          }
        }

        // we need to update the rendering order
        reSortRequired = true;

    }

  } while (t--);

  var objects = this._objects.values();
  var numberOfObjects = objects.length;

  var i;
  i = numberOfObjects - 1;
  do {

    var object = objects[i];

    if (!object._visible) {
      continue;
    }

    // the following cases do not need to be calculated
    // a) opacity is 1
    // b) object is an X.slice since we take care of that when grabbing the
    // volume
    if ((object._opacity == 1) || (object instanceof X.slice)) {

      continue;

    }

    // attach the distance from the eye to the object
    object._distance = this.distanceToEye_(object);

    // we need to update the rendering order
    reSortRequired = true;

  } while (i--);

  // only re-sort the tree if required
  if (reSortRequired) {

    //console.log('resorting');

    this._objects.sort();

  }

};


/**
 * Picks an object at a position defined by display coordinates. If
 * X.renderer3D.config['PICKING_ENABLED'] is FALSE, this function always returns
 * -1.
 *
 * @param {!number} x The X-value of the display coordinates.
 * @param {!number} y The Y-value of the display coordinates.
 * @return {number} The ID of the found X.object or -1 if no X.object was found.
 */
X.renderer3D.prototype.pick = function(x, y) {

  if (this._config['PICKING_ENABLED']) {

    // render again with picking turned on which renders the scene in a
    // framebuffer
    this.render_(true, false);

    // grab the content of the framebuffer
    var data = new Uint8Array(4);
    this._context.readPixels(x, this._height - y, 1, 1, this._context.RGBA,
        this._context.UNSIGNED_BYTE, data);

    // grab the id
    var r = data[0];
    var g = data[1];
    var b = data[2];

    return (r + g * 255 + b * 255 * 255);

  } else {

    return -1;

  }

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.render_ = function(picking, invoked) {

  // call the render_ method of the superclass
  goog.base(this, 'render_', picking, invoked);

  // clear the canvas
  this._context.viewport(0, 0, this._width, this._height);
  this._context.clear(this._context.COLOR_BUFFER_BIT |
      this._context.DEPTH_BUFFER_BIT);

  // only proceed if there are actually objects to render
  var _objects = this._objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }

  if (picking) {

    // we are in picking mode, so use the framebuffer rather than the canvas
    this._context.bindFramebuffer(this._context.FRAMEBUFFER,
        this._pickFrameBuffer);

  } else {

    // disable the framebuffer
    this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);

  }

  // grab the current perspective from the camera
  var perspectiveMatrix = this._camera._perspective;

  // grab the current view from the camera
  var viewMatrix = this._camera._view;

  // propagate perspective and view matrices to the uniforms of
  // the shader
  this._context.uniformMatrix4fv(this._uniformLocations
      .get(X.shaders.uniforms.PERSPECTIVE), false, perspectiveMatrix);

  this._context.uniformMatrix4fv(this._uniformLocations
      .get(X.shaders.uniforms.VIEW), false, viewMatrix);

  // propagate the objects' center to the shader
  //
  var center = this._center;
  this._context.uniform3f(
      this._uniformLocations.get(X.shaders.uniforms.CENTER),
      parseFloat(center[0]), parseFloat(center[1]), parseFloat(center[2]));

  //
  // orient volumes for proper volume rendering - if there are any,
  // this means, depending on the direction of the eye, we use the slice stack
  // of a specific axis to create the tiled texture
  var i;
  var topLevelObjectsLength = this._topLevelObjects.length;
  for (i = 0; i < topLevelObjectsLength; ++i) {
    var topLevelObject = this._topLevelObjects[i];
    if (topLevelObject instanceof X.volume) {
      this.orientVolume_(topLevelObject);
    }
  }

  //
  // re-order the objects, but only if enabled.
  // this ordering should be disabled if the objects' opacity settings are not
  // used or if a large number of objects are associated
  if (this._config['ORDERING_ENABLED']) {

    this.order_();

  }

  var statisticsEnabled = (!picking && goog.isDefAndNotNull(invoked) && invoked && this._config['STATISTICS_ENABLED']);
  if (statisticsEnabled) {

    // for statistics
    var verticesCounter = 0;
    var trianglesCounter = 0;
    var linesCounter = 0;
    var pointsCounter = 0;

  }

  //
  // caching for multiple objects
  //
  var aPointers = this._attributePointers;
  var aPosition = aPointers.get(X.shaders.attributes.VERTEXPOSITION);
  var aNormal = aPointers.get(X.shaders.attributes.VERTEXNORMAL);
  var aColor = aPointers.get(X.shaders.attributes.VERTEXCOLOR);
  var aTexturePosition = aPointers.get(X.shaders.attributes.VERTEXTEXTUREPOS);
  var aScalar = aPointers.get(X.shaders.attributes.VERTEXSCALAR);

  var uLocations = this._uniformLocations;
  var uUsePicking = uLocations.get(X.shaders.uniforms.USEPICKING);
  var uUseObjectColor = uLocations.get(X.shaders.uniforms.USEOBJECTCOLOR);
  var uObjectColor = uLocations.get(X.shaders.uniforms.OBJECTCOLOR);
  var uUseScalars = uLocations.get(X.shaders.uniforms.USESCALARS);
  var uScalarsReplaceMode = uLocations
      .get(X.shaders.uniforms.SCALARSREPLACEMODE);
  var uScalarsMin = uLocations.get(X.shaders.uniforms.SCALARSMIN);
  var uScalarsMax = uLocations.get(X.shaders.uniforms.SCALARSMAX);
  var uScalarsMinColor = uLocations.get(X.shaders.uniforms.SCALARSMINCOLOR);
  var uScalarsMaxColor = uLocations.get(X.shaders.uniforms.SCALARSMAXCOLOR);
  var uScalarsInterpolation = uLocations.get(X.shaders.uniforms.SCALARSINTERPOLATION);
  var uScalarsMinThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMINTHRESHOLD);
  var uScalarsMaxThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMAXTHRESHOLD);
  var uObjectOpacity = uLocations.get(X.shaders.uniforms.OBJECTOPACITY);
  var uLabelMapOpacity = uLocations.get(X.shaders.uniforms.LABELMAPOPACITY);
  var uLabelMapColor = uLocations.get(X.shaders.uniforms.LABELMAPCOLOR);
  var uUseTexture = uLocations.get(X.shaders.uniforms.USETEXTURE);
  var uUseLabelMapTexture = uLocations
      .get(X.shaders.uniforms.USELABELMAPTEXTURE);
  var uTextureSampler = uLocations.get(X.shaders.uniforms.TEXTURESAMPLER);
  var uTextureSampler2 = uLocations.get(X.shaders.uniforms.TEXTURESAMPLER2);
  var uVolumeLowerThreshold = uLocations
      .get(X.shaders.uniforms.VOLUMELOWERTHRESHOLD);
  var uVolumeUpperThreshold = uLocations
      .get(X.shaders.uniforms.VOLUMEUPPERTHRESHOLD);
  var uVolumeScalarMin = uLocations.get(X.shaders.uniforms.VOLUMESCALARMIN);
  var uVolumeScalarMax = uLocations.get(X.shaders.uniforms.VOLUMESCALARMAX);
  var uVolumeWindowLow = uLocations.get(X.shaders.uniforms.VOLUMEWINDOWLOW);
  var uVolumeWindowHigh = uLocations.get(X.shaders.uniforms.VOLUMEWINDOWHIGH);
  var uVolumeScalarMinColor = uLocations
      .get(X.shaders.uniforms.VOLUMESCALARMINCOLOR);
  var uVolumeScalarMaxColor = uLocations
      .get(X.shaders.uniforms.VOLUMESCALARMAXCOLOR);
  var uVolumeTexture = uLocations.get(X.shaders.uniforms.VOLUMETEXTURE);
  var uObjectTransform = uLocations.get(X.shaders.uniforms.OBJECTTRANSFORM);
  var uPointSize = uLocations.get(X.shaders.uniforms.POINTSIZE);

  //
  // loop through all objects and (re-)draw them

  i = _numberOfObjects;
  do {

    var object = _objects[_numberOfObjects - i];

    if (object) {
      // we have a valid object

      // special case for volumes
      var volume = null;

      if (object instanceof X.slice && object._volume) {

        // we got a volume
        volume = object._volume;

      }

      // check visibility
      if (!object._visible || (volume && !volume._visible)) {

        // not visible, continue to the next one..
        continue;

      }

      // check picking mode and object pickable
      if (picking && !object._pickable) {

        // object not pickable, continue to next one
        continue;
      }

      var id = object._id;

      var magicMode = object._magicmode;

      var vertexBuffer = this._vertexBuffers.get(id);
      var normalBuffer = this._normalBuffers.get(id);

      var colorBuffer = this._colorBuffers.get(id);
      var scalarBuffer = this._scalarBuffers.get(id);
      var texturePositionBuffer = this._texturePositionBuffers.get(id);

      // ..bind the glBuffers

      // VERTICES
      this._context.bindBuffer(this._context.ARRAY_BUFFER,
          vertexBuffer._glBuffer);

      this._context.vertexAttribPointer(aPosition, vertexBuffer._itemSize,
          this._context.FLOAT, false, 0, 0);

      // NORMALS
      this._context.bindBuffer(this._context.ARRAY_BUFFER,
          normalBuffer._glBuffer);

      this._context.vertexAttribPointer(aNormal, normalBuffer._itemSize,
          this._context.FLOAT, false, 0, 0);

      if (picking) {

        // in picking mode, we use a color based on the id of this object
        this._context.uniform1i(uUsePicking, true);

      } else {

        // in picking mode, we use a color based on the id of this object
        this._context.uniform1i(uUsePicking, false);

      }

      // COLORS
      if (colorBuffer && !picking && !magicMode) {

        // point colors are defined for this object and there is not picking
        // request and no magicMode active

        // de-activate the useObjectColor flag on the shader
        this._context.uniform1i(uUseObjectColor, false);

        this._context.bindBuffer(this._context.ARRAY_BUFFER,
            colorBuffer._glBuffer);

        this._context.vertexAttribPointer(aColor, colorBuffer._itemSize,
            this._context.FLOAT, false, 0, 0);

      } else {

        // we have a fixed object color or this is 'picking' mode
        var useObjectColor = 1;

        // some magic mode support
        if (magicMode && !picking) {

          useObjectColor = 0;

        }

        // activate the useObjectColor flag on the shader
        // in magicMode, this is always false!
        this._context.uniform1i(uUseObjectColor, useObjectColor);

        var objectColor = object._color;

        if (picking) {

          // encoding of the id to 3 bytes
          var r = Math.floor((id % (255 * 255)) % 255);
          var g = Math.floor((id % (255 * 255)) / 255);
          var b = Math.floor(id / (255 * 255));

          // and set it as the color
          objectColor = [r / 255, g / 255, b / 255];

        }

        this._context.uniform3f(uObjectColor, parseFloat(objectColor[0]),
            parseFloat(objectColor[1]), parseFloat(objectColor[2]));

        // we always have to configure the attribute of the point colors
        // even if no point colors are in use
        this._context.vertexAttribPointer(aColor, vertexBuffer._itemSize,
            this._context.FLOAT, false, 0, 0);

      }

      // SCALARS
      if (scalarBuffer && !picking && !magicMode) {

        // scalars are defined for this object and there is not picking
        // request and no magicMode active

        // activate the useScalars flag on the shader
        this._context.uniform1i(uUseScalars, true);

        // propagate the replace flag
        this._context.uniform1i(uScalarsReplaceMode,
            object._scalars._replaceMode);

        var minColor = object._scalars._minColor;
        var maxColor = object._scalars._maxColor;

        // propagate minColors and maxColors for the scalars
        this._context.uniform3f(uScalarsMinColor, parseFloat(minColor[0]),
            parseFloat(minColor[1]), parseFloat(minColor[2]));
        this._context.uniform3f(uScalarsMaxColor, parseFloat(maxColor[0]),
            parseFloat(maxColor[1]), parseFloat(maxColor[2]));

        // propagate minThreshold and maxThreshold for the scalars
        this._context.uniform1f(uScalarsMinThreshold,
            parseFloat(object._scalars._lowerThreshold));
        this._context.uniform1f(uScalarsMaxThreshold,
            parseFloat(object._scalars._upperThreshold));

        // propagate min and max for the scalars
        this._context.uniform1f(uScalarsMin, parseFloat(object._scalars._min));
        this._context.uniform1f(uScalarsMax, parseFloat(object._scalars._max));

        // propagate scalar interpolation scheme
        this._context.uniform1i(uScalarsInterpolation, parseInt(object._scalars._interpolation, 10));

        this._context.bindBuffer(this._context.ARRAY_BUFFER,
            scalarBuffer._glBuffer);

        this._context.vertexAttribPointer(aScalar, scalarBuffer._itemSize,
            this._context.FLOAT, false, 0, 0);

      } else {

        // de-activate the useScalars flag on the shader
        this._context.uniform1i(uUseScalars, false);

        // we always have to configure the attribute of the scalars
        // even if no scalars are in use
        this._context.vertexAttribPointer(aScalar, vertexBuffer._itemSize,
            this._context.FLOAT, false, 0, 0);

      }

      // OPACITY
      this._context.uniform1f(uObjectOpacity, parseFloat(object._opacity));

      // TEXTURE
      if (object._texture && texturePositionBuffer && !picking) {
        //
        // texture associated to this object
        //

        // activate the texture flag on the shader
        this._context.uniform1i(uUseTexture, true);

        // setup the sampler

        // bind the texture
        this._context.activeTexture(this._context.TEXTURE0);

        // grab the texture from the internal hash map using the id as the
        // key
        this._context.bindTexture(this._context.TEXTURE_2D, this._textures
            .get(object._texture._id));
        this._context.uniform1i(uTextureSampler, 0);

        // propagate the current texture-coordinate-map to WebGL
        this._context.bindBuffer(this._context.ARRAY_BUFFER,
            texturePositionBuffer._glBuffer);

        this._context.vertexAttribPointer(aTexturePosition,
            texturePositionBuffer._itemSize, this._context.FLOAT, false, 0, 0);

        // by default, no X.volume texture
        this._context.uniform1i(uVolumeTexture, false);

      } else {

        // no texture for this object or 'picking' mode
        this._context.uniform1i(uUseTexture, false);

        // we always have to configure the attribute of the texture positions
        // even if no textures are in use
        this._context.vertexAttribPointer(aTexturePosition,
            vertexBuffer._itemSize, this._context.FLOAT, false, 0, 0);

      }

      // VOLUMES
      // several special values need to be passed to the shaders if the object
      // is a X.slice (part of an X.volume)
      // this is the case if we have a volume here..
      if (volume) {

        // this is a X.volume texture
        this._context.uniform1i(uVolumeTexture, true);

        // pass the lower threshold
        this._context.uniform1f(uVolumeLowerThreshold, volume._lowerThreshold);
        // pass the upper threshold
        this._context.uniform1f(uVolumeUpperThreshold, volume._upperThreshold);

        // pass the scalar range
        this._context.uniform1f(uVolumeScalarMin, volume._min);
        this._context.uniform1f(uVolumeScalarMax, volume._max);

        // pass the colors for scalar mapping
        var minColor = volume._minColor;
        var maxColor = volume._maxColor;
        this._context.uniform3f(uVolumeScalarMinColor, parseFloat(minColor[0]),
            parseFloat(minColor[1]), parseFloat(minColor[2]));
        this._context.uniform3f(uVolumeScalarMaxColor, parseFloat(maxColor[0]),
            parseFloat(maxColor[1]), parseFloat(maxColor[2]));

        // pass the w/l
        this._context.uniform1f(uVolumeWindowLow, volume._windowLow);
        this._context.uniform1f(uVolumeWindowHigh, volume._windowHigh);

        // get the (optional) label map
        var labelmap = volume._labelmap;

        // no labelmap by default
        this._context.uniform1i(uUseLabelMapTexture, false);

        // opacity, only if volume rendering is active
        if (volume._volumeRendering) {

          this._context.uniform1f(uObjectOpacity, parseFloat(volume._opacity));

        } else if (labelmap && labelmap._visible) {
          // only if we have an associated labelmap..
          
          // grab the id of the labelmap
          var labelmapTextureID = object._labelmap._id;

          // we handle a second texture, actually the one for the labelmap
          this._context.uniform1i(uUseLabelMapTexture, true);

          // bind the texture
          this._context.activeTexture(this._context.TEXTURE1);

          // grab the texture from the internal hash map using the id as
          // the key
          this._context.bindTexture(this._context.TEXTURE_2D, this._textures
              .get(labelmapTextureID));
          this._context.uniform1i(uTextureSampler2, 1);

          // propagate label map opacity
          this._context.uniform1f(uLabelMapOpacity, labelmap._opacity);

          // propagate the labelmap show only color
          this._context.uniform4fv(uLabelMapColor, labelmap._showOnlyColor);

        }

      }

      // TRANSFORMS
      // propagate transform to the uniform matrices of the shader
      this._context.uniformMatrix4fv(uObjectTransform, false,
          object._transform._matrix);

      // POINT SIZE
      var pointSize = 1;
      if (object._type == X.displayable.types.POINTS) {
        pointSize = object._pointsize;
      }
      this._context.uniform1f(uPointSize, pointSize);

      //
      // .. and draw with the object's DRAW MODE
      //
      var drawMode = -1;
      if (object._type == X.displayable.types.TRIANGLES) {

        drawMode = this._context.TRIANGLES;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }

      } else if (object._type == X.displayable.types.LINES) {

        this._context.lineWidth(object._linewidth);

        drawMode = this._context.LINES;
        if (statisticsEnabled) {
          linesCounter += (vertexBuffer._itemCount / 2);
        }

      } else if (object._type == X.displayable.types.POINTS) {

        drawMode = this._context.POINTS;
        if (statisticsEnabled) {
          pointsCounter += vertexBuffer._itemCount;
        }

      } else if (object._type == X.displayable.types.TRIANGLE_STRIPS) {

        drawMode = this._context.TRIANGLE_STRIP;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }

      } else if (object._type == X.displayable.types.POLYGONS) {

        // TODO right now, this is hacked.. we need to use the Van Gogh
        // triangulation algorithm or something faster to properly convert
        // POLYGONS to TRIANGLES.
        // Remark: The Van Gogh algorithm is implemented in the
        // X.object.toCSG/fromCSG functions but not used here.
        if (vertexBuffer._itemCount % 3 == 0) {

          drawMode = this._context.TRIANGLES;

        } else {

          drawMode = this._context.TRIANGLE_FAN;

        }

        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }

      }

      if (statisticsEnabled) {

        verticesCounter += vertexBuffer._itemCount;

      }

      // push it to the GPU, baby..
      this._context.drawArrays(drawMode, 0, vertexBuffer._itemCount);

    }

  } while (--i); // loop through objects

  if (statisticsEnabled) {

    var statistics = "Objects: " + _numberOfObjects + " | ";
    statistics += "Vertices: " + verticesCounter + " | ";
    statistics += "Triangles: " + Math.round(trianglesCounter) + " | ";
    statistics += "Lines: " + linesCounter + " | ";
    statistics += "Points: " + pointsCounter + " | ";
    statistics += "Textures: " + this._textures.getCount();
  }

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.remove = function(object) {

	// call the remove_ method of the superclass
	goog.base(this, 'remove', object);

	// check if this object has children
	if (object._children.length > 0) {

		// loop through the children and recursively remove the objects
		var children = object._children;
		var numberOfChildren = children.length;
		var c = 0;

		for (c = 0; c < numberOfChildren; c++) {
      if (typeof(children[c]) != "undefined"){
			  this.remove(children[c]);
      }
		}

	}

  var id = object._id;

  // check if the object exists
  var oldTexturePositionBuffer = this._texturePositionBuffers.get(id);
  if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {
    if (this._context.isBuffer(oldTexturePositionBuffer._glBuffer)) {
  
      this._context.deleteBuffer(oldTexturePositionBuffer._glBuffer);

    }

  }

  if (object._texture) {
    
    var _texture = this._textures.get(object._texture._id);

    if (_texture) {

      this._context.deleteTexture(_texture);

      this._textures.remove(object._texture._id);

    }

  }

  var oldVertexBuffer = this._vertexBuffers.get(id);
  if (goog.isDefAndNotNull(oldVertexBuffer)) {

    if (this._context.isBuffer(oldVertexBuffer._glBuffer)) {

      this._context.deleteBuffer(oldVertexBuffer._glBuffer);

    }

  }


  var oldNormalBuffer = this._normalBuffers.get(id);
  if (goog.isDefAndNotNull(oldNormalBuffer)) {

    if (this._context.isBuffer(oldNormalBuffer._glBuffer)) {

      this._context.deleteBuffer(oldNormalBuffer._glBuffer);

    }

  }

  var oldColorBuffer = this._colorBuffers.get(id);
  if (goog.isDefAndNotNull(oldColorBuffer)) {

    if (this._context.isBuffer(oldColorBuffer._glBuffer)) {

      this._context.deleteBuffer(oldColorBuffer._glBuffer);

    }

  }

  var oldScalarBuffer = this._scalarBuffers.get(id);
  if (goog.isDefAndNotNull(oldScalarBuffer)) {

    if (this._context.isBuffer(oldScalarBuffer._glBuffer)) {

      this._context.deleteBuffer(oldScalarBuffer._glBuffer);

    }

  }

  this._vertexBuffers.remove(id);
  this._normalBuffers.remove(id);
  this._colorBuffers.remove(id);
  this._texturePositionBuffers.remove(id);
  this._scalarBuffers.remove(id);

  this._objects.remove(object);

  return true;

};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.destroy = function() {

  // remove all shaders
  this._shaders = null;
  delete this._shaders;

  // remove the gl context
  this._context.clear(this._context.COLOR_BUFFER_BIT |
      this._context.DEPTH_BUFFER_BIT);

  // call the destroy method of the superclass
  goog.base(this, 'destroy');

};

/**
 * Get the background color.
 *
 * @return {!Array} The background color normalized.
 * @public
 */
X.renderer3D.prototype.__defineGetter__('bgColor', function() {
  
  return this._bgColor;

});

/**
 * Set the background color.
 *
 * @param {!Array}
 *          bgColor The background color normalized.
 * @public
 */
X.renderer3D.prototype.__defineSetter__('bgColor', function(bgColor) {

  this._bgColor = bgColor;

});

/**
 * Calculate the intersection between a bounding box and rays.
 *
 * @param {!Array} box The bounding box as [minX, maxX, minY, maxY, minZ, maxZ]
 * @param {!Array} ray_start The ray origin as [x,y,z]
 * @param {!Array} ray_direction The ray direction as [x,y,z]
 * @return {!Array} An array with collections of in and out intersections.
 * @protected
 */
X.renderer3D.prototype.ray_intersect_box_ = function(box, ray_start, ray_direction) {


  var _solutionsIn = new Array();
  var _solutionsOut = new Array();
  
  // xmin, xmax, ymin, ymax, zmin, zmax
  for(var _i = 0; _i < 6; _i++) {

    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j1 = (2 + (2*_i2))%6;
    var _j2 = (4 + (2*_i2))%6;
    var _dir = _i2;
    
    
    var _sol0 = box[_i];
    var _invN1 = 1/ray_direction[_i2];
    
    var _t = (_sol0 - ray_start[_i2])*_invN1;
    
    // if _t infinity, we are //
    if(_t != Infinity && _t != -Infinity) {

      var _sol1 = ray_start[_i3] + ray_direction[_i3]*_t;
      var _sol2 = ray_start[_i4] + ray_direction[_i4]*_t;
        
      // in range?
      if( (_sol1 >= box[_j1] && _sol1 <= box[_j1+1]) &&
          (_sol2 >= box[_j2] && _sol2 <= box[_j2+1])) {
        
        var _sol = new Array();
        _sol[_i2] = box[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;

        _solutionsIn.push(_sol);

      }
      else {

        var _sol = new Array();
        _sol[_i2] = box[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;
        
        _solutionsOut.push(_sol);

      }
    }
  }
  
  return [_solutionsIn, _solutionsOut];

};

/**
 * Pick an object intersection in world space by using raycasting.
 *
 * @param {!number} x The viewport X coordinate.
 * @param {!number} y The viewport Y coordinate.
 * @param {!number=} delta The sample rate to probe for intersections. Default is 5.
 * @param {!number=} epsilon The threshold to mark a neighboring point as intersection. Default is 2mm.
 * @param {X.object=} object The object to pick on. Default is auto-detect.
 * @return {?Array} The closest 3D point of a valid object after ray casting. If NULL, than delta and epsilon should be tuned.
 * @public
 */
X.renderer3D.prototype.pick3d = function(x, y, delta, epsilon, object) {

  // default values for delta and epsilon 
  // to determine the picking accuracy with a speed tradeoff
  if (!goog.isDefAndNotNull(delta)) {
    delta = 4.0;
  }

  if (!goog.isDefAndNotNull(epsilon)) {
    epsilon = 2;
  }

  // if a object was specified, use it directly
  if (!goog.isDefAndNotNull(object)) {

    // grab the object under the cursor
    var id = this.pick(x,y);
    if (id == -1) {
      // quickly exit if there is no object
      return null;
    }

    
    object = this.get(id);
    if (!object) {
      return null;
    }

  }

  // we know now that the object has been hit
  // the question is: where exactly?

  var ray_near = this._camera.unproject_(x/this._width*2.0-1.0, ((this._height-y)/this._height)*2.0-1.0, 0.0);
  var ray_far = this._camera.unproject_(x/this._width*2.0-1.0, ((this._height-y)/this._height)*2.0-1.0, 1.0);

  // add center to both
  ray_near[0] += this._center[0];
  ray_near[1] += this._center[1];
  ray_near[2] += this._center[2];
  ray_far[0] += this._center[0];
  ray_far[1] += this._center[1];
  ray_far[2] += this._center[2];

  // and apply the transform of the object
  // ray_near = X.matrix.multiplyByVector(object.transform.matrix, ray_near[0], ray_near[1], ray_near[2]);
  // ray_far = X.matrix.multiplyByVector(object.transform.matrix, ray_far[0], ray_far[1], ray_far[2]);
  // ray_near = [ray_near.xx, ray_near.yy, ray_near.zz];
  // ray_far = [ray_far.xx, ray_far.yy, ray_far.zz];


  // find the intersection of the ray with the bounding box

  // first, reconstruct the box coordinates from the boundingbox
  var A = [object._points._minA, object._points._minB, object._points._minC];
  var B = [object._points._maxA, object._points._minB, object._points._minC];
  var C = [object._points._maxA, object._points._maxB, object._points._minC];
  var D = [object._points._minA, object._points._maxB, object._points._minC];
  var E = [object._points._minA, object._points._maxB, object._points._maxC];
  var F = [object._points._minA, object._points._minB, object._points._maxC];
  var G = [object._points._maxA, object._points._maxB, object._points._maxC];
  var H = [object._points._maxA, object._points._minB, object._points._maxC];
  // transform all box coordinates
  var transformed_points = [X.matrix.multiplyByVector(object._transform._matrix, A[0], A[1], A[2]),
    X.matrix.multiplyByVector(object._transform._matrix, B[0], B[1], B[2]),
    X.matrix.multiplyByVector(object._transform._matrix, C[0], C[1], C[2]),
    X.matrix.multiplyByVector(object._transform._matrix, D[0], D[1], D[2]),
    X.matrix.multiplyByVector(object._transform._matrix, E[0], E[1], E[2]),
    X.matrix.multiplyByVector(object._transform._matrix, F[0], F[1], F[2]),
    X.matrix.multiplyByVector(object._transform._matrix, G[0], G[1], G[2]),
    X.matrix.multiplyByVector(object._transform._matrix, H[0], H[1], H[2])];

  // now create a bigger bounding box around the maybe rotated box
  // by finding x_min, x_max, y_min, y_max, z_min, z_max
  var extremes = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
  for (var t in transformed_points) {

    t = transformed_points[t];

    extremes = [Math.min(extremes[0], t.x), 
                Math.max(extremes[1], t.x), 
                Math.min(extremes[2], t.y), 
                Math.max(extremes[3], t.y), 
                Math.min(extremes[4], t.z), 
                Math.max(extremes[5], t.z)];

  }


  // var minA = X.matrix.multiplyByVector(object._transform.matrix, object._points._minA, 0, 0);
  // var maxA = X.matrix.multiplyByVector(object._transform.matrix, object._points._maxA, 0, 0);
  // var minB = X.matrix.multiplyByVector(object._transform.matrix, 0, object._points._minB, 0);
  // var maxB = X.matrix.multiplyByVector(object._transform.matrix, 0, object._points._maxB, 0);
  // var minC = X.matrix.multiplyByVector(object._transform.matrix, 0, 0, object._points._minC);
  // var maxC = X.matrix.multiplyByVector(object._transform.matrix, 0, 0, object._points._maxC);
  //var box = [object._points._minA, object._points._maxA, object._points._minB, object._points._maxB, object._points._minC, object._points._maxC];
  //var box = [minA.x, maxA.x, minB.y, maxB.y, minC.z, maxC.z];
  var box = extremes;


  //console.log(box);
  var box_intersections = this.ray_intersect_box_(box, ray_near, ray_far);
  //console.log(box_intersections);
  box_intersections = box_intersections[0];
  // we should always have two intersections
  // find the closest one..
  if (box_intersections.length == 0) {
    //console.log('w')
    return null;
  }

  var distances = new Array(2);
  for (var i=0; i<2; i++) {
    var p = box_intersections[i];
    distances[i] = Math.sqrt((p[0]-ray_near[0])*(p[0]-ray_near[0])+(p[1]-ray_near[1])*(p[1]-ray_near[1])+(p[2]-ray_near[2])*(p[2]-ray_near[2]));
  }

  // now we need to sample the space between the two points
  var sample_start = null;
  var sample_end = null;
  var sample_space = null;

  if (distances[0] < distances[1]) {
    sample_start = box_intersections[0];
    sample_end = box_intersections[1];
  } else {
    sample_start = box_intersections[1];
    sample_end = box_intersections[0];
  }

  sample_space = Math.sqrt((sample_start[0]-sample_end[0])*(sample_start[0]-sample_end[0])+(sample_start[1]-sample_end[1])*(sample_start[1]-sample_end[1])+(sample_start[2]-sample_end[2])*(sample_start[2]-sample_end[2]));

  var sample_count = sample_space/delta;
  var s_p = sample_start;
  var sample_direction = [sample_end[0]-sample_start[0],sample_end[1]-sample_start[1],sample_end[2]-sample_start[2]];
  var sample_direction_length = Math.sqrt(sample_direction[0]*sample_direction[0]+sample_direction[1]*sample_direction[1]+sample_direction[2]*sample_direction[2]);
  var sample_unit_v = [sample_direction[0]/sample_direction_length, sample_direction[1]/sample_direction_length, sample_direction[2]/sample_direction_length];

  var points = object._points._triplets;
  var points_count = points.length;

  var min_d = Infinity;
  var min_p = null;

  var sampled = new Array(10);

  //var m_i = X.matrix.identity();
  //X.matrix.invert(object.transform.matrix, m_i);

  // sample
  for (var i=0; i<sample_count; i+=delta) {

    // the marching point
    // 
    s_p = [s_p[0] + delta*sample_unit_v[0], s_p[1] + delta*sample_unit_v[1], s_p[2] + delta*sample_unit_v[2]];

    // multiply s_p with the inverse transformation matrix
    // s_p = X.matrix.multiplyByVector(m_i, s_p);
    // s_p = [s_p.x, s_p.y, s_p.z];

    // find the closest point
    for (var p=0; p<points_count; p+=3) {

      var c_p_x = points[p];
      var c_p_y = points[p+1];
      var c_p_z = points[p+2];
      var c_p = new X.vector(c_p_x, c_p_y, c_p_z);
      c_p = X.matrix.multiplyByVector(object._transform._matrix, c_p_x, c_p_y, c_p_z);

      // calculate distance to the marching point
      var d = Math.sqrt((s_p[0]-c_p.x)*(s_p[0]-c_p.x)+(s_p[1]-c_p.y)*(s_p[1]-c_p.y)+(s_p[2]-c_p.z)*(s_p[2]-c_p.z));

      if (d <= epsilon) {

        // found the point
        return [c_p.x, c_p.y, c_p.z];

      }

    }

  }

  // nothing found with the current delta and epsilon settings
  return null;

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer3D', X.renderer3D);
goog.exportSymbol('X.renderer3D.prototype.init', X.renderer3D.prototype.init);
goog.exportSymbol('X.renderer3D.prototype.add', X.renderer3D.prototype.add);
goog.exportSymbol('X.renderer3D.prototype.onShowtime',
    X.renderer3D.prototype.onShowtime);
goog.exportSymbol('X.renderer3D.prototype.onRender',
    X.renderer3D.prototype.onRender);
goog.exportSymbol('X.renderer3D.prototype.get', X.renderer3D.prototype.get);
goog.exportSymbol('X.renderer3D.prototype.render',
    X.renderer3D.prototype.render);
goog.exportSymbol('X.renderer3D.prototype.destroy',
    X.renderer3D.prototype.destroy);
goog.exportSymbol('X.renderer3D.prototype.remove',
    X.renderer3D.prototype.remove);
goog.exportSymbol('X.renderer3D.prototype.resetBoundingBox',
    X.renderer3D.prototype.resetBoundingBox);
goog.exportSymbol('X.renderer3D.prototype.resetViewAndRender',
    X.renderer3D.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer3D.prototype.pick', X.renderer3D.prototype.pick);
goog.exportSymbol('X.renderer3D.prototype.pick3d', X.renderer3D.prototype.pick3d);
goog.exportSymbol('X.renderer3D.prototype.afterRender', X.renderer3D.prototype.afterRender);
goog.exportSymbol('X.renderer3D.prototype.resize', X.renderer3D.prototype.resize);
