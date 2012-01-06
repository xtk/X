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
 * @extends X.base
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
  t += 'precision mediump float;\n';
  t += '\n';
  t += 'attribute vec3 vertexPosition;\n';
  t += 'attribute vec3 vertexNormal;\n';
  t += 'attribute vec3 vertexColor;\n';
  t += 'attribute vec2 vertexTexturePos;\n';
  t += '\n';
  t += 'uniform mat4 view;\n';
  t += 'uniform mat4 perspective;\n';
  t += 'uniform vec3 center;\n';
  t += 'uniform mat4 objectTransform;\n';
  t += 'uniform bool useObjectColor;\n';
  t += 'uniform vec3 objectColor;\n';
  t += '\n';
  t += 'varying vec4 fVertexPosition;\n';
  t += 'varying lowp vec3 fragmentColor;\n';
  t += 'varying vec2 fragmentTexturePos;\n';
  t += 'varying vec3 fTransformedVertexNormal;\n';
  t += '\n';
  t += 'void main(void) {\n';
  // setup varying -> fragment shader
  t += '  fTransformedVertexNormal = mat3(view) * mat3(objectTransform) * vertexNormal;\n';
  // t += ' vec4 gVertexPosition = vec4(fVertexPosition.xyz - focus, 1.0);\n';
  t += '  vec3 vertexPosition2 = vertexPosition - center;\n';
  t += '  fVertexPosition = view * objectTransform * vec4(vertexPosition2, 1.0);\n';
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
  // android only guarantees medium precision
  t2 += 'precision mediump float;\n';
  t2 += '\n';
  t2 += 'uniform bool useTexture;\n';
  t2 += 'uniform sampler2D textureSampler;\n';
  t2 += 'uniform float objectOpacity;\n';
  t2 += '\n';
  t2 += 'varying vec4 fVertexPosition;\n';
  t2 += 'varying lowp vec3 fragmentColor;\n';
  t2 += 'varying vec2 fragmentTexturePos;\n';
  t2 += 'varying vec3 fTransformedVertexNormal;\n';
  t2 += '\n';
  t2 += 'void main(void) {\n';
  t2 += ' if (useTexture) {\n';
  t2 += '   gl_FragColor = texture2D(textureSampler,';
  t2 += '   vec2(fragmentTexturePos.s,fragmentTexturePos.t));\n';
  t2 += ' } else {\n';
  // configure advanced lighting
  t2 += '   vec3 nNormal = normalize(fTransformedVertexNormal);\n';
  t2 += '   vec3 light = vec3(0.0, 0.0, 1.0);\n';
  // t2 += ' vec3 lightDirection = vec3(-10.0, 4.0, -20.0);\n';
  // I liked the following better
  t2 += '   vec3 lightDirection = vec3(0,0,-10);\n';
  t2 += '   lightDirection = normalize(lightDirection);\n';
  t2 += '   vec3 eyeDirection = normalize(-fVertexPosition.xyz);\n';
  t2 += '   vec3 reflectionDirection = reflect(-lightDirection, nNormal);\n';
  // t2 += ' vec3 reflectionDirection = nNormal;\n'; <-- to disable reflection
  // configure specular (10.0 is material property), diffuse and ambient
  t2 += '   float specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 10.0);\n';
  t2 += '   float diffuse = 0.8 * max(dot(nNormal, light), 0.0);\n';
  t2 += '   float ambient = 0.3;\n';
  // .. and now setup the fragment color using these three values and the
  // opacity
  t2 += '   gl_FragColor = vec4(fragmentColor * ambient +\n';
  t2 += '                       fragmentColor * diffuse +\n';
  t2 += '                       vec3(0.2, 0.2, 0.2) * specular,\n';
  t2 += '                       objectOpacity);\n';
  t2 += ' }\n';
  t2 += '}\n';
  this._fragmentshaderSource = t2;
  

};
// inherit from X.base
goog.inherits(X.shaders, X.base);


/**
 * The X.shaders' vertex attributes.
 * 
 * @enum {string}
 * @protected
 */
X.shaders.attributes = {
  VERTEXPOSITION: 'vertexPosition',
  VERTEXNORMAL: 'vertexNormal',
  VERTEXCOLOR: 'vertexColor',
  VERTEXTEXTUREPOS: 'vertexTexturePos'
};


/**
 * The X.shaders' uniforms.
 * 
 * @enum {string}
 * @protected
 */
X.shaders.uniforms = {
  VIEW: 'view',
  PERSPECTIVE: 'perspective',
  CENTER: 'center',
  OBJECTTRANSFORM: 'objectTransform',
  USEOBJECTCOLOR: 'useObjectColor',
  OBJECTCOLOR: 'objectColor',
  OBJECTOPACITY: 'objectOpacity',
  NORMAL: 'normal',
  USETEXTURE: 'useTexture',
  TEXTURESAMPLER: 'textureSampler'
};


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
 * @return {!string} The fragment shader source.
 */
X.shaders.prototype.fragment = function() {

  return this._fragmentshaderSource;
  
};


/**
 * Checks if this configured shaders object is valid in terms of using the
 * defined attributes and uniforms.
 * 
 * @return {boolean} TRUE or FALSE depending on success.
 * @throws {X.exception} An exception if the shader is invalid.
 */
X.shaders.prototype.validate = function() {

  // check if the shader sources are compatible to the attributes and uniforms
  
  var attributes = Object.keys(X.shaders.attributes);
  var uniforms = Object.keys(X.shaders.uniforms);
  
  // check if all attributes are used either in the vertex or the fragment
  // shader
  var attributesValid = attributes.every(function(a) {

    a = eval("X.shaders.attributes." + a);
    return (this._vertexshaderSource.search(a) != -1) ||
        (this._fragmentshaderSource.search(a) != -1);
    
  }.bind(this));
  
  if (!attributesValid) {
    
    throw new X.exception(
        'Could not find all attributes in the shader sources!');
    
  }
  
  // check if all attributes are used either in the vertex or the fragment
  // shader
  var uniformsValid = uniforms.every(function(u) {

    u = eval("X.shaders.uniforms." + u);
    return (this._vertexshaderSource.search(u) != -1) ||
        (this._fragmentshaderSource.search(u) != -1);
    
  }.bind(this));
  
  if (!uniformsValid) {
    
    throw new X.exception('Could not find all uniforms in the shader sources!');
    
  }
  
  return true;
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.shaders', X.shaders);
goog.exportSymbol('X.shaders.attributes', X.shaders.attributes);
goog.exportSymbol('X.shaders.uniforms', X.shaders.uniforms);
goog.exportSymbol('X.shaders.prototype.vertex', X.shaders.prototype.vertex);
goog.exportSymbol('X.shaders.prototype.fragment', X.shaders.prototype.fragment);
goog.exportSymbol('X.shaders.prototype.validate', X.shaders.prototype.validate);
