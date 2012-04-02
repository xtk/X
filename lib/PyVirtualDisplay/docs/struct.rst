Hierarchy
==================================

.. graphviz::

    digraph G {
    rankdir=LR;
    node [fontsize=8,style=filled, fillcolor=white];
    fontsize=8;

    subgraph cluster_0 {
        label = "pyvirtualdisplay";
        style=filled;
        subgraph cluster_2 {
            style=filled;
            fillcolor=white;
            label = "wrappers";

            XvfbDisplay;
            XephyrDisplay;
            XvncDisplay;
        }
        Display -> XvfbDisplay;
        Display -> XephyrDisplay;
        Display -> XvncDisplay;
        SmartDisplay -> Display
    }
    XvfbDisplay -> Xvfb;
    XephyrDisplay -> Xephyr;
    XvncDisplay -> Xvnc;

    application -> Display;
    application -> SmartDisplay;

	SmartDisplay -> pyscreenshot;
	SmartDisplay -> PIL;
	
    }
