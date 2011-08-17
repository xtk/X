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
    
    //
    // create three 2D renderers in the 2D divs (see ../index.html)
    // default color is black
    // also, we set the container here. If the container is ommited, the <body>
    // container is used
    var sliceView1 = new X.renderer2D(300, 300);
    sliceView1.setContainerById('sliceView1');
    sliceView1.init();
    
    var sliceView2 = new X.renderer2D(300, 300);
    sliceView2.setContainerById('sliceView2');
    sliceView2.init();
    
    var sliceView3 = new X.renderer2D(300, 300);
    sliceView3.setContainerById('sliceView3');
    sliceView3.init();
    
    //    
    // create a 'lightblue' 3D renderer in the div with id '3d' (see
    // ../index.html)
    var threeDView = new X.renderer3D(912, 400);
    threeDView.setContainerById('threeDView');
    threeDView.setBackgroundColor('#b3b3e7');
    threeDView.init();
    
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
    


    var vertices = [ 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0,
        0.0 ];
    
    sliceView1.addShaders(fragmentShader, vertexShader);
    sliceView1.addObject(vertices);
    sliceView2.addShaders(fragmentShader, vertexShader);
    sliceView2.addObject(vertices);
    sliceView3.addShaders(fragmentShader, vertexShader);
    sliceView3.addObject(vertices);
    threeDView.addShaders(fragmentShader, vertexShader);
    threeDView.addObject(vertices);
    
    // setInterval(function() {
    
    sliceView1.render();
    sliceView2.render();
    sliceView3.render();
    threeDView.render();
    
    // }, 15);
    // r3d.render();
    
    c.out(sliceView1.print());
    c.out(sliceView2.print());
    c.out(sliceView3.print());
    c.out(threeDView.print());
    
  } catch (e) {
    
    // catch any X.exception and print the error to the error log
    
    if (e instanceof X.exception) {
      c.err(e.print());
    }
    
  }
  
};
