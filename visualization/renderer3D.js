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
goog.require('X.camera');
goog.require('X.caption');
goog.require('X.interactor3D');
goog.require('X.matrix');
goog.require('X.renderer');
goog.require('X.shaders');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('goog.structs.Map');



/**
 * Create a 3D renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.renderer
 */
X.renderer3D = function(container) {

  //
  // call the standard constructor of X.renderer
  goog.base(this, container);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'renderer3D';
  
  /**
   * The shader pair for this renderer.
   * 
   * @type {?X.shaders}
   * @protected
   */
  this.shaders = null;
  
  /**
   * The compiled shader program of this renderer.
   * 
   * @type {?Object}
   * @protected
   */
  this.shaderProgram = null;
  
  /**
   * The minimum X value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.minX = null;
  
  /**
   * The maximum X value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.maxX = null;
  
  /**
   * The minimum Y value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.minY = null;
  
  /**
   * The maximum Y value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.maxY = null;
  
  /**
   * The minimum Z value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.minZ = null;
  
  /**
   * The maximum Z value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this.maxZ = null;
  
  /**
   * The center of the global bounding box in 3D space.
   * 
   * @type {!Array}
   * @protected
   */
  this.center = [0, 0, 0];
  
  /**
   * The frame buffer which is used for picking.
   * 
   * @type {Object}
   * @protected
   */
  this.pickFrameBuffer = null;
  
  /**
   * A hash map of shader attribute pointers.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.attributePointers = new goog.structs.Map();
  
  /**
   * A hash map of shader uniform locations.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.uniformLocations = new goog.structs.Map();
  
  /**
   * A hash map of vertex buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.vertexBuffers = new goog.structs.Map();
  
  /**
   * A hash map of normal buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.normalBuffers = new goog.structs.Map();
  
  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.colorBuffers = new goog.structs.Map();
  
  /**
   * A hash map of scalar buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.scalarBuffers = new goog.structs.Map();
  
  /**
   * A hash map of texture position buffers of this renderer. Each buffer is
   * associated with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.texturePositionBuffers = new goog.structs.Map();
  
  /**
   * A hash map of different textures assigned to this renderer. The maximum
   * number of textures is limited to 32 by WebGL.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this.textures = new goog.structs.Map();
  
  /**
   * The configuration of this renderer.
   * 
   * @enum {boolean}
   */
  this['config'] = {
    'PROGRESSBAR_ENABLED': true,
    'PICKING_ENABLED': true,
    'ORDERING_ENABLED': true,
    'STATISTICS_ENABLED': false
  };
  
};
// inherit from X.renderer
goog.inherits(X.renderer3D, X.renderer);


/**
 * Reset the global bounding box for all objects to undefined and reset the
 * center to 0,0,0. This can be useful before calling X.object.modified() on all
 * objects after transforms etc. which then re-calculates the global bounding
 * box.
 * 
 * @public
 */
X.renderer3D.prototype.resetBoundingBox = function() {

  this.minX = null;
  this.maxX = null;
  this.minY = null;
  this.maxY = null;
  this.minZ = null;
  this.maxZ = null;
  
  this.center = [0, 0, 0];
  
};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.onHover = function(event) {

  goog.base(this, 'onHover', event);
  
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
    
    this.context.viewport(0, 0, this['width'], this['height']);
    
    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the container color
    this.context.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable transparency
    this.context.enable(this.context.BLEND);
    this.context.blendEquation(this.context.FUNC_ADD);
    this.context.blendFunc(this.context.SRC_ALPHA,
        this.context.ONE_MINUS_SRC_ALPHA);
    // this.context.blendFuncSeparate(this.context.SRC_ALPHA,
    // this.context.ONE_MINUS_SRC_ALPHA, this.context.ONE,
    // this.context.ZERO);
    // this.context.blendFunc(this.context.DST_COLOR, this.context.ZERO);
    // this.context.blendFunc(this.context.ONE_MINUS_SRC_ALPHA,
    // this.context.SRC_ALPHA);
    // // enable depth testing
    this.context.enable(this.context.DEPTH_TEST);
    // // this.context.polygonOffset(1.0, 1.0);
    // // .. with perspective rendering
    this.context.depthFunc(this.context.LEQUAL);
    //    
    

    // clear color and depth buffer
    this.context.clear(this.context.COLOR_BUFFER_BIT |
        this.context.DEPTH_BUFFER_BIT);
    
    if (this['config']['PICKING_ENABLED']) {
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
      var pickFrameBuffer = this.context.createFramebuffer();
      var pickRenderBuffer = this.context.createRenderbuffer();
      var pickTexture = this.context.createTexture();
      
      this.context.bindTexture(this.context.TEXTURE_2D, pickTexture);
      
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGB,
          this['width'], this['height'], 0, this.context.RGB,
          this.context.UNSIGNED_BYTE, null);
      
      this.context.bindFramebuffer(this.context.FRAMEBUFFER, pickFrameBuffer);
      this.context
          .bindRenderbuffer(this.context.RENDERBUFFER, pickRenderBuffer);
      this.context.renderbufferStorage(this.context.RENDERBUFFER,
          this.context.DEPTH_COMPONENT16, this['width'], this['height']);
      this.context.bindRenderbuffer(this.context.RENDERBUFFER, null);
      
      this.context.framebufferTexture2D(this.context.FRAMEBUFFER,
          this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, pickTexture,
          0);
      this.context.framebufferRenderbuffer(this.context.FRAMEBUFFER,
          this.context.DEPTH_ATTACHMENT, this.context.RENDERBUFFER,
          pickRenderBuffer);
      this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
      
      this.pickFrameBuffer = pickFrameBuffer;
      
    }
    
  } catch (e) {
    
    // this exception indicates if the browser supports WebGL
    throw new Error('Exception while accessing GL Context!\n' + e);
    
  }
  
  //
  // WebGL Viewport initialization done
  // --------------------------------------------------------------------------
  

  //
  // create a new camera
  // width and height are required to calculate the perspective
  var _camera = new X.camera(this['width'], this['height']);
  // observe the interactor for user interactions (mouse-movements etc.)
  _camera.observe(this['interactor']);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  goog.events.listen(_camera, X.event.events.RENDER, this.render_.bind(this,
      false, false));
  
  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this['camera'] = _camera;
  
  //
  // add default shaders to this renderer
  // it is possible to attach other custom shaders after this init call
  // also, this has to happen after this['canvas'], this.context and
  // this['camera']
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
  if (!goog.isDefAndNotNull(this['canvas']) ||
      !goog.isDefAndNotNull(this.context) ||
      !goog.isDefAndNotNull(this['camera'])) {
    
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
  var _glFragmentShader = this.context
      .createShader(this.context.FRAGMENT_SHADER);
  var _glVertexShader = this.context.createShader(this.context.VERTEX_SHADER);
  
  // attach the sources, defined in the shaders pair
  this.context.shaderSource(_glFragmentShader, shaders.fragment());
  this.context.shaderSource(_glVertexShader, shaders.vertex());
  
  // start compilation
  this.context.compileShader(_glFragmentShader);
  this.context.compileShader(_glVertexShader);
  
  if (!this.context.getShaderParameter(_glFragmentShader,
      this.context.COMPILE_STATUS)) {
    
    throw new Error('Fragement Shader compilation failed!\n' +
        this.context.getShaderInfoLog(_glFragmentShader));
    
  }
  
  if (!this.context.getShaderParameter(_glVertexShader,
      this.context.COMPILE_STATUS)) {
    
    throw new Error('Vertex Shader compilation failed!\n' +
        this.context.getShaderInfoLog(_glVertexShader));
    
  }
  
  // create a shaderProgram, attach the shaders and link'em all together
  var _shaderProgram = this.context.createProgram();
  this.context.attachShader(_shaderProgram, _glVertexShader);
  this.context.attachShader(_shaderProgram, _glFragmentShader);
  this.context.linkProgram(_shaderProgram);
  
  if (!this.context.getProgramParameter(_shaderProgram,
      this.context.LINK_STATUS)) {
    
    throw new Error('Could not create shader program!\n' +
        this.context.getShaderInfoLog(_glFragmentShader) + '\n' +
        this.context.getShaderInfoLog(_glVertexShader) + '\n' +
        this.context.getProgramInfoLog(_shaderProgram));
    
  }
  
  // activate the new shaderProgram
  this.context.useProgram(_shaderProgram);
  
  // attach the shaderProgram to this renderer
  this.shaderProgram = _shaderProgram;
  
  // store the pointers to the shaders' attributes
  var _attributes = Object.keys(X.shaders.attributes);
  
  _attributes.forEach(function(a) {

    a = eval("X.shaders.attributes." + a);
    this.attributePointers.set(a, this.context.getAttribLocation(
        this.shaderProgram, a));
    this.context.enableVertexAttribArray(this.attributePointers.get(a));
    
  }.bind(this));
  
  // store the pointers to the shaders' uniforms
  var _uniforms = Object.keys(X.shaders.uniforms);
  
  _uniforms.forEach(function(u) {

    u = eval("X.shaders.uniforms." + u);
    this.uniformLocations.set(u, this.context.getUniformLocation(
        this.shaderProgram, u));
    
  }.bind(this));
  
  // finally, attach the shaders to this renderer
  this.shaders = shaders;
  
};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);
  
  // check if object already existed..
  var existed = false;
  
  if (this.get(object['_id'])) {
    // this means, we are updating
    existed = true;
    
  }
  
  var id = object['_id'];
  var points = object._points;
  var normals = object._normals;
  var colors = object._colors;
  var texture = object._texture;
  var file = object._file;
  var transform = object._transform;
  var colorTable = object._colorTable;
  var labelMap = object._labelMap; // here we access directly since we do not
  // want to create one using the labelMap() singleton accessor
  var scalars = object._scalars; // same direct access policy
  
  //
  // LABEL MAP
  //
  if (goog.isDefAndNotNull(labelMap) && goog.isDefAndNotNull(labelMap._file) &&
      labelMap._file._dirty) {
    // a labelMap file is associated to this object and it is dirty..
    // background: we always want to parse label maps first
    
    // run the update_ function on the labelMap object
    this.update_(labelMap);
    
    // jump out
    return;
    
  }
  
  // here we check if additional loading is necessary
  // this would be the case if
  // a) the object has an external texture
  // b) the object is based on an external file (vtk, stl...)
  // in these cases, we do not directly update the object but activate the
  // X.loader to get the externals and then let it call the update method
  if (goog.isDefAndNotNull(colorTable) &&
      goog.isDefAndNotNull(colorTable._file) && colorTable._file._dirty) {
    // a colorTable file is associated to this object and it is dirty..
    
    // start loading
    this.loader.loadColorTable(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(texture) &&
      goog.isDefAndNotNull(texture._file) && texture._file._dirty) {
    // a texture file is associated to this object and it is dirty..
    
    // start loading..
    this.loader.loadTexture(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(scalars) &&
      goog.isDefAndNotNull(scalars._file) && scalars._file._dirty) {
    // a scalars container is associated to this object and it's associated file
    // is dirty
    
    // start loading
    this.loader.loadScalars(object);
    
    return;
    
  }
  
  // MULTI OBJECTS
  //
  // objects can have N child objects which again can have M child objects and
  // so on
  //
  // check if this object has children
  if (object._dirty && object.children().length > 0) {
    
    // loop through the children and recursively setup the object
    var children = object.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      this.update_(children[c]);
      
    }
    
  }
  
  // check if this is an empty object, if yes, jump out
  // empty objects can be used to group objects
  if (points.count() == 0) {
    
    object.setClean();
    return;
    
  }
  

  // a simple locking mechanism to prevent multiple calls when using
  // asynchronous requests
  var counter = 0;
  while (this.locked) {
    
    // wait
    counter++;
    window.console.log('Possible thread lock avoided: ' + counter);
    
  }
  
  this.locked = true;
  
  //
  // LOCKED DOWN: ACTION!!
  //
  // This gets executed after all dynamic content has been loaded.
  
  // check if this is an X.slice as part of a X.labelMap
  var isLabelMap = (object instanceof X.slice && object._volume instanceof X.labelMap);
  
  //
  // TEXTURE
  //
  
  if (existed && goog.isDefAndNotNull(texture) && texture._dirty) {
    
    // this means the object already existed and the texture is dirty
    // therefore, we delete the old gl buffers
    
    var oldTexturePositionBuffer = this.texturePositionBuffers.get(id);
    if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {
      
      if (this.context.isBuffer(oldTexturePositionBuffer._glBuffer)) {
        
        this.context.deleteBuffer(oldTexturePositionBuffer._glBuffer);
        
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
      
      // setup the glTexture, at this point the image for the texture was
      // already
      // loaded thanks to X.loader
      var glTexture = this.context.createTexture();
      
      // connect the image and the glTexture
      glTexture.image = texture._image;
      
      //
      // activate the texture on the WebGL side
      this.textures.set(texture['_id'], glTexture);
      
      this.context.bindTexture(this.context.TEXTURE_2D, glTexture);
      if (texture._rawData) {
        
        // use rawData rather than loading an imagefile
        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA,
            texture.rawDataWidth(), texture.rawDataHeight(), 0,
            this.context.RGBA, this.context.UNSIGNED_BYTE, texture._rawData);
        
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
        
        // we do not want to flip here
        this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
        
      } else {
        
        // use an imageFile for the texture
        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA,
            this.context.RGBA, this.context.UNSIGNED_BYTE, glTexture.image);
        
        this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, false);
        
      }
      
      // for labelMaps, we use NEAREST NEIGHBOR filtering
      if (isLabelMap) {
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
      } else {
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
        this.context.texParameteri(this.context.TEXTURE_2D,
            this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
      }
      
      // release the texture binding to clear things
      this.context.bindTexture(this.context.TEXTURE_2D, null);
      
      // create texture buffer
      var glTexturePositionBuffer = this.context.createBuffer();
      
      // bind and fill with colors defined above
      this.context.bindBuffer(this.context.ARRAY_BUFFER,
          glTexturePositionBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(
          textureCoordinateMap), this.context.STATIC_DRAW);
      
      // create an X.buffer to store the texture-coordinate map
      texturePositionBuffer = new X.buffer(glTexturePositionBuffer,
          textureCoordinateMap.length, 2);
      
      texture.setClean();
      
    } else {
      
      // the texture is not dirty and the object already existed, so use the old
      // buffer
      texturePositionBuffer = this.texturePositionBuffers.get(id);
      
    }
    
    // dirty check
    
  } // check if object has a texture
  
  this.loader.addProgress(0.1);
  
  //
  // SPECIAL CASE: LABELMAPS
  // 
  
  // since we now have labelMap support, we process the textures (which is the
  // only essential of labelMaps) first and ..
  
  // .. jump out if this is part of a labelMap
  if (isLabelMap) {
    
    this.locked = false; // we gotta unlock here already
    
    this.loader.addProgress(0.9); // add the missing progress
    
    return; // sayonara
    
    // this prevents storing of not required buffers, objects etc. since the
    // labelMaps are only pseudo X.objects and never rendered directly but
    // merged into an X.volume
    
  }
  

  //
  // BOUNDING BOX
  //
  // The global bounding incorporates all individual bounding boxes of the
  // objects. This bounding box only changes if either the points or the
  // transform are dirty.
  if (points._dirty || transform._dirty) {
    var transformationMatrix = transform.matrix();
    
    var tMin = transformationMatrix.multiplyByVector(new goog.math.Vec3(points
        .minA(), points.minB(), points.minC()));
    var tMax = transformationMatrix.multiplyByVector(new goog.math.Vec3(points
        .maxA(), points.maxB(), points.maxC()));
    
    if (goog.isNull(this.minX) || tMin.x < this.minX) {
      this.minX = tMin.x;
    }
    if (goog.isNull(this.maxX) || tMax.x > this.maxX) {
      this.maxX = tMax.x;
    }
    if (goog.isNull(this.minY) || tMin.y < this.minY) {
      this.minY = tMin.y;
    }
    if (goog.isNull(this.maxY) || tMax.y > this.maxY) {
      this.maxY = tMax.y;
    }
    if (goog.isNull(this.minZ) || tMin.z < this.minZ) {
      this.minZ = tMin.z;
    }
    if (goog.isNull(this.maxZ) || tMax.z > this.maxZ) {
      this.maxZ = tMax.z;
    }
    // we always keep track of the current center position
    this.center = [(this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2,
                   (this.minZ + this.maxZ) / 2];
    
    // only set the transform clean since we still need to look at the points
    transform.setClean();
  }
  

  //
  // VERTICES
  //
  
  if (existed && points._dirty) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old vertex buffer
    var oldVertexBuffer = this.vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldVertexBuffer)) {
      
      if (this.context.isBuffer(oldVertexBuffer._glBuffer)) {
        
        this.context.deleteBuffer(oldVertexBuffer._glBuffer);
        
      }
      
    }
    
  }
  
  var vertexBuffer = null;
  
  if (!existed || points._dirty) {
    
    // the object either did not exist or the points are dirty, so we re-create
    // the gl buffers and reset the bounding box
    
    var glVertexBuffer = this.context.createBuffer();
    
    // bind and fill with vertices of current object
    this.context.bindBuffer(this.context.ARRAY_BUFFER, glVertexBuffer);
    
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(points
        .all()), this.context.STATIC_DRAW);
    
    // create an X.buffer to store the vertices
    // every vertex consists of 3 items (x,y,z)
    vertexBuffer = new X.buffer(glVertexBuffer, points.count(), 3);
    
    points.setClean();
    
  } else {
    
    // the points are not dirty and the object already existed, so use the old
    // buffer
    vertexBuffer = this.vertexBuffers.get(id);
    
  }
  
  this.loader.addProgress(0.3);
  

  //
  // NORMALS
  //
  
  if (existed && normals._dirty) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old normals buffer
    var oldNormalBuffer = this.vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldNormalBuffer)) {
      
      if (this.context.isBuffer(oldNormalBuffer._glBuffer)) {
        
        this.context.deleteBuffer(oldNormalBuffer._glBuffer);
        
      }
      
    }
    
  }
  
  var normalBuffer = null;
  
  if (!existed || normals._dirty) {
    
    // the object either did not exist or the normals are dirty, so we re-create
    // the gl buffers
    
    var glNormalBuffer = this.context.createBuffer();
    
    // bind and fill with normals of current object
    this.context.bindBuffer(this.context.ARRAY_BUFFER, glNormalBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(normals
        .all()), this.context.STATIC_DRAW);
    
    // create an X.buffer to store the normals
    // every normal consists of 3 items (x,y,z)
    normalBuffer = new X.buffer(glNormalBuffer, normals.count(), 3);
    
    normals.setClean();
    
  } else {
    
    // the normals are not dirty and the object already existed, so use the old
    // buffer
    normalBuffer = this.normalBuffers.get(id);
    
  }
  
  // update progress
  this.loader.addProgress(0.3);
  

  //
  // COLORS
  //
  // Objects can have point colors which can be different for each fragment.
  // If no point colors are defined, the object has a solid color.
  
  if (existed && colors._dirty) {
    
    // this means the object already existed and the colors are dirty
    // therefore, we delete the old gl buffers
    
    var oldColorBuffer = this.colorBuffers.get(id);
    if (goog.isDefAndNotNull(oldColorBuffer)) {
      
      if (this.context.isBuffer(oldColorBuffer._glBuffer)) {
        
        this.context.deleteBuffer(oldColorBuffer._glBuffer);
        
      }
      
    }
  }
  
  // check if we have point colors, then we need to setup the glBuffer and the
  // X.buffer
  var colorBuffer = null;
  
  if (colors.length() > 0) {
    
    // yes, there are point colors setup
    
    if (!existed || colors._dirty) {
      
      // the object either did not exist or the colors are dirty, so we
      // re-create the gl buffers
      
      // check if the point colors are valid, note that we use the length for
      // this
      // check which is slightly faster!
      if (colors.length() != points.length()) {
        
        // mismatch, this can not work
        throw new Error('Mismatch between points and point colors.');
        
      }
      var glColorBuffer = this.context.createBuffer();
      
      // bind and fill with colors defined above
      this.context.bindBuffer(this.context.ARRAY_BUFFER, glColorBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(
          colors.all()), this.context.STATIC_DRAW);
      
      // create an X.buffer to store the colors
      // every color consists of 3 items (r,g,b)
      colorBuffer = new X.buffer(glColorBuffer, colors.count(), 3);
      
      colors.setClean();
      
    } else {
      
      // the colors are not dirty and the object already existed, so use the old
      // buffer
      colorBuffer = this.colorBuffers.get(id);
      
    }
    
  }
  
  this.loader.addProgress(0.2);
  

  //
  // SCALARS
  //
  // Objects can have scalars attached to each vertex.
  
  if (existed && scalars && scalars._dirty) {
    
    // this means the object already existed and the scalars are dirty
    // therefore, we delete the old gl buffers
    
    var oldScalarBuffer = this.scalarBuffers.get(id);
    if (goog.isDefAndNotNull(oldScalarBuffer)) {
      
      if (this.context.isBuffer(oldScalarBuffer._glBuffer)) {
        
        this.context.deleteBuffer(oldScalarBuffer._glBuffer);
        
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
      if (scalarsArray.length != points.length()) {
        
        // mismatch, this can not work
        throw new Error('Mismatch between points and scalars.');
        
      }
      var glScalarBuffer = this.context.createBuffer();
      
      // bind and fill with colors defined above
      this.context.bindBuffer(this.context.ARRAY_BUFFER, glScalarBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(
          scalarsArray), this.context.STATIC_DRAW);
      
      // create an X.buffer to store the colors
      // every scalar consists of 1 item
      scalarBuffer = new X.buffer(glScalarBuffer, scalarsArray.length, 3);
      
      scalars.setClean();
      
    } else {
      
      // the colors are not dirty and the object already existed, so use the old
      // buffer
      scalarBuffer = this.scalarBuffers.get(id);
      
    }
    
  }
  
  this.loader.addProgress(0.1);
  

  //
  // FINAL STEPS
  //
  
  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!existed) {
    this.objects.add(object);
  }
  
  // add the buffers for the object to the internal hash maps
  // at this point the buffers are: either null (if possible), a newly generated
  // one or an old one
  this.vertexBuffers.set(id, vertexBuffer);
  this.normalBuffers.set(id, normalBuffer);
  this.colorBuffers.set(id, colorBuffer);
  this.texturePositionBuffers.set(id, texturePositionBuffer);
  this.scalarBuffers.set(id, scalarBuffer);
  
  // clean the object
  object.setClean();
  
  // unlock
  this.locked = false;
  
};


/**
 * Show the caption of the X.object at viewport position x,y. This performs
 * object picking and shows a tooltip if an object with a caption exists at this
 * position.
 * 
 * @param {number} x
 * @param {number} y
 */
X.renderer3D.prototype.showCaption_ = function(x, y) {

  var pickedId = this.pick(x, y);
  
  var object = this.get(pickedId);
  
  if (object) {
    
    var caption = object.caption();
    
    if (caption) {
      
      var t = new X.caption(this['container'], this['container'].offsetLeft +
          x + 10, this['container'].offsetTop + y + 10, this['interactor']);
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

  // TODO once we have arbitary sliced volumes, we need to modify the vectors
  // here
  var centroidVector = new goog.math.Vec3(1, 0, 0);
  var realCentroidVector = this['camera'].view().multiplyByVector(
      centroidVector);
  var distanceFromEyeX = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  centroidVector = new goog.math.Vec3(-1, 0, 0);
  realCentroidVector = this['camera'].view().multiplyByVector(centroidVector);
  var distanceFromEyeX2 = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  
  centroidVector = new goog.math.Vec3(0, 1, 0);
  realCentroidVector = this['camera'].view().multiplyByVector(centroidVector);
  var distanceFromEyeY = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  centroidVector = new goog.math.Vec3(0, -1, 0);
  realCentroidVector = this['camera'].view().multiplyByVector(centroidVector);
  var distanceFromEyeY2 = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  
  centroidVector = new goog.math.Vec3(0, 0, 1);
  realCentroidVector = this['camera'].view().multiplyByVector(centroidVector);
  var distanceFromEyeZ = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  centroidVector = new goog.math.Vec3(0, 0, -1);
  realCentroidVector = this['camera'].view().multiplyByVector(centroidVector);
  var distanceFromEyeZ2 = goog.math.Vec3.distance(this['camera']._position,
      realCentroidVector);
  
  var maxDistance = Math
      .max(distanceFromEyeX, distanceFromEyeY, distanceFromEyeZ,
          distanceFromEyeX2, distanceFromEyeY2, distanceFromEyeZ2);
  
  if (maxDistance == distanceFromEyeX || maxDistance == distanceFromEyeX2) {
    volume.volumeRendering_(0);
  } else if (maxDistance == distanceFromEyeY ||
      maxDistance == distanceFromEyeY2) {
    volume.volumeRendering_(1);
  } else if (maxDistance == distanceFromEyeZ ||
      maxDistance == distanceFromEyeZ2) {
    volume.volumeRendering_(2);
  }
  
};


X.renderer3D.prototype.distanceToEye_ = function(object) {

  var centroid = object._points._centroid;
  var centroidVector = new goog.math.Vec3(centroid[0], centroid[1], centroid[2]);
  var transformedCentroidVector = object._transform._matrix
      .multiplyByVector(centroidVector);
  var realCentroidVector = this['camera']._view
      .multiplyByVector(transformedCentroidVector);
  var distanceFromEye = goog.math.Vec3.distance(this['camera']._position,
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
  
  var topLevelObjects = this.topLevelObjects;
  var numberOfTopLevelObjects = topLevelObjects.length;
  var t;
  t = numberOfTopLevelObjects - 1;
  do {
    
    var object = topLevelObjects[t];
    
    // special case for X.volumes in volumeRendering mode
    // a) we know the volumeRendering direction and the center of the volume
    // b) based on this we can minimize the expensive distance calculation to
    // the first and last slices
    // c) .. and get the distance for the other slices by simple multiplication
    if (object instanceof X.volume && object['_volumeRendering']) {
      
      var _volumeRenderingDirection = object._volumeRenderingDirection;
      
      var _slices = object._slicesX.children();
      if (_volumeRenderingDirection == 1) {
        _slices = object._slicesY.children();
      } else if (_volumeRenderingDirection == 2) {
        _slices = object._slicesZ.children();
      }
      
      var numberOfSlices = _slices.length;
      
      // grab the first slice, attach the distance and opacity
      var firstSlice = _slices[0];
      firstSlice._distance = this.distanceToEye_(firstSlice);
      firstSlice['_opacity'] = object['_opacity'];
      
      // grab the last slice, attach the distance and opacity
      var lastSlice = _slices[numberOfSlices - 1];
      lastSlice._distance = this.distanceToEye_(lastSlice);
      lastSlice['_opacity'] = object['_opacity'];
      
      // get the distanceDifference the distanceStep
      // if these are > 0: the firstSlice is closer to the eye
      // if these are < 0: the lastSlice is closer to the eye
      var distanceDifference = lastSlice._distance - firstSlice._distance;
      var distanceStep = Math
          .round((distanceDifference / numberOfSlices) * 1000) / 1000;
      
      // loop through all other slices in the volumeRendering direction and
      // calculate the distance and attach the opacity
      var s = 1;
      for (s = 1; s < numberOfSlices - 1; s++) {
        
        var currentDistance = Math
            .round((firstSlice._distance + (s * distanceStep)) * 1000) / 1000;
        
        _slices[s]._distance = currentDistance;
        _slices[s]['_opacity'] = object['_opacity'];
        
      }
      
      // we need to update the rendering order
      reSortRequired = true;
      
    }
    
  } while (t--);
  
  var objects = this.objects.values();
  var numberOfObjects = objects.length;
  
  var i;
  i = numberOfObjects - 1;
  do {
    
    var object = objects[i];
    
    if (!object['_visible']) {
      continue;
    }
    
    // the following cases do not need to be calculated
    // a) opacity is 1
    // b) object is an X.slice since we take care of that when grabbing the
    // volume
    if ((object['_opacity'] == 1) || (object instanceof X.slice)) {
      
      continue;
      
    }
    
    // attach the distance from the eye to the object
    object._distance = this.distanceToEye_(object);
    
    // we need to update the rendering order
    reSortRequired = true;
    
  } while (i--);
  
  // only re-sort the tree if required
  if (reSortRequired) {
    
    this.objects.sort();
    
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

  if (this['config']['PICKING_ENABLED']) {
    
    // render again with picking turned on which renders the scene in a
    // framebuffer
    this.render_(true, false);
    
    // grab the content of the framebuffer
    var data = new Uint8Array(4);
    this.context.readPixels(x, this['height'] - y, 1, 1, this.context.RGBA,
        this.context.UNSIGNED_BYTE, data);
    
    // grab the id
    var r = Math.round(data[0] / 255 * 10);
    var g = Math.round(data[1] / 255 * 10);
    var b = Math.round(data[2] / 255 * 10);
    
    return (r * 100 + g * 10 + b);
    
  } else {
    
    return -1;
    
  }
  
};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.render_ = function(picking, invoked) {

  // call the update_ method of the superclass
  goog.base(this, 'render_', picking, invoked);
  
  // only proceed if there are actually objects to render
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  if (picking) {
    
    // we are in picking mode, so use the framebuffer rather than the canvas
    this.context
        .bindFramebuffer(this.context.FRAMEBUFFER, this.pickFrameBuffer);
    
  } else {
    
    // disable the framebuffer
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    
  }
  
  // clear the canvas
  this.context.viewport(0, 0, this['width'], this['height']);
  this.context.clear(this.context.COLOR_BUFFER_BIT |
      this.context.DEPTH_BUFFER_BIT);
  
  // grab the current perspective from the camera
  var perspectiveMatrix = this['camera']._perspective;
  
  // grab the current view from the camera
  var viewMatrix = this['camera']._glView;
  
  // propagate perspective and view matrices to the uniforms of
  // the shader
  this.context.uniformMatrix4fv(this.uniformLocations
      .get(X.shaders.uniforms.PERSPECTIVE), false, perspectiveMatrix);
  
  this.context.uniformMatrix4fv(this.uniformLocations
      .get(X.shaders.uniforms.VIEW), false, viewMatrix);
  
  // propagate the objects' center to the shader
  //
  var center = this.center;
  this.context.uniform3f(this.uniformLocations.get(X.shaders.uniforms.CENTER),
      parseFloat(center[0]), parseFloat(center[1]), parseFloat(center[2]));
  
  //
  // orient volumes for proper volume rendering - if there are any,
  // this means, depending on the direction of the eye, we use the slice stack
  // of a specific axis to create the tiled texture
  var i;
  var topLevelObjectsLength = this.topLevelObjects.length;
  for (i = 0; i < topLevelObjectsLength; ++i) {
    var topLevelObject = this.topLevelObjects[i];
    if (topLevelObject instanceof X.volume) {
      this.orientVolume_(topLevelObject);
    }
  }
  
  //
  // re-order the objects, but only if enabled.
  // this ordering should be disabled if the objects' opacity settings are not
  // used or if a large number of objects are associated
  if (this['config']['ORDERING_ENABLED']) {
    
    this.order_();
    
  }
  
  var statisticsEnabled = (!picking && goog.isDefAndNotNull(invoked) && invoked && this['config']['STATISTICS_ENABLED']);
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
  var aPointers = this.attributePointers;
  var aPosition = aPointers.get(X.shaders.attributes.VERTEXPOSITION);
  var aNormal = aPointers.get(X.shaders.attributes.VERTEXNORMAL);
  var aColor = aPointers.get(X.shaders.attributes.VERTEXCOLOR);
  var aTexturePosition = aPointers.get(X.shaders.attributes.VERTEXTEXTUREPOS);
  var aScalar = aPointers.get(X.shaders.attributes.VERTEXSCALAR);
  
  var uLocations = this.uniformLocations;
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
  var uScalarsMinThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMINTHRESHOLD);
  var uScalarsMaxThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMAXTHRESHOLD);
  var uObjectOpacity = uLocations.get(X.shaders.uniforms.OBJECTOPACITY);
  var uLabelMapOpacity = uLocations.get(X.shaders.uniforms.LABELMAPOPACITY);
  var uUseTexture = uLocations.get(X.shaders.uniforms.USETEXTURE);
  var uUseTextureThreshold = uLocations
      .get(X.shaders.uniforms.USETEXTURETHRESHOLD);
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
      if (!object['_visible'] || (volume && !volume['_visible'])) {
        
        // not visible, continue to the next one..
        continue;
        
      }
      
      var id = object['_id'];
      
      var magicMode = object['_magicMode'];
      
      var vertexBuffer = this.vertexBuffers.get(id);
      var normalBuffer = this.normalBuffers.get(id);
      
      var colorBuffer = this.colorBuffers.get(id);
      var scalarBuffer = this.scalarBuffers.get(id);
      var texturePositionBuffer = this.texturePositionBuffers.get(id);
      
      // ..bind the glBuffers
      
      // VERTICES
      this.context
          .bindBuffer(this.context.ARRAY_BUFFER, vertexBuffer._glBuffer);
      
      this.context.vertexAttribPointer(aPosition, vertexBuffer._itemSize,
          this.context.FLOAT, false, 0, 0);
      
      // NORMALS
      this.context
          .bindBuffer(this.context.ARRAY_BUFFER, normalBuffer._glBuffer);
      
      this.context.vertexAttribPointer(aNormal, normalBuffer._itemSize,
          this.context.FLOAT, false, 0, 0);
      
      if (picking) {
        
        // in picking mode, we use a color based on the id of this object
        this.context.uniform1i(uUsePicking, true);
        
      } else {
        
        // in picking mode, we use a color based on the id of this object
        this.context.uniform1i(uUsePicking, false);
        
      }
      
      // COLORS
      if (colorBuffer && !picking && !magicMode) {
        
        // point colors are defined for this object and there is not picking
        // request and no magicMode active
        
        // de-activate the useObjectColor flag on the shader
        this.context.uniform1i(uUseObjectColor, false);
        
        this.context.bindBuffer(this.context.ARRAY_BUFFER,
            colorBuffer._glBuffer);
        
        this.context.vertexAttribPointer(aColor, colorBuffer._itemSize,
            this.context.FLOAT, false, 0, 0);
        
      } else {
        
        // we have a fixed object color or this is 'picking' mode
        var useObjectColor = 1;
        
        // some magic mode support
        if (magicMode && !picking) {
          
          useObjectColor = 0;
          
        }
        
        // activate the useObjectColor flag on the shader
        // in magicMode, this is always false!
        this.context.uniform1i(uUseObjectColor, useObjectColor);
        
        var objectColor = object['_color'];
        
        if (picking) {
          
          if (id > 999) {
            
            throw new Error('Id out of bounds.');
            
          }
          
          // split the id
          // f.e. 15:
          // r = 0 / 10
          // g = 1 / 10
          // b = 5 / 10
          var r = Math.floor(id * 0.01);
          var g = Math.floor(id * 0.1) - r * 10;
          var b = id - r * 100 - g * 10;
          
          // and set it as the color
          objectColor = [r / 10, g / 10, b / 10];
        }
        
        this.context.uniform3f(uObjectColor, parseFloat(objectColor[0]),
            parseFloat(objectColor[1]), parseFloat(objectColor[2]));
        
        // we always have to configure the attribute of the point colors
        // even if no point colors are in use
        this.context.vertexAttribPointer(aColor, vertexBuffer._itemSize,
            this.context.FLOAT, false, 0, 0);
        
      }
      
      // SCALARS
      if (scalarBuffer && !picking && !magicMode) {
        
        // scalars are defined for this object and there is not picking
        // request and no magicMode active
        
        // activate the useScalars flag on the shader
        this.context.uniform1i(uUseScalars, true);
        
        // propagate the replace flag
        this.context.uniform1i(uScalarsReplaceMode,
            object._scalars._replaceMode);
        
        var minColor = object._scalars['_minColor'];
        var maxColor = object._scalars['_maxColor'];
        
        // propagate minColors and maxColors for the scalars
        this.context.uniform3f(uScalarsMinColor, parseFloat(minColor[0]),
            parseFloat(minColor[1]), parseFloat(minColor[2]));
        this.context.uniform3f(uScalarsMaxColor, parseFloat(maxColor[0]),
            parseFloat(maxColor[1]), parseFloat(maxColor[2]));
        
        // propagate minThreshold and maxThreshold for the scalars
        this.context.uniform1f(uScalarsMinThreshold,
            parseFloat(object._scalars['_minThreshold']));
        this.context.uniform1f(uScalarsMaxThreshold,
            parseFloat(object._scalars['_maxThreshold']));
        
        // propagate min and max for the scalars
        this.context.uniform1f(uScalarsMin, parseFloat(object._scalars._min));
        this.context.uniform1f(uScalarsMax, parseFloat(object._scalars._max));
        

        this.context.bindBuffer(this.context.ARRAY_BUFFER,
            scalarBuffer._glBuffer);
        
        this.context.vertexAttribPointer(aScalar, scalarBuffer._itemSize,
            this.context.FLOAT, false, 0, 0);
        
      } else {
        
        // de-activate the useScalars flag on the shader
        this.context.uniform1i(uUseScalars, false);
        
        // we always have to configure the attribute of the scalars
        // even if no scalars are in use
        this.context.vertexAttribPointer(aScalar, vertexBuffer._itemSize,
            this.context.FLOAT, false, 0, 0);
        
      }
      
      // OPACITY
      this.context.uniform1f(uObjectOpacity, parseFloat(object['_opacity']));
      
      // TEXTURE
      if (object._texture && texturePositionBuffer && !picking) {
        //
        // texture associated to this object
        //
        
        // activate the texture flag on the shader
        this.context.uniform1i(uUseTexture, true);
        
        // setup the sampler
        
        // bind the texture
        this.context.activeTexture(this.context.TEXTURE0);
        
        // grab the texture from the internal hash map using the id as the
        // key
        this.context.bindTexture(this.context.TEXTURE_2D, this.textures
            .get(object._texture['_id']));
        this.context.uniform1i(uTextureSampler, 0);
        
        // propagate the current texture-coordinate-map to WebGL
        this.context.bindBuffer(this.context.ARRAY_BUFFER,
            texturePositionBuffer._glBuffer);
        
        this.context.vertexAttribPointer(aTexturePosition,
            texturePositionBuffer._itemSize, this.context.FLOAT, false, 0, 0);
        
        // by default, don't use thresholding
        this.context.uniform1i(uUseTextureThreshold, false);
        
      } else {
        
        // no texture for this object or 'picking' mode
        this.context.uniform1i(uUseTexture, false);
        
        // we always have to configure the attribute of the texture positions
        // even if no textures are in use
        this.context.vertexAttribPointer(aTexturePosition,
            vertexBuffer._itemSize, this.context.FLOAT, false, 0, 0);
        
      }
      
      // VOLUMES
      // several special values need to be passed to the shaders if the object
      // is a X.slice (part of an X.volume)
      // this is the case if we have a volume here..
      if (volume) {
        
        // enable texture thresholding for volumes
        this.context.uniform1i(uUseTextureThreshold, true);
        
        // pass the lower threshold
        this.context
            .uniform1f(uVolumeLowerThreshold, volume['_lowerThreshold']);
        // pass the upper threshold
        this.context
            .uniform1f(uVolumeUpperThreshold, volume['_upperThreshold']);
        
        // pass the scalar range
        var scalarRange = volume._scalarRange;
        this.context.uniform1f(uVolumeScalarMin, scalarRange[0]);
        this.context.uniform1f(uVolumeScalarMax, scalarRange[1]);
        
        // get the (optional) label map
        var labelMap = volume._labelMap;
        
        // no labelMap by default
        this.context.uniform1i(uUseLabelMapTexture, false);
        
        // opacity, only if volume rendering is active
        if (volume['_volumeRendering']) {
          
          this.context
              .uniform1f(uObjectOpacity, parseFloat(volume['_opacity']));
          
        } else if (labelMap && labelMap['_visible']) {
          // only if we have an associated labelMap..
          
          // grab the id of the labelMap
          var labelMapTextureID = object._labelMap['_id'];
          
          // we handle a second texture, actually the one for the labelMap
          this.context.uniform1i(uUseLabelMapTexture, true);
          
          // bind the texture
          this.context.activeTexture(this.context.TEXTURE1);
          
          // grab the texture from the internal hash map using the id as
          // the key
          this.context.bindTexture(this.context.TEXTURE_2D, this.textures
              .get(labelMapTextureID));
          this.context.uniform1i(uTextureSampler2, 1);
          
          // propagate label map opacity
          this.context.uniform1f(uLabelMapOpacity, labelMap['_opacity']);
          
        }
        
      }
      
      // TRANSFORMS
      // propagate transform to the uniform matrices of the shader
      this.context.uniformMatrix4fv(uObjectTransform, false,
          object._transform._glMatrix);
      
      // POINT SIZE
      var pointSize = 1;
      if (object['_type'] == X.object.types.POINTS) {
        pointSize = object['_pointSize'];
      }
      this.context.uniform1f(uPointSize, pointSize);
      
      //
      // .. and draw with the object's DRAW MODE
      //
      var drawMode = -1;
      if (object.type() == X.object.types.TRIANGLES) {
        
        drawMode = this.context.TRIANGLES;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      } else if (object.type() == X.object.types.LINES) {
        
        this.context.lineWidth(object.lineWidth());
        
        drawMode = this.context.LINES;
        if (statisticsEnabled) {
          linesCounter += (vertexBuffer._itemCount / 2);
        }
        
      } else if (object.type() == X.object.types.POINTS) {
        
        drawMode = this.context.POINTS;
        if (statisticsEnabled) {
          pointsCounter += vertexBuffer._itemCount;
        }
        
      } else if (object.type() == X.object.types.TRIANGLE_STRIPS) {
        
        drawMode = this.context.TRIANGLE_STRIP;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      } else if (object.type() == X.object.types.POLYGONS) {
        
        // TODO right now, this is hacked.. we need to use the Van Gogh
        // triangulation algorithm or something faster to properly convert
        // POLYGONS to TRIANGLES.
        // Remark: The Van Gogh algorithm is implemented in the
        // X.object.toCSG/fromCSG functions but not used here.
        if (vertexBuffer._itemCount % 3 == 0) {
          
          drawMode = this.context.TRIANGLES;
          
        } else {
          
          drawMode = this.context.TRIANGLE_FAN;
          
        }
        
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      }
      
      if (statisticsEnabled) {
        
        verticesCounter += vertexBuffer._itemCount;
        
      }
      
      // push it to the GPU, baby..
      this.context.drawArrays(drawMode, 0, vertexBuffer._itemCount);
      
    }
    
  } while (--i); // loop through objects
  
  if (statisticsEnabled) {
    
    var statistics = "Objects: " + _numberOfObjects + " | ";
    statistics += "Vertices: " + verticesCounter + " | ";
    statistics += "Triangles: " + Math.round(trianglesCounter) + " | ";
    statistics += "Lines: " + linesCounter + " | ";
    statistics += "Points: " + pointsCounter + " | ";
    statistics += "Textures: " + this.textures.getCount();
    window.console.log(statistics);
    
  }
  
};


/**
 * @inheritDoc
 */
X.renderer3D.prototype.destroy = function() {

  // remove all shaders
  this.shaders = null;
  delete this.shaders;
  
  // remove the gl context
  this.context.clear(this.context.COLOR_BUFFER_BIT |
      this.context.DEPTH_BUFFER_BIT);
  
  // call the destroy method of the superclass
  goog.base(this, 'destroy');
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer3D', X.renderer3D);
goog.exportSymbol('X.renderer3D.prototype.init', X.renderer3D.prototype.init);
goog.exportSymbol('X.renderer3D.prototype.add', X.renderer3D.prototype.add);
goog.exportSymbol('X.renderer3D.prototype.onShowtime',
    X.renderer3D.prototype.onShowtime);
goog.exportSymbol('X.renderer3D.prototype.get', X.renderer3D.prototype.get);
goog.exportSymbol('X.renderer3D.prototype.render',
    X.renderer3D.prototype.render);
goog.exportSymbol('X.renderer3D.prototype.destroy',
    X.renderer3D.prototype.destroy);
goog.exportSymbol('X.renderer3D.prototype.resetBoundingBox',
    X.renderer3D.prototype.resetBoundingBox);
goog.exportSymbol('X.renderer3D.prototype.resetViewAndRender',
    X.renderer3D.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer3D.prototype.pick', X.renderer3D.prototype.pick);
