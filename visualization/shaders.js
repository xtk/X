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
goog.provide('X.shaders');

// requires
goog.require('X.base');



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
  this._classname = 'shaders';
  
  /**
   * The vertex shader source of this shader pair. By default, a basic shader
   * supporting vertex positions and vertex colors is defined.
   * 
   * @type {!string}
   * @protected
   */
  this._vertexshaderSource = '';
  var t = '';
  t += 'precision mediump float;'
      + "attribute vec3 vertexPosition,vertexNormal,vertexColor;"
      + "attribute vec2 vertexTexturePos;"
      + "attribute float vertexScalar;"
      + "uniform mat4 view,perspective,objectTransform;"
      + "uniform bool useObjectColor,useScalars,scalarsReplaceMode;"
      + "uniform vec3 center,objectColor,scalarsMinColor,scalarsMaxColor;"
      + "uniform float scalarsMin,scalarsMax,pointSize,scalarsMinThreshold,scalarsMaxThreshold;"
      + "varying float fDiscardNow;"
      + "varying vec4 fVertexPosition;"
      + "varying vec2 fragmentTexturePos;"
      + "varying vec3 fragmentColor,fVertexNormal,fTransformedVertexNormal;"
      + "void main()"
      + "{"
      + "fTransformedVertexNormal=mat3(view[0].xyz,view[1].xyz,view[2].xyz)*mat3(objectTransform[0].xyz,objectTransform[1].xyz,objectTransform[2].xyz)*vertexNormal;"
      + "fVertexNormal=vertexNormal;" + "fDiscardNow=0.;"
      + "vec3 v=vertexPosition-center;"
      + "fVertexPosition=view*objectTransform*vec4(v,1.);"
      + "fragmentTexturePos=vertexTexturePos;" + "if(useScalars)" + "{"
      + "float f=vertexScalar;"
      + "if(f<scalarsMinThreshold||f>scalarsMaxThreshold)" + "{"
      + "if(scalarsReplaceMode)" + "fragmentColor=objectColor;" + "else"
      + " fDiscardNow=1.;" + "}" + "else" + "{" + "if(scalarsReplaceMode)"
      + "fragmentColor=f*scalarsMaxColor+(1.-f)*scalarsMinColor;" + "else"
      + " fragmentColor=vertexColor;" + "}" + "}" + "else"
      + " if(useObjectColor)" + "fragmentColor=objectColor;" + "else"
      + " fragmentColor=vertexColor;" + "gl_PointSize=pointSize;"
      + "gl_Position=perspective*fVertexPosition;" + "}";
  this._vertexshaderSource = t;
  
  /**
   * The fragment shader source of this shader pair. By default, a basic shader
   * supporting fragment colors is defined.
   * 
   * @type {!string}
   * @protected
   */
  this._fragmentshaderSource = '';
  // The uncompiled fragment shader is in fragment.shader.
  // compilation via http://www.ctrl-alt-test.fr/minifier/index
  //
  var t2 = "precision mediump float;"
      + "uniform bool usePicking,useTexture,useTextureThreshold,useLabelMapTexture;"
      + "uniform sampler2D textureSampler,textureSampler2;"
      + "uniform float objectOpacity,labelmapOpacity,volumeLowerThreshold,volumeUpperThreshold,volumeScalarMin,volumeScalarMax;"
      + "varying float fDiscardNow;"
      + "varying vec4 fVertexPosition;"
      + "varying vec3 fragmentColor,fVertexNormal,fTransformedVertexNormal;"
      + "varying vec2 fragmentTexturePos;"
      + "void main()"
      + "{"
      + "if(fDiscardNow>0.)"
      + "{"
      + "discard;"
      + "}"
      + "if(usePicking)"
      + "gl_FragColor=vec4(fragmentColor,1.);"
      + "else"
      + " if(useTexture)"
      + "{"
      + "vec4 f=texture2D(textureSampler,fragmentTexturePos),v=f;"
      + "if(useLabelMapTexture)"
      + "{"
      + "vec4 r=texture2D(textureSampler2,fragmentTexturePos);"
      + "if(r.w>0.)"
      + "{"
      + "if(labelmapOpacity<1.)"
      + "v=mix(r,v,1.-labelmapOpacity);"
      + "else"
      + " v=r;"
      + "}"
      + "}"
      + "if(useTextureThreshold)"
      + "{"
      + "float r=volumeLowerThreshold/volumeScalarMax,l=volumeUpperThreshold/volumeScalarMax;"
      + "if(f.x<r||f.x>l)"
      + "{"
      + "discard;"
      + "}"
      + "}"
      + "gl_FragColor=v;"
      + "gl_FragColor.w=objectOpacity;"
      + "}"
      + "else"
      + "{"
      + "vec3 f=normalize(fTransformedVertexNormal);"
      + "if(fVertexNormal==vec3(0.,0.,0.))"
      + "{"
      + "gl_FragColor=vec4(fragmentColor,1.);"
      + "return;"
      + "}"
      + "vec3 v=vec3(0.,0.,1.),r=vec3(0,0,-10);"
      + "r=normalize(r);"
      + "vec3 l=normalize(-fVertexPosition.xyz),u=reflect(-r,f);"
      + "float d=pow(max(dot(u,l),0.),10.),o=.8*max(dot(f,v),0.),t=.3;"
      + "gl_FragColor=vec4(fragmentColor*t+fragmentColor*o+vec3(.2,.2,.2)*d,objectOpacity);"
      + "}" + "}";
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
  VERTEXTEXTUREPOS: 'vertexTexturePos',
  VERTEXSCALAR: 'vertexScalar'
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
  USESCALARS: 'useScalars',
  SCALARSREPLACEMODE: 'scalarsReplaceMode',
  SCALARSMIN: 'scalarsMin',
  SCALARSMAX: 'scalarsMax',
  SCALARSMINCOLOR: 'scalarsMinColor',
  SCALARSMAXCOLOR: 'scalarsMaxColor',
  SCALARSMINTHRESHOLD: 'scalarsMinThreshold',
  SCALARSMAXTHRESHOLD: 'scalarsMaxThreshold',
  POINTSIZE: 'pointSize',
  OBJECTOPACITY: 'objectOpacity',
  NORMAL: 'normal',
  USEPICKING: 'usePicking',
  USETEXTURE: 'useTexture',
  USETEXTURETHRESHOLD: 'useTextureThreshold',
  USELABELMAPTEXTURE: 'useLabelMapTexture',
  LABELMAPOPACITY: 'labelmapOpacity',
  TEXTURESAMPLER: 'textureSampler',
  TEXTURESAMPLER2: 'textureSampler2',
  VOLUMELOWERTHRESHOLD: 'volumeLowerThreshold',
  VOLUMEUPPERTHRESHOLD: 'volumeUpperThreshold',
  VOLUMESCALARMIN: 'volumeScalarMin',
  VOLUMESCALARMAX: 'volumeScalarMax'
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
 * @throws {Error} An exception if the shader is invalid.
 */
X.shaders.prototype.validate = function() {

  // check if the shader sources are compatible to the attributes and uniforms
  
  var attributes = Object.keys(X.shaders.attributes);
  var uniforms = Object.keys(X.shaders.uniforms);
  
  // check if all attributes are used either in the vertex or the fragment
  // shader
  var attributesValid = attributes.every(function(a) {

    a = X.shaders.attributes[a];
    return (this._vertexshaderSource.search(a) != -1) ||
        (this._fragmentshaderSource.search(a) != -1);
    
  }.bind(this));
  
  if (!attributesValid) {
    
    throw new Error('Could not find all attributes in the shader sources.');
    
  }
  
  // check if all attributes are used either in the vertex or the fragment
  // shader
  var uniformsValid = uniforms.every(function(u) {

    u = X.shaders.uniforms[u];
    return (this._vertexshaderSource.search(u) != -1) ||
        (this._fragmentshaderSource.search(u) != -1);
    
  }.bind(this));
  
  if (!uniformsValid) {
    
    throw new Error('Could not find all uniforms in the shader sources.');
    
  }
  
  return true;
  
};
