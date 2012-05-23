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
  // The uncompiled vertex shader is in the file vertex.shader.
  // compilation via http://www.ctrl-alt-test.fr/minifier/index
  //
  // with the following settings:
  // GLSL, JS Header, .xyzw, Preserve external values
  //  
  var t = 'precision mediump float;'
      + "attribute vec3 vp,vn,vc;"
      + "attribute vec2 vtp;"
      + "attribute float vs;"
      + "uniform mat4 uv,up,uot;"
      + "uniform bool uuoc,uus,usrm;"
      + "uniform vec3 uc,uoc,usminc,usmaxc;"
      + "uniform float usmin,usmax,ups,usmint,usmaxt;"
      + "varying float fdn;"
      + "varying vec4 fvp;"
      + "varying vec2 ftp;"
      + "varying vec3 fc,fvn,ftvn;"
      + "void main()"
      + "{"
      + "ftvn=mat3(uv[0].xyz,uv[1].xyz,uv[2].xyz)*mat3(uot[0].xyz,uot[1].xyz,uot[2].xyz)*vn;"
      + "fvn=vn;" + "fdn=0.;" + "vec3 v=vp-uc;" + "fvp=uv*uot*vec4(v,1.);"
      + "ftp=vtp;" + "if(uus)" + "{" + "float f=vs;" + "if(f<usmint||f>usmaxt)"
      + "{" + "if(usrm)" + "fc=uoc;" + "else" + " fdn=1.;" + "}" + "else" + "{"
      + "if(usrm)" + "fc=f*usmaxc+(1.-f)*usminc;" + "else" + " fc=vc;" + "}"
      + "}" + "else" + " if(uuoc)" + "fc=uoc;" + "else" + " fc=vc;"
      + "gl_PointSize=ups;" + "gl_Position=up*fvp;" + "}";
  this._vertexshaderSource = t;
  
  /**
   * The fragment shader source of this shader pair. By default, a basic shader
   * supporting fragment colors is defined.
   * 
   * @type {!string}
   * @protected
   */
  this._fragmentshaderSource = '';
  // The uncompiled fragment shader is in the file fragment.shader.
  // compilation via http://www.ctrl-alt-test.fr/minifier/index
  //
  // with the following settings:
  // GLSL, JS Header, .xyzw, Preserve external values
  //  
  var t2 = "precision mediump float;" + "uniform bool uup,uut,uutt,uulmt;"
      + "uniform sampler2D uts,uts2;"
      + "uniform float uoo,ulmo,uvlt,uvut,uvsmin,uvsmax;"
      + "varying float fdn;" + "varying vec4 fvp;"
      + "varying vec3 fc,fvn,ftvn;" + "varying vec2 ftp;" + "void main()" + "{"
      + "if(fdn>0.)" + "{" + "discard;" + "}" + "if(uup)"
      + "gl_FragColor=vec4(fc,1.);" + "else" + " if(uut)" + "{"
      + "vec4 f=texture2D(uts,ftp),v=f;" + "if(uulmt)" + "{"
      + "vec4 r=texture2D(uts2,ftp);" + "if(r.w>0.)" + "{" + "if(ulmo<1.)"
      + "v=mix(r,v,1.-ulmo);" + "else" + " v=r;" + "}" + "}" + "if(uutt)" + "{"
      + "float r=uvlt/uvsmax,l=uvut/uvsmax;" + "if(f.x<r||f.x>l)" + "{"
      + "discard;" + "}" + "}" + "gl_FragColor=v;" + "gl_FragColor.w=uoo;"
      + "}" + "else" + "{" + "vec3 f=normalize(ftvn);"
      + "if(fvn==vec3(0.,0.,0.))" + "{" + "gl_FragColor=vec4(fc,1.);"
      + "return;" + "}" + "vec3 v=vec3(0.,0.,1.),r=vec3(0,0,-10);"
      + "r=normalize(r);" + "vec3 l=normalize(-fvp.xyz),u=reflect(-r,f);"
      + "float d=pow(max(dot(u,l),0.),10.),o=.8*max(dot(f,v),0.),t=.3;"
      + "gl_FragColor=vec4(fc*t+fc*o+vec3(.2,.2,.2)*d,uoo);" + "}" + "}";
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
  VERTEXPOSITION: 'vp',
  VERTEXNORMAL: 'vn',
  VERTEXCOLOR: 'vc',
  VERTEXTEXTUREPOS: 'vtp',
  VERTEXSCALAR: 'vs'
};


/**
 * The X.shaders' uniforms.
 * 
 * @enum {string}
 * @protected
 */
X.shaders.uniforms = {
  VIEW: 'uv',
  PERSPECTIVE: 'up',
  CENTER: 'uc',
  OBJECTTRANSFORM: 'uot',
  USEOBJECTCOLOR: 'uuoc',
  OBJECTCOLOR: 'uoc',
  USESCALARS: 'uus',
  SCALARSREPLACEMODE: 'usrm',
  SCALARSMIN: 'usmin',
  SCALARSMAX: 'usmax',
  SCALARSMINCOLOR: 'usminc',
  SCALARSMAXCOLOR: 'usmaxc',
  SCALARSMINTHRESHOLD: 'usmint',
  SCALARSMAXTHRESHOLD: 'usmaxt',
  POINTSIZE: 'ups',
  OBJECTOPACITY: 'uoo',
  NORMAL: 'un',
  USEPICKING: 'uup',
  USETEXTURE: 'uut',
  USETEXTURETHRESHOLD: 'uutt',
  USELABELMAPTEXTURE: 'uulmt',
  LABELMAPOPACITY: 'ulmo',
  TEXTURESAMPLER: 'uts',
  TEXTURESAMPLER2: 'uts2',
  VOLUMELOWERTHRESHOLD: 'uvlt',
  VOLUMEUPPERTHRESHOLD: 'uvut',
  VOLUMESCALARMIN: 'uvsmin',
  VOLUMESCALARMAX: 'uvsmax'
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
