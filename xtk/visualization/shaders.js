/*
 * ${HEADER}
 */

// provides
goog.provide('X.shaders');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * Create a pair of shaders which consists of a vertex and a fragment shader.
 * 
 * @constructor
 * @extends {X.base}
 */
X.shaders = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'shader';
  
  /**
   * The vertex shader source of this shader pair. By default, a basic shader
   * supporting vertex positions and vertex colors is defined.
   * 
   * @type {!string}
   * @protected
   */
  this._vertexshaderSource = '';
  var t = '';
  t += 'attribute vec3 vertexPosition;\n';
  t += 'attribute vec3 vertexNormal;\n';
  t += 'attribute vec3 vertexColor;\n';
  t += 'attribute vec2 vertexTexturePos;\n';
  t += '\n';
  t += 'uniform mat4 view;\n';
  t += 'uniform mat4 perspective;\n';
  t += 'uniform mat4 objectTransform;\n';
  t += 'uniform bool useObjectColor;\n';
  t += 'uniform vec3 objectColor;\n';
  t += 'uniform mat4 normal;\n';
  t += '\n';
  t += 'varying vec4 fVertexPosition;\n';
  t += 'varying lowp vec3 fragmentColor;\n';
  t += 'varying vec2 fragmentTexturePos;\n';
  t += 'varying vec4 fTransformedVertexNormal;\n';
  t += '\n';
  t += 'void main(void) {\n';
  // setup varying -> fragment shader
  t += '  fTransformedVertexNormal = normal * objectTransform * vec4(vertexNormal,1.0);\n';
  t += '  fVertexPosition = view * objectTransform * vec4(vertexPosition, 1.0);\n';
  // t += ' fTransformedVertexNormal = view * vec4(vertexNormal, 1.0);\n';
  t += '  fragmentTexturePos = vertexTexturePos;\n';
  t += '  if (useObjectColor) {\n';
  t += '    fragmentColor = objectColor;\n';
  t += '  } else {\n';
  t += '    fragmentColor = vertexColor;\n';
  t += '  }\n';
  // setup vertex Position in the GL context
  t += '  gl_Position = perspective * fVertexPosition;\n';
  t += '}\n';
  this._vertexshaderSource = t;
  
  /**
   * The fragment shader source of this shader pair. By default, a basic shader
   * supporting fragment colors is defined.
   * 
   * @type {!string}
   * @protected
   */
  this._fragmentshaderSource = '';
  var t2 = '';
  t2 += '#ifdef GL_ES\n';
  t2 += 'precision highp float;\n';
  t2 += '#endif\n';
  t2 += '\n';
  t2 += 'uniform bool useTexture;\n';
  t2 += 'uniform sampler2D textureSampler;\n';
  t2 += 'uniform float objectOpacity;\n';
  t2 += '\n';
  t2 += 'varying vec4 fVertexPosition;\n';
  t2 += 'varying lowp vec3 fragmentColor;\n';
  t2 += 'varying vec2 fragmentTexturePos;\n';
  t2 += 'varying vec4 fTransformedVertexNormal;\n';
  t2 += '\n';
  t2 += 'void main(void) {\n';
  t2 += ' if (useTexture) {\n';
  t2 += '   gl_FragColor = texture2D(textureSampler,';
  t2 += '   vec2(fragmentTexturePos.s,fragmentTexturePos.t));\n';
  t2 += ' } else {\n';
  // configure advanced lighting
  t2 += '   vec3 nNormal = normalize(fTransformedVertexNormal.xyz);\n';
  t2 += '   vec3 light = vec3(0.0, 0.0, 1.0);\n';
  t2 += '   vec3 lightDirection = vec3(-10.0, 4.0, -20.0);\n';
  t2 += '   lightDirection = normalize(lightDirection);\n';
  t2 += ' vec3 eyeDirection = normalize(-fVertexPosition.xyz);\n';
  // REFLECTION? does not look so good I think, so let's disable it for now
  // t2 += ' vec3 reflectionDirection = reflect(-lightDirection, nNormal);\n';
  t2 += ' vec3 reflectionDirection = nNormal;\n';
  // configure specular (16.0 is material property), diffuse and ambient
  t2 += '   float specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 16.0);\n';
  t2 += '   float diffuse = 0.8 * max(dot(nNormal, light), 0.0);\n';
  t2 += '   float ambient = 0.2;\n';
  // .. and now setup the fragment color using these three values and the
  // opacity
  t2 += '   gl_FragColor = vec4(fragmentColor * ambient +\n';
  t2 += '                       fragmentColor * diffuse +\n';
  t2 += '                       vec3(1.0, 1.0, 1.0) * specular,\n';
  t2 += '                       objectOpacity);\n';
  t2 += ' }\n';
  t2 += '}\n';
  this._fragmentshaderSource = t2;
  
  /**
   * The string to access the position inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._positionAttribute = 'vertexPosition';
  
  /**
   * The string to access the position inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._normalAttribute = 'vertexNormal';
  
  /**
   * The string to access the color inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._colorAttribute = 'vertexColor';
  
  /**
   * The string to access the texture position inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._texturePosAttribute = 'vertexTexturePos';
  
  /**
   * The string to access the view matrix inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._viewUniform = 'view';
  
  /**
   * The string to access the perspective matrix inside the vertex shader
   * source.
   * 
   * @type {!string}
   * @protected
   */
  this._perspectiveUniform = 'perspective';
  

  /**
   * The string to access the transform matrix inside the vertex shader source.
   * 
   * @type {!string}
   * @protected
   */
  this._objectTransformUniform = 'objectTransform';
  

  this._useObjectColorUniform = 'useObjectColor';
  

  /**
   * The string to access the objectColor uniform inside the vertex shader
   * source.
   * 
   * @type {!string}
   * @protected
   */
  this._objectColorUniform = 'objectColor';
  

  /**
   * The string to access the objectOpacity uniform inside the vertex shader
   * source.
   * 
   * @type {!string}
   * @protected
   */
  this._objectOpacityUniform = 'objectOpacity';
  
  // TODO comments
  
  this._normalUniform = 'normal';
  
  this._useTextureUniform = 'useTexture';
  
  this._textureSamplerUniform = 'textureSampler';
  
};
// inherit from X.base
goog.inherits(X.shaders, X.base);


/**
 * Get the vertex shader source of this shader pair.
 * 
 * @return {!string} The vertex shader source.
 */
X.shaders.prototype.vertex = function() {

  return this._vertexshaderSource;
  
};


/**
 * Get the fragment shader source of this shader pair.
 * 
 * @return {!String} The fragment shader source.
 */
X.shaders.prototype.fragment = function() {

  return this._fragmentshaderSource;
  
};


/**
 * Get the vertex position attribute locator.
 * 
 * @return {!string} The vertex position attribute locator.
 */
X.shaders.prototype.position = function() {

  return this._positionAttribute;
  
};


/**
 * Get the vertex position attribute locator.
 * 
 * @return {!string} The vertex position attribute locator.
 */
X.shaders.prototype.normal = function() {

  return this._normalAttribute;
  
};


/**
 * Get the vertex color attribute locator.
 * 
 * @return {!string} The vertex color attribute locator.
 */
X.shaders.prototype.color = function() {

  return this._colorAttribute;
  
};


/**
 * Get the view uniform locator.
 * 
 * @return {!string} The view uniform locator.
 */
X.shaders.prototype.view = function() {

  return this._viewUniform;
  
};


/**
 * Get the perspective uniform locator.
 * 
 * @return {!string} The perspective uniform locator.
 */
X.shaders.prototype.perspective = function() {

  return this._perspectiveUniform;
  
};


/**
 * Get the normal uniform locator
 * 
 * @return {String} The normal uniform locator.
 */
X.shaders.prototype.objectTransform = function() {

  return this._objectTransformUniform;
  
};


/**
 * TODO
 */
X.shaders.prototype.useObjectColor = function() {

  return this._useObjectColorUniform;
  
};


/**
 * Get the objectColor uniform locator.
 * 
 * @return {!string} The objectColor uniform locator.
 */
X.shaders.prototype.objectColor = function() {

  return this._objectColorUniform;
  
};


/**
 * Get the objectOpacity uniform locator.
 * 
 * @return {!string} The objectColor uniform locator.
 */
X.shaders.prototype.objectOpacity = function() {

  return this._objectOpacityUniform;
  
};


/**
 * Get the normal uniform locator
 * 
 * @return {String|null} The normal uniform locator.
 */
X.shaders.prototype.normalUniform = function() {

  return this._normalUniform;
  
};


/**
 * Get the lightning uniform locator.
 * 
 * @return {!string} The opacity uniform locator.
 */
X.shaders.prototype.lighting = function() {

  return this._lighting;
  
};


/**
 * TODO
 * 
 * @returns {String}
 */
X.shaders.prototype.texturePos = function() {

  return this._texturePosAttribute;
  
};


/**
 * TODO
 * 
 * @returns {String}
 */
X.shaders.prototype.textureSampler = function() {

  return this._textureSamplerUniform;
  
};


/**
 * TODO
 */
X.shaders.prototype.useTexture = function() {

  return this._useTextureUniform;
  
};


/**
 * Checks if the configured shaders object is valid.
 * 
 * @return {boolean} TRUE or FALSE depending on success.
 * @throws {X.exception} An exception if the shader is invalid.
 */
X.shaders.prototype.validate = function() {

  // check if the sources are compatible to the attributes and uniforms
  
  var t = 31337;
  
  t = this._vertexshaderSource.search(this._positionAttribute);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The positionAttribute was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._normalAttribute);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The normalAttribute was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._colorAttribute);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The colorAttribute was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._opacityAttribute);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The opacityAttribute was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._perspectiveUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The perspectiveUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._viewUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The viewUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._objectTransformUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The transformUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._useObjectColorUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The useObjectColorUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._objectColorUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The objectColorUniform was bogus.');
    
  }
  
  t = this._fragmentshaderSource.search(this._objectOpacityUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The objectOpacityUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._normalUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The normalUniform was bogus.');
    
  }
  
  t = this._vertexshaderSource.search(this._texturePosAttribute);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The texturePosAttribute was bogus.');
    
  }
  
  t = this._fragmentshaderSource.search(this._textureSamplerUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The textureSamplerUniform was bogus.');
    
  }
  
  t = this._fragmentshaderSource.search(this._useTextureUniform);
  
  if (t == -1) {
    
    throw new X.exception(
        'Fatal: Could not validate shader! The useTextureUniform was bogus.');
    
  }
  
  return true;
  
};

// TODO: texture, lightning etc.

// export symbols (requiered for advanced compilation)
goog.exportSymbol('X.shaders', X.shaders);
goog.exportSymbol('X.shaders.prototype.vertex', X.shaders.prototype.vertex);
goog.exportSymbol('X.shaders.prototype.fragment', X.shaders.prototype.fragment);
goog.exportSymbol('X.shaders.prototype.position', X.shaders.prototype.position);
goog.exportSymbol('X.shaders.prototype.color', X.shaders.prototype.color);
goog.exportSymbol('X.shaders.prototype.view', X.shaders.prototype.view);
goog.exportSymbol('X.shaders.prototype.perspective',
    X.shaders.prototype.perspective);
goog.exportSymbol('X.shaders.prototype.opacity', X.shaders.prototype.opacity);
goog.exportSymbol('X.shaders.prototype.validate', X.shaders.prototype.validate);
