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
  this._vertexShaderSource = ''
      + 'attribute vec3 vertexPosition;                                          \n'
      + 'attribute vec3 vertexColor;                                             \n'
      + 'attribute float vertexOpacity;                                          \n'
      + '                                                                        \n'
      + 'uniform mat4 view;                                                      \n'
      + 'uniform mat4 perspective;                                               \n'
      + '                                                                        \n'
      + 'varying lowp vec4 fragmentColor;                                        \n'
      + '                                                                        \n'
      + 'void main(void) {                                                       \n'
      + '  gl_Position = perspective * view * vec4(vertexPosition, 1.0);         \n'
      + '  fragmentColor = vec4(vertexColor,vertexOpacity);                      \n'
      + '}                                                                       \n';

  /**
   * The fragment shader source of this shader pair. By default, a basic shader
   * supporting fragment colors is defined.
   *
   * @type {!string}
   * @protected
   */
  this._fragmentShaderSource = ''
      + 'varying lowp vec4 fragmentColor;                   \n'
      + '                                                   \n'
      + 'void main(void) {                                  \n'
      + '  gl_FragColor = fragmentColor;                    \n'
      + '}                                                  \n';

  /**
   * The string to access the position inside the vertex shader source.
   *
   * @type {!string}
   * @protected
   */
  this._positionAttribute = 'vertexPosition';

  /**
   * The string to access the color inside the vertex shader source.
   *
   * @type {!string}
   * @protected
   */
  this._colorAttribute = 'vertexColor';

  /**
   * The string to access the opacity value inside the vertex shader source.
   *
   * @type {!string}
   * @protected
   */
  this._opacityAttribute = 'vertexOpacity';

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

};
// inherit from X.base
goog.inherits(X.shaders, X.base);

/**
 * Get the vertex shader source of this shader pair.
 *
 * @returns {!string} The vertex shader source.
 */
X.shaders.prototype.vertex = function() {

  return this._vertexShaderSource;

};

/**
 * Get the fragment shader source of this shader pair.
 *
 * @returns {!string} The fragment shader source.
 */
X.shaders.prototype.fragment = function() {

  return this._fragmentShaderSource;

};

/**
 * Get the vertex position attribute locator.
 *
 * @returns {!string} The vertex position attribute locator.
 */
X.shaders.prototype.position = function() {

  return this._positionAttribute;

};

/**
 * Get the vertex color attribute locator.
 *
 * @returns {!string} The vertex color attribute locator.
 */
X.shaders.prototype.color = function() {

  return this._colorAttribute;

};

/**
 * Get the view uniform locator.
 *
 * @returns {!string} The view uniform locator.
 */
X.shaders.prototype.view = function() {

  return this._viewUniform;

};

/**
 * Get the perspective uniform locator.
 *
 * @returns {!string} The perspective uniform locator.
 */
X.shaders.prototype.perspective = function() {

  return this._perspectiveUniform;

};

/**
 * Get the opacity uniform locator.
 *
 * @returns {!string} The opacity uniform locator.
 */
X.shaders.prototype.opacity = function() {

  return this._opacityAttribute;

};

/**
 * Checks if the configured shaders object is valid.
 *
 * @returns {boolean} TRUE or FALSE depending on success.
 * @throws {X.exception} An exception if the shader is invalid.
 */
X.shaders.prototype.validate = function() {

  // check if the sources are compatible to the attributes and uniforms

  var t = 31337;

  t = this._vertexShaderSource.search(this._positionAttribute);

  if (t == -1) {

    throw new X.exception(
        'Fatal: Could not validate shader! The positionAttribute was bogus.');

  }

  t = this._vertexShaderSource.search(this._colorAttribute);

  if (t == -1) {

    throw new X.exception(
        'Fatal: Could not validate shader! The colorAttribute was bogus.');

  }

  t = this._vertexShaderSource.search(this._opacityAttribute);

  if (t == -1) {

    throw new X.exception(
        'Fatal: Could not validate shader! The opacityAttribute was bogus.');

  }

  t = this._vertexShaderSource.search(this._perspectiveUniform);

  if (t == -1) {

    throw new X.exception(
        'Fatal: Could not validate shader! The perspectiveUniform was bogus.');

  }

  t = this._vertexShaderSource.search(this._viewUniform);

  if (t == -1) {

    throw new X.exception(
        'Fatal: Could not validate shader! The viewUniform was bogus.');

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
goog.exportSymbol('X.shaders.prototype.validate', X.shaders.prototype.validate);
