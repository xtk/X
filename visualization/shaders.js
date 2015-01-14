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
  t += 'precision mediump float;\n';
  t += '\n';
  t += 'attribute vec3 vertexPosition;\n';
  t += 'attribute vec3 vertexNormal;\n';
  t += 'attribute vec3 vertexColor;\n';
  t += 'attribute vec2 vertexTexturePos;\n';
  t += 'attribute float vertexScalar;\n';
  t += '\n';
  t += 'uniform mat4 view;\n';
  t += 'uniform mat4 perspective;\n';
  t += 'uniform vec3 center;\n';
  t += 'uniform mat4 objectTransform;\n';
  t += 'uniform bool useObjectColor;\n';
  t += 'uniform bool useScalars;\n';
  t += 'uniform bool scalarsReplaceMode;\n';
  t += 'uniform float scalarsMin;\n';
  t += 'uniform float scalarsMax;\n';
  t += 'uniform vec3 scalarsMinColor;\n';
  t += 'uniform vec3 scalarsMaxColor;\n';
  t += 'uniform float scalarsMinThreshold;\n';
  t += 'uniform float scalarsMaxThreshold;\n';
  t += 'uniform int scalarsInterpolation;\n';
  t += 'uniform vec3 objectColor;\n';
  t += 'uniform float pointSize;\n';
  t += '\n';
  t += 'varying float fDiscardNow;\n';
  t += 'varying vec4 fVertexPosition;\n';
  t += 'varying vec3 fragmentColor;\n';
  t += 'varying vec2 fragmentTexturePos;\n';
  t += 'varying vec3 fVertexNormal;\n';
  t += 'varying vec3 fTransformedVertexNormal;\n';
  t += '\n';
  t += 'void main(void) {\n';
  // setup varying -> fragment shader
  // use the old mat3 constructor to be compatible with mac/safari
  t += '  fTransformedVertexNormal = mat3(view[0].xyz,view[1].xyz,view[2].xyz) * ';
  t += 'mat3(objectTransform[0].xyz,objectTransform[1].xyz,objectTransform[2].xyz) * ';
  t += 'vertexNormal;\n';
  t += '  fVertexNormal = vertexNormal;\n';
  t += '  fDiscardNow = 0.0;\n'; // don't discard by default
  // t += ' vec4 gVertexPosition = vec4(fVertexPosition.xyz - focus, 1.0);\n';
  t += '  vec3 vertexPosition2 = vertexPosition - center;\n';
  t += '  fVertexPosition = view * objectTransform * vec4(vertexPosition2, 1.0);\n';
  t += '  fragmentTexturePos = vertexTexturePos;\n';
  t += '  if (useScalars) {\n'; // use scalar overlays
  t += '    float scalarValue = vertexScalar;\n'; // ..and threshold
  t += '    if (scalarValue < scalarsMinThreshold || scalarValue > scalarsMaxThreshold) {\n';
  t += '      if (scalarsReplaceMode) {\n';
  t += '        fragmentColor = objectColor;\n'; // outside threshold
  t += '      } else {\n';
  t += '        fDiscardNow = 1.0;\n';
  // if we don't replace the colors, just
  // discard this vertex (fiber length
  // thresholding f.e.)
  t += '      }\n';
  t += '    } else {\n';
  t += '      if (scalarsReplaceMode) {\n';
  t += '        if (scalarsInterpolation == 1) {\n';
  // the zeroMaxColor is the "zero" point for the interpolation of the "max"
  // colors
  // and used for the positive curvatures; similarly the zeroMinColor for the
  // negative curvatures.
  t += '            vec3 zeroMaxColor;\n';
  t += '            vec3 zeroMinColor;\n';
  t += '            zeroMaxColor[0] = scalarsMaxColor[0]*0.33;\n';
  t += '            zeroMaxColor[1] = scalarsMaxColor[1]*0.33;\n';
  t += '            zeroMaxColor[2] = scalarsMaxColor[2]*0.33;\n';
  t += '            zeroMinColor[0] = scalarsMinColor[0]*0.33;\n';
  t += '            zeroMinColor[1] = scalarsMinColor[1]*0.33;\n';
  t += '            zeroMinColor[2] = scalarsMinColor[2]*0.33;\n';
  t += '            if(scalarValue < 0.0) {fragmentColor = scalarValue/(scalarsMin) * scalarsMinColor + (1.0 - scalarValue/(scalarsMin)) * (zeroMinColor);}\n';
  t += '            else {fragmentColor = scalarValue/(scalarsMax) * scalarsMaxColor + (1.0 - scalarValue/(scalarsMax)) * (zeroMaxColor);}\n';
  t += '        } else {\n';
  // t += ' fragmentColor = (scalarValue-scalarsMin)/(scalarsMax-scalarsMin) *
  // scalarsMaxColor + (1.0 - (scalarValue-scalarsMin)/(scalarsMax-scalarsMin))
  // * scalarsMinColor;\n';
  t += '            fragmentColor = scalarValue * scalarsMaxColor + (1.0 - scalarValue) * scalarsMinColor;\n';
  t += '          }\n';
  t += '      } else {\n';
  t += '        fragmentColor = vertexColor;\n'; // if we don't replace and
  // didn't discard, just use
  // the point color here
  t += '      }\n';
  t += '    }\n';
  t += '  } else if (useObjectColor) {\n';
  t += '    fragmentColor = objectColor;\n';
  t += '  } else {\n';
  t += '    fragmentColor = vertexColor;\n';
  t += '  }\n';
  // setup vertex Point Size and Position in the GL context
  t += '  gl_PointSize = pointSize;\n';
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
  t2 += 'uniform bool usePicking;\n';
  t2 += 'uniform bool useTexture;\n';
  t2 += 'uniform bool volumeTexture;\n';
  t2 += 'uniform bool useLabelMapTexture;\n'; // which activates textureSampler2
  t2 += 'uniform sampler2D textureSampler;\n';
  t2 += 'uniform sampler2D textureSampler2;\n';
  t2 += 'uniform float objectOpacity;\n';
  t2 += 'uniform float labelmapOpacity;\n';
  t2 += 'uniform vec4 labelmapColor;\n';
  t2 += 'uniform float volumeLowerThreshold;\n';
  t2 += 'uniform float volumeUpperThreshold;\n';
  t2 += 'uniform float volumeScalarMin;\n';
  t2 += 'uniform float volumeScalarMax;\n';
  t2 += 'uniform vec3 volumeScalarMinColor;\n';
  t2 += 'uniform vec3 volumeScalarMaxColor;\n';
  t2 += 'uniform float volumeWindowLow;\n';
  t2 += 'uniform float volumeWindowHigh;\n';
  t2 += '\n';
  t2 += 'varying float fDiscardNow;\n';
  t2 += 'varying vec4 fVertexPosition;\n';
  t2 += 'varying vec3 fragmentColor;\n';
  t2 += 'varying vec2 fragmentTexturePos;\n';
  t2 += 'varying vec3 fVertexNormal;\n';
  t2 += 'varying vec3 fTransformedVertexNormal;\n';
  t2 += '\n';
  t2 += 'void main(void) {\n';
  t2 += ' if (fDiscardNow > 0.0) {\n';
  t2 += '   discard;\n'; // really discard now
  t2 += ' }\n';
  // in picking mode, we don't want any extras but just the plain color
  t2 += ' if (usePicking) {\n';
  t2 += '   gl_FragColor = vec4(fragmentColor, 1.0);\n';
  t2 += ' } else if (useTexture) {\n';
  t2 += '   vec4 texture1 = texture2D(textureSampler,fragmentTexturePos);\n';
  t2 += '   vec4 textureSum = texture1;\n';
  // perform window level
  t2 += '   if (volumeTexture) {\n';
  t2 += '     float _windowLow = ((volumeWindowLow - volumeScalarMin)/ (volumeScalarMax - volumeScalarMin));\n';
  t2 += '     float _windowHigh = ((volumeWindowHigh - volumeScalarMin)/ (volumeScalarMax - volumeScalarMin));\n';
  t2 += '     vec3 _minrange = vec3(_windowLow,_windowLow,_windowLow);\n';
  t2 += '     vec3 _maxrange = vec3(_windowHigh,_windowHigh,_windowHigh);\n';
  t2 += '     vec3 fac = _maxrange - _minrange;\n';
  t2 += '     textureSum = vec4((textureSum.r - _minrange)/fac,1);\n';
  // map volume scalars to a linear color gradient
  t2 += '     textureSum = textureSum.r * vec4(volumeScalarMaxColor,1) + (1.0 - textureSum.r) * vec4(volumeScalarMinColor,1);\n';
  t2 += '   }\n';
  t2 += '   if (useLabelMapTexture) {\n'; // special case for label maps
  t2 += '     vec4 texture2 = texture2D(textureSampler2,fragmentTexturePos);\n';
  t2 += '     if (texture2.a > 0.0) {\n'; // check if this is not the background
  // label
  t2 += '         if (labelmapColor.a != -255.0) {\n'; // check if only one color should be shown
  t2 += '           if (all(equal(floor(texture2 * vec4(255)), labelmapColor))) {\n'; // if equal, mix colors
  t2 += '             if (labelmapOpacity < 1.0) {\n'; // transparent label map
  t2 += '               textureSum = mix(texture2, textureSum, 1.0 - labelmapOpacity);\n';
  t2 += '             } else {\n';
  t2 += '               textureSum = texture2;\n'; // fully opaque label map
  t2 += '             }\n';
  t2 += '           }\n';
  t2 += '         } else {\n';  // if not only one color, always mix
  t2 += '           if (labelmapOpacity < 1.0) {\n'; // transparent label map
  t2 += '             textureSum = mix(texture2, textureSum, 1.0 - labelmapOpacity);\n';
  t2 += '           } else {\n';
  t2 += '             textureSum = texture2;\n'; // fully opaque label map
  t2 += '           }\n';
  t2 += '         }\n';

  t2 += '     }\n';
  t2 += '   }\n';
  // threshold functionality for 1-channel volumes
  t2 += '   if (volumeTexture) {\n';
  t2 += '     float _volumeLowerThreshold = (volumeLowerThreshold - volumeScalarMin)/ (volumeScalarMax - volumeScalarMin);\n';
  t2 += '     float _volumeUpperThreshold = (volumeUpperThreshold - volumeScalarMin)/ (volumeScalarMax - volumeScalarMin);\n';
  t2 += '     if (texture1.r < _volumeLowerThreshold ||\n';
  t2 += '         texture1.r > _volumeUpperThreshold ||\n';
  t2 += '         texture1.a == 0.0 ) {\n';
  t2 += '       discard;\n';
  t2 += '     };\n';
  t2 += '   };\n';
  t2 += '   gl_FragColor = textureSum;\n';
  t2 += '   gl_FragColor.a = objectOpacity;\n';
  t2 += ' } else {\n';
  // configure advanced lighting
  t2 += '   vec3 nNormal = normalize(fTransformedVertexNormal);\n';
  // .. ignore the lightning if the normals are 0,0,0
  t2 += '   if (fVertexNormal == vec3(0.0,0.0,0.0)) {\n';
  t2 += '     gl_FragColor = vec4(fragmentColor,1.0);\n';
  t2 += '     return;\n';
  t2 += '   }\n';
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
  SCALARSINTERPOLATION: 'scalarsInterpolation',
  POINTSIZE: 'pointSize',
  OBJECTOPACITY: 'objectOpacity',
  NORMAL: 'normal',
  USEPICKING: 'usePicking',
  USETEXTURE: 'useTexture',
  USELABELMAPTEXTURE: 'useLabelMapTexture',
  LABELMAPOPACITY: 'labelmapOpacity',
  LABELMAPCOLOR: 'labelmapColor',
  TEXTURESAMPLER: 'textureSampler',
  TEXTURESAMPLER2: 'textureSampler2',
  VOLUMELOWERTHRESHOLD: 'volumeLowerThreshold',
  VOLUMEUPPERTHRESHOLD: 'volumeUpperThreshold',
  VOLUMESCALARMIN: 'volumeScalarMin',
  VOLUMESCALARMAX: 'volumeScalarMax',
  VOLUMESCALARMINCOLOR: 'volumeScalarMinColor',
  VOLUMESCALARMAXCOLOR: 'volumeScalarMaxColor',
  VOLUMEWINDOWLOW: 'volumeWindowLow',
  VOLUMEWINDOWHIGH: 'volumeWindowHigh',
  VOLUMETEXTURE: 'volumeTexture'
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
