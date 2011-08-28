goog.provide('sampleApp');
goog.provide('sampleApp.init');

goog.require('X.color');
goog.require('X.colors');
goog.require('X.console');
goog.require('X.object');
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
        .setSource("varying lowp vec4 fragmentColor;    \n\
                                                        \n\
        		void main(void) {                           \n\
              gl_FragColor = fragmentColor;             \n\
            }                                           \n\
    ");
    
    var vertexShader = new X.shaderVertex();
    vertexShader
        .setSource("attribute vec3 vertexPosition;                                          \n\
        		attribute vec4 vertexColor;                                                     \n\
                                                                                            \n\
        uniform mat4 view;                                                                  \n\
        uniform mat4 perspective;                                                           \n\
                                                                                            \n\
        varying lowp vec4 fragmentColor;                                                    \n\
                                                                                            \n\
        void main(void) {                                                                   \n\
          gl_Position = perspective * view * vec4(vertexPosition, 1.0);                     \n\
          fragmentColor = vertexColor;                                                      \n\
        }                                                                                   \n\
        ");
    
    var object1 = new X.object();
    // we can add points as goog.math.Coordinate3 or just as 1-D arrays with 3
    // items
    object1.points().add([ 2, 2, 0 ]);
    object1.points().add([ 3, 3, 0 ]);
    object1.points().add([ 1, 1, 0 ]);
    object1.points().add([ 1, 2.5, 0 ]);
    // since we set an object color, individual point colors are overwritten
    object1.setColor(new X.color(1, 0, 0));
    object1.colors().add(new X.color(1, 1, 1));
    object1.colors().add(new X.color(1, 1, 1));
    object1.colors().add(new X.color(1, 1, 1));
    object1.colors().add(new X.color(1, 1, 1));
    
    var object2 = new X.object();
    object2.points().add([ 20, 20, 0 ]);
    object2.points().add([ 30, 30, 0 ]);
    object2.points().add([ 10, 10, 0 ]);
    object2.points().add([ 10, 20.5, 0 ]);
    // here, we configure point colors properly
    object2.colors().add(new X.color(1, 1, 1));
    object2.colors().add(new X.color(1, 0, 0));
    object2.colors().add(new X.color(0, 1, 0));
    object2.colors().add(new X.color(0, 0, 1));
    
    var object3 = new X.object();
    object3.points().add([ -40, -40, 0 ]);
    object3.points().add([ -50, -50, 0 ]);
    object3.points().add([ -30, -30, 0 ]);
    object3.points().add([ 10, 20.5, 0 ]);
    // here, we do not configure any colors which should reset to default
    // (white)
    
    var object4 = new X.object();
    object4.points().add([ -40, 40, 0 ]);
    object4.points().add([ -50, 50, 0 ]);
    object4.points().add([ -30, 30, 0 ]);
    object4.points().add([ -10, 20, 0 ]);
    object4.setColor(new X.color(0, 1, 0));
    
    sliceView1.addShaders(fragmentShader, vertexShader);
    sliceView1.addObject(object1);
    sliceView2.addShaders(fragmentShader, vertexShader);
    sliceView2.addObject(object1);
    sliceView3.addShaders(fragmentShader, vertexShader);
    sliceView3.addObject(object1);
    threeDView.addShaders(fragmentShader, vertexShader);
    threeDView.addObject(object1);
    threeDView.addObject(object2);
    threeDView.addObject(object3);
    threeDView.addObject(object4);
    
    // setInterval(function() {
    
    sliceView1.render();
    sliceView2.render();
    sliceView3.render();
    threeDView.render();
    
    // }, 15);
    
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
