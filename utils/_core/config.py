#
# The XBUILD configuration file.
#
# (c) 2012 The XTK Developers <dev@goXTK.com>
#

import os
import sys
import tempfile


# STRINGS
SOFTWARE = 'The X Toolkit'
SOFTWARE_SHORT = 'XTK'
SOFTWARE_DESCRIPTION = 'XTK is a WebGL framework providing an easy-to-use API to visualize scientific data on the web.<br>No background or knowledge in Computer Graphics is required.'
SOFTWARE_HOMEPAGE = 'http://goXTK.com'

NAMESPACE = 'X'

LICENSE_HEADER = '''/*
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
 * FUELED BY:
 *  - the wonderful Constructive Solid Geometry library by Evan Wallace (http://madebyevan.com)
 *    LICENSE: https://raw.github.com/xtk/X/master/lib/csg/LICENSE
 *
 *  - parts of the Google Closure Library (http://code.google.com/closure/library)
 *    LICENSE: https://raw.github.com/xtk/google-closure-library/master/LICENSE
 *
 *  - zlib.js, the ultimate gzip/zlib javascript implementation (https://github.com/imaya/zlib.js)
 *    LICENSE: https://raw.github.com/imaya/zlib.js/master/LICENSE
 *
 * MORE CREDITS: https://raw.github.com/xtk/X/master/LICENSE
 *
 */'''


# PATHS
EXCLUDES_PATH = ['lib', 'testing', 'deps', 'utils']
INCLUDES_PATH = ['csg', 'zlib.js']  # force inclusion of sub folders in an excluded directory for dependency generation

REPOSITORY_URL = 'https://github.com/xtk/X/blob/master/'

CDASH_SUBMIT_URL = 'http://x.babymri.org/cdash/submit.php?project=' + SOFTWARE_SHORT

XBUILD_PATH = os.path.abspath( os.path.dirname( sys.argv[0] ) )
SOFTWARE_PATH = os.path.normpath( XBUILD_PATH + os.sep + '..' + os.sep )

CLOSURELIBRARY_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'lib/google-closure-library/closure/' ) )
CLOSURELIBRARY_DEPS_PATH = os.path.normpath( os.path.join( CLOSURELIBRARY_PATH, 'goog/deps.js' ) )
CLOSURELIBRARY_PYTHON_PATH = os.path.normpath( os.path.join( CLOSURELIBRARY_PATH, 'bin/build/' ) )
CLOSUREBUILDER_PATH = os.path.normpath( os.path.join( CLOSURELIBRARY_PYTHON_PATH, 'closurebuilder.py' ) )
CLOSUREDEPSWRITER_PATH = os.path.normpath( os.path.join( CLOSURELIBRARY_PYTHON_PATH, 'depswriter.py' ) )
CLOSURECOMPILER_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'lib/google-closure-compiler/compiler.jar' ) )
CLOSUREGOOGBASE_PATH = os.path.normpath( os.path.join( CLOSURELIBRARY_PATH, 'goog/base.js' ) )

DOC_TEMPLATES_PATH = os.path.normpath( os.path.join( XBUILD_PATH, '_core', 'templates/' ) )

BUILD_OUTPUT_PATH = os.path.normpath( os.path.join( XBUILD_PATH , SOFTWARE_SHORT.lower() + '.js' ) )
DEPS_OUTPUT_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH , SOFTWARE_SHORT.lower() + '-deps.js' ) )
DOC_OUTPUT_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH , 'doc/' ) )

UNIT_TESTS = os.path.normpath( os.sep + 'testing' + os.sep + SOFTWARE_SHORT.lower() + '_tests.html' )
UNIT_TESTS_BUILD = os.path.normpath( os.sep + 'testing' + os.sep + SOFTWARE_SHORT.lower() + '_tests_build.html' )
VISUAL_TESTS_BASEPATH = os.sep + 'testing' + os.sep + 'visualization' + os.sep
VISUAL_TESTS = ['test_image.html', 'test_binstl.html', 'test_mgh.html', 'test_nii.html', 'test_fsm_crv.html', 'test_fsm_label.html', 'test_dcm.html', 'test_shapes.html', 'test_trk.html', 'test_vtk.html', 'test_labelmap.html', 'test_mgz.html', 'test_nrrd.html', 'test_stl.html', 'test_vr.html', 'test_obj.html']

VISUAL_BASELINES_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'testing/visualization/baselines/' ) )
JSCOVERAGE_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'lib/jscoverage/' ) )
JSCOVERAGE_OUTPUT_PATH = os.path.normpath( os.path.join( tempfile.gettempdir(), 'xbuild_coverage/' ) )
JSCOVERAGE_ARGUMENTS = " --report-dir=" + JSCOVERAGE_OUTPUT_PATH + " --document-root=" + SOFTWARE_PATH + " --no-instrument=/lib/ --no-instrument=/testing/ --no-instrument=/utils/ --no-instrument=/core/testing/ --no-instrument=/math/testing/ --no-instrument=xtk-deps.js &"
SELENIUM_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'lib/selenium/' ) )
SELENIUM_CHROMEDRIVER_PATH = os.path.normpath( os.path.join( SELENIUM_PATH, 'chromedrivers/' ) )
PYPNG_PATH = os.path.normpath( os.path.join( SOFTWARE_PATH, 'lib/pypng-0.0.9/code' ) )

TEMP_PATH = tempfile.gettempdir()
