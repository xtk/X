goog.provide('sampleApp');
goog.provide('sampleApp.init');

goog.require('X.console');
goog.require('X.renderer2D');
goog.require('X.renderer3D');
goog.require('X.shaderFragment');
goog.require('X.shaderVertex');

sampleApp.init = function() {

  var c = new X.console();
  
  c.out('Starting sampleApp.init..');
  
  try {
    
    // create a red 2D renderer in the div with id '2d' (see ../index.html)
    var r2d = new X.renderer2D(100, 100);
    r2d.setContainerById('2d');
    r2d.setBackgroundColor('#ff0000');
    r2d.init();
    c.out(r2d.print());
    //    
    // create a green 3D renderer in the div with id '3d' (see ../index.html)
    var r3d = new X.renderer3D(640, 480);
    r3d.setContainerById('3d');
    r3d.setBackgroundColor('green');
    r3d.init();
    
    // shader experiments
    var fragmentShader = new X.shaderFragment();
    fragmentShader
        .setSource("void main(void) {                   \n\
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);        \n\
      }                                                 \n\
    ");
    
    var vertexShader = new X.shaderVertex();
    vertexShader
        .setSource("attribute vec3 bVertexPosition;                                         \n\
                                                                                            \n\
        uniform mat4 uMVMatrix;                                                             \n\
        uniform mat4 uPMatrix;                                                              \n\
                                                                                            \n\
        void main(void) {                                                                   \n\
          gl_Position = uPMatrix * uMVMatrix * vec4(bVertexPosition, 1.0);                  \n\
        }                                                                                   \n\
        ");
    
    r3d.addShaders(fragmentShader, vertexShader);
    r2d.addShaders(fragmentShader, vertexShader);
    

    var vertices = [ 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0,
        0.0 ];
    
    r3d.addObject(vertices);
    r2d.addObject(vertices);
    
    // setInterval(function() {
    
    r3d.render();
    r2d.render();
    // }, 15);
    // r3d.render();
    

    // create a default colored (black) 2D renderer without container
    // specification which should
    // create it directly in <body></body>
    var r2dWithoutHome = new X.renderer2D(10, 10);
    r2dWithoutHome.init();
    r2dWithoutHome.addShaders(fragmentShader, vertexShader);
    r2dWithoutHome.addObject(vertices);
    r2dWithoutHome.render();
    c.out(r2dWithoutHome.print());
    
    c.out(r3d.print());
    
  } catch (e) {
    
    // catch any X.exception and print the error to the error log
    
    if (e instanceof X.exception) {
      c.err(e.print());
    }
    
  }
  
};
